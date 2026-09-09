var modifier = (text) => {
  try {
    // 1. Clean previous thought leaks from recent text
    let cleanedText = typeof AttachLink !== 'undefined' && AttachLink.cleanContextLeaks
      ? AttachLink.cleanContextLeaks(text)
      : text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    AttachLink.init(state);

    // 2. Identify active character or manual reflection target
    const activeChar = AttachLink.resolveActiveCharacter(state, history);
    const targetChar = (state.attachLink && state.attachLink.reflectingCharacter) || activeChar;

    let finalText = cleanedText;

    if (targetChar) {
      const charData = AttachLink.ensureCharacter(targetChar, state);
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

      // 3. Check for automatic or manual pause menu reflection
      let taskPrompt = "";
      const isReflecting = state.attachLink && state.attachLink.isReflecting;
      const turns = (state.attachLink && state.attachLink.turnsSinceReflection) || 0;

      if (isReflecting || (currentAction > 0 && turns >= AttachLinkConfig.reflectionCooldown)) {
        state.attachLink.isReflecting = true;
        state.attachLink.reflectingCharacter = state.attachLink.reflectingCharacter || targetChar;
        taskPrompt = `\n\n[Task: STOP THE STORY & REFLECT. Step into the mind of ${targetChar} and evaluate their authentic feelings, skepticism, and agency regarding recent events with the protagonist.
Write ${targetChar}'s authentic, unfiltered first-person inner monologue in quotes (their genuine thoughts, doubts, pride, or emotional reactions).

CRITICAL CHARACTER AGENCY RULES:
• Maintain Independent Agency: ${targetChar} has their own pride, goals, boundaries, and skepticism. They do NOT automatically become loyal, obedient, or infatuated just because the protagonist talks to them or acts politely.
• Anti-Sycophancy (Realistic Pacing): Most casual conversations, polite banter, or everyday actions MUST result in Bond: +0 and Romance: +0 (No change).
• Bond (+1): Earned ONLY through proven sacrifice, major shared trials, deep vulnerability, or keeping critical promises.
• Bond (-1 to -2): Decreased by manipulation, disrespect, broken promises, suspicious behavior, or hostility.
• Romance (+1): Earned ONLY through explicit romantic chemistry, mutual flirtation, passion, or physical intimacy. Never advance romance from mere friendly talk.
• Secret Agenda: What does ${targetChar} secretly desire or want for THEMSELVES next (e.g. self-preservation, testing the protagonist, personal ambition)?

Format strictly as:
(${targetChar}'s AttachLink: "[1-3 sentences of genuine inner monologue reacting directly to the recent scene]" | Mood: [Emotion] | Agenda: [Their personal secret desire or next goal] | Bond: [+0, +1, -1, etc.] | Romance: [+0, +1, etc.])
Rules:
• Do NOT copy bracket placeholders. Write genuine thoughts for ${targetChar}.
• Do NOT continue the story or write dialogue.]\n`;
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