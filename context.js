var modifier = (text) => {
  try {
    // 1. Clean previous thought leaks from recent text
    let cleanedText = typeof AttachLink !== 'undefined' && AttachLink.cleanContextLeaks
      ? AttachLink.cleanContextLeaks(text)
      : text;

    // 2. Identify active character
    const activeChar = typeof AttachLink !== 'undefined'
      ? AttachLink.resolveActiveCharacter(state, history)
      : null;

    let finalText = cleanedText;

    if (activeChar && typeof AttachLink !== 'undefined') {
      const charData = AttachLink.ensureCharacter(activeChar, state);
      const currentAction = (typeof info !== 'undefined' && info.actionCount) ? info.actionCount : 0;

      // Inject relationship & cognitive context into frontMemory
      const emotionalContext = AttachLink.getPromptContext(state);
      if (typeof state.memory === 'string') {
        if (!state.memory.includes("[AttachLink:")) {
          state.memory = emotionalContext + (state.memory ? "\n" + state.memory : "");
        }
      } else {
        state.memory = state.memory || {};
        state.memory.frontMemory = emotionalContext;
      }

      // 3. Check for automatic pause menu reflection
      let taskPrompt = "";
      if (currentAction > 0) {
        if (state.attachLink.turnsSinceReflection >= AttachLinkConfig.reflectionCooldown) {
          state.attachLink.isReflecting = true;
          state.attachLink.reflectingCharacter = activeChar;
          taskPrompt = `\n\n[Task: STOP THE STORY. Review the opening scenario, Plot Essentials, and ${activeChar}'s character lore. Write an inner monologue for ${activeChar} reflecting on their relationship with the protagonist, then output their relationship stats. Format strictly as: (${activeChar}'s AttachLink: "deep thoughts" | Mood: [current emotion] | Agenda: [current secret goal] | Bond: [+/-N or =N] | Romance: [+/-N or =N]). Do NOT continue the story or write dialogue.]\n`;
        }
      }

      if (taskPrompt) {
        // Ensure prompt fits within model context budget before appending
        const fittedBase = AttachLink.fitContext(cleanedText, taskPrompt.length);
        finalText = fittedBase + taskPrompt;
      }
    }

    return { text: finalText };
  } catch (err) {
    // Fail-safe: Never crash scenario context generation
    return { text };
  }
};

modifier(text);