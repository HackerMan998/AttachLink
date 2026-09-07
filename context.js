const modifier = (text) => {
  // 1. Clean previous thought leaks from recent text
  let cleanedText = text.replace(/(?:^|\n)\s*[\(\[\*]*\s*[a-zA-Z]+(?:'s)?\s*AttachLink(?:\s*(?:Consolidation|Summary))?\s*[:=\-][^\n]*\n*/gi, "\n\n").trim();

  // 2. Identify active character
  const activeChar = AttachLink.resolveActiveCharacter(state, history);
  let finalText = cleanedText;

  if (activeChar) {
    const charData = AttachLink.ensureCharacter(activeChar, state);

    // Inject relationship context into high-priority frontMemory
    const emotionalContext = AttachLink.getPromptContext(state);
    state.memory = state.memory || {};
    state.memory.frontMemory = emotionalContext;

    // 3. Check for Consolidation Summary (at 5 thoughts) or Regular Thought
    if (charData.thoughts.length >= AttachLinkConfig.MAX_THOUGHTS_BEFORE_SUMMARY) {
      const thoughtsBundle = charData.thoughts.join(" | ");
      const taskPrompt = `\n\n[Task: Begin output strictly with (${activeChar}'s AttachLink Summary: "One brief sentence synthesizing your recent feelings (${thoughtsBundle}) into a core realization"). Then continue the story.]\n`;
      finalText = cleanedText + taskPrompt;
    } else {
      const shouldThink = Math.random() * 100 < AttachLinkConfig.thoughtChancePercent;
      if (shouldThink) {
        const taskPrompt = `\n\n[Task: Begin output strictly with (${activeChar}'s AttachLink: "one brief sentence in first person reflecting your private thoughts about what just happened"). Then continue the story.]\n`;
        finalText = cleanedText + taskPrompt;
      }
    }
  }

  return { text: finalText };
};

modifier(text);