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

      // 3. Inject Thought or Consolidation prompt (defer on turn 0 so opening prompt generates cleanly)
      let taskPrompt = "";
      if (currentAction > 0) {
        if (charData.thoughts.length >= AttachLinkConfig.MAX_THOUGHTS_BEFORE_SUMMARY) {
          const thoughtsBundle = charData.thoughts.join(" | ");
          taskPrompt = `\n\n[Task: Begin output strictly with (${activeChar}'s AttachLink Summary: "One brief sentence synthesizing your recent feelings (${thoughtsBundle}) into a core impression" | Agenda: "One brief sentence describing your active secret goal or intention"). Then continue the story.]\n`;
        } else {
          const shouldThink = Math.random() * 100 < AttachLinkConfig.thoughtChancePercent;
          if (shouldThink) {
            taskPrompt = `\n\n[Task: Begin output strictly with (${activeChar}'s AttachLink: "one brief sentence in first person reflecting your private thoughts" | Mood: [current emotion] | Bond: [+/-0-1] | Romance: [+/-0-1]). Then continue the story.]\n`;
          }
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