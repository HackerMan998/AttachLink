const modifier = (text) => {
  let cleanedText = text;

  // 1. Check for Summary Consolidation: (Name's AttachLink Summary: "...")
  const summaryPattern = /(?:^|\n)\s*[\(\[\*]*\s*([a-zA-Z]+)(?:'s)?\s*AttachLink\s*(?:Summary|Consolidation)\s*[:=\-]\s*[\*]*\s*["“]?([^"”\n\r]+)["”]?\s*[\)\]\*]*(?:\n+|$)/i;
  const summaryMatch = cleanedText.match(summaryPattern);

  if (summaryMatch) {
    const charName = summaryMatch[1];
    const summaryText = summaryMatch[2].trim();

    AttachLink.setConsolidatedMemory(state, charName, summaryText);
    cleanedText = cleanedText.replace(summaryMatch[0], "").trimStart();
  } else {
    // 2. Check for Regular Thought: (Name's AttachLink: "...")
    const thoughtPattern = /(?:^|\n)\s*[\(\[\*]*\s*([a-zA-Z]+)(?:'s)?\s*AttachLink\s*[:=\-]\s*[\*]*\s*["“]?([^"”\n\r]+)["”]?\s*[\)\]\*]*(?:\n+|$)/i;
    const thoughtMatch = cleanedText.match(thoughtPattern);

    if (thoughtMatch) {
      const charName = thoughtMatch[1];
      const rawThought = thoughtMatch[2].trim();

      AttachLink.addThought(state, charName, rawThought);
      cleanedText = cleanedText.replace(thoughtMatch[0], "").trimStart();
    }
  }

  // 3. Update meters based on narrative & sync Story Card
  AttachLink.updateMeters(cleanedText, state);

  if (state.attachLink && state.attachLink.activeChar) {
    AttachLink.syncStoryCard(state, state.attachLink.activeChar);
  }

  return { text: cleanedText };
};

modifier(text);