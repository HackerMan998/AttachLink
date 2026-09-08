var modifier = (text) => {
  try {
    let cleanedText = text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    // 1. Check for Summary Consolidation: (Name's AttachLink Summary: "..." | Agenda: "...")
    const summaryPattern = /(?:^|\n)\s*[\(\[\*]*\s*([^:\n\r]+?)(?:'s)?\s*AttachLink\s*(?:Summary|Consolidation)\s*[:=\-]\s*([^\n\r]+?)[\)\]\*]*(?:\n+|$)/i;
    const summaryMatch = cleanedText.match(summaryPattern);

    if (summaryMatch) {
      const charName = summaryMatch[1].trim();
      const payload = summaryMatch[2].trim();

      // Extract core summary (first part before pipe or entire text)
      const parts = payload.split('|');
      const summaryText = parts[0].trim().replace(/^["“']|["”']$/g, '');

      // Extract optional Agenda
      const agendaMatch = payload.match(/Agenda\s*[:=\-]\s*["“']?([^"”\n\r|]+?)["”']?(?:$|[|,\)])/i);
      const agendaText = agendaMatch ? agendaMatch[1].trim() : "";

      AttachLink.setConsolidatedMemory(state, charName, summaryText, agendaText);
      cleanedText = cleanedText.replace(summaryMatch[0], "").trimStart();
    } else {
      // 2. Check for Regular Thought: (Name's AttachLink: "..." | Mood: ... | Bond: ... | Romance: ...)
      const thoughtPattern = /(?:^|\n)\s*[\(\[\*]*\s*([^:\n\r]+?)(?:'s)?\s*AttachLink\s*[:=\-]\s*([^\n\r]+?)[\)\]\*]*(?:\n+|$)/i;
      const thoughtMatch = cleanedText.match(thoughtPattern);

      if (thoughtMatch) {
        const charName = thoughtMatch[1].trim();
        const payload = thoughtMatch[2].trim();

        // Extract raw thought (before any pipe indicators)
        const parts = payload.split('|');
        const rawThought = parts[0].trim().replace(/^["“']|["”']$/g, '');

        AttachLink.addThought(state, charName, rawThought);

        // Extract Agentic Deltas & Mood
        const moodMatch = payload.match(/Mood\s*[:=\-]\s*["“']?([a-zA-Z\s]+?)["”']?(?:$|[|,\)])/i);
        const bondMatch = payload.match(/Bond\s*[:=\-]\s*([+\-]?\d+)/i);
        const romanceMatch = payload.match(/Romance\s*[:=\-]\s*([+\-]?\d+)/i);

        let hasExplicitDeltas = false;
        const deltas = {};

        if (moodMatch) {
          deltas.mood = moodMatch[1].trim();
        }
        if (bondMatch) {
          deltas.bond = parseInt(bondMatch[1], 10);
          hasExplicitDeltas = true;
        }
        if (romanceMatch) {
          deltas.romance = parseInt(romanceMatch[1], 10);
          hasExplicitDeltas = true;
        }

        if (hasExplicitDeltas || deltas.mood) {
          AttachLink.applyDeltas(state, charName, deltas);
        } else {
          // Fallback to keyword scanning if the model omitted deltas
          AttachLink.updateMeters(cleanedText, state);
        }

        cleanedText = cleanedText.replace(thoughtMatch[0], "").trimStart();
      }
    }

    // Secondary leak cleaner pass to guarantee zero immersion breaks
    cleanedText = AttachLink.cleanContextLeaks(cleanedText);

    // Sync updated Story Card for active character
    if (state.attachLink && state.attachLink.activeChar) {
      AttachLink.syncStoryCard(state, state.attachLink.activeChar);
    }

    return { text: cleanedText };
  } catch (err) {
    // Fail-safe: Always return cleanedText or original text without crashing
    return { text };
  }
};

modifier(text);