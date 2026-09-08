var modifier = (text) => {
  try {
    let cleanedText = text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    // 1. Handle Automatic Pause Menu (Reflection Turn)
    if (state.attachLink && state.attachLink.isReflecting) {
      const charName = state.attachLink.reflectingCharacter;
      
      const thoughtPattern = /(?:^|\n)\s*[\(\[\*]*\s*([^:\n\r]+?)(?:'s)?\s*AttachLink\s*[:=\-]\s*([^\n\r]+?)[\)\]\*]*(?:\n+|$)/i;
      const thoughtMatch = cleanedText.match(thoughtPattern);

      if (thoughtMatch) {
        const payload = thoughtMatch[2].trim();
        const parts = payload.split('|');
        const rawThought = parts[0].trim().replace(/^["“']|["”']$/g, '');
        
        if (rawThought && rawThought.length >= 4) {
          const charData = AttachLink.ensureCharacter(charName, state);
          charData.coreMemory = rawThought;
        }

        const agendaMatch = payload.match(/Agenda\s*[:=\-]\s*["“']?([^"”\n\r|]+?)["”']?(?:$|[|,\)])/i);
        if (agendaMatch) {
          const charData = AttachLink.ensureCharacter(charName, state);
          const agendaText = agendaMatch[1].trim();
          if (agendaText && agendaText.length >= 4) charData.agenda = agendaText;
        }

        const moodMatch = payload.match(/Mood\s*[:=\-]\s*["“']?([a-zA-Z\s]+?)["”']?(?:$|[|,\)])/i);
        const bondMatch = payload.match(/Bond\s*[:=\-]\s*([=+\-]?\d+)/i);
        const romanceMatch = payload.match(/Romance\s*[:=\-]\s*([=+\-]?\d+)/i);

        const deltas = {};
        if (moodMatch) deltas.mood = moodMatch[1].trim();
        if (bondMatch) {
          const raw = bondMatch[1].trim();
          if (raw.startsWith("+") || raw.startsWith("-")) {
            deltas.bond = parseInt(raw, 10);
            deltas.isAbsoluteBond = false;
          } else {
            deltas.bond = parseInt(raw.replace(/^=/, ''), 10);
            deltas.isAbsoluteBond = true;
          }
        }
        if (romanceMatch) {
          const raw = romanceMatch[1].trim();
          if (raw.startsWith("+") || raw.startsWith("-")) {
            deltas.romance = parseInt(raw, 10);
            deltas.isAbsoluteRomance = false;
          } else {
            deltas.romance = parseInt(raw.replace(/^=/, ''), 10);
            deltas.isAbsoluteRomance = true;
          }
        }

        AttachLink.applyDeltas(state, charName, deltas);
      }

      // Reset reflection state
      state.attachLink.turnsSinceReflection = 0;
      state.attachLink.isReflecting = false;
      state.attachLink.reflectingCharacter = null;
      
      // Override output with pause message
      cleanedText = `\n\n>>> 🧠 [AttachLink Update] ${charName || "The characters are"} reflecting on your actions... Relationship updated! Please press continue to resume the story. <<<\n`;
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