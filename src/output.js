var modifier = (text) => {
  try {
    let cleanedText = text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    // 1. Handle Command Messages (e.g. /status, /track, or helpful notices)
    if (state.attachLink && state.attachLink.commandMessage) {
      cleanedText = `\n\n>>> 💡 [AttachLink System] ${state.attachLink.commandMessage} Please press continue to resume. <<<\n`;
      delete state.attachLink.commandMessage;
      if (state.attachLink && state.attachLink.characters) {
        for (var cName of Object.keys(state.attachLink.characters)) {
          AttachLink.syncStoryCard(state, cName);
        }
      }
      AttachLink.syncSystemConsoleCard(state);
      return { text: cleanedText };
    }

    // 2. Handle Automatic or Manual Pause Menu (Reflection Turn)
    if (state.attachLink && state.attachLink.isReflecting) {
      const charName = state.attachLink.reflectingCharacter || state.attachLink.activeChar;
      
      const parsed = AttachLink.parseReflection(cleanedText, charName, (typeof history !== 'undefined' ? history : []));

      if (parsed && (parsed.thought || parsed.bond !== undefined || parsed.mood)) {
        const charData = AttachLink.ensureCharacter(charName, state);
        if (parsed.thought && parsed.thought.length >= 4) {
          if (charData.coreMemory && charData.coreMemory !== parsed.thought && !/deep thoughts|thoughts about the protagonist/i.test(charData.coreMemory)) {
            charData.thoughts = charData.thoughts || [];
            if (!charData.thoughts.includes(charData.coreMemory)) {
              charData.thoughts.unshift(charData.coreMemory);
              if (charData.thoughts.length > 5) charData.thoughts.pop();
            }
          }
          charData.coreMemory = parsed.thought;
        }
        if (parsed.agenda && parsed.agenda.length >= 3) {
          charData.agenda = parsed.agenda;
        }
        AttachLink.applyDeltas(state, charName, {
          mood: parsed.mood,
          bond: parsed.bond,
          isAbsoluteBond: parsed.isAbsoluteBond,
          romance: parsed.romance,
          isAbsoluteRomance: parsed.isAbsoluteRomance
        });
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

    // Sync updated Story Cards for all tracked characters
    if (state.attachLink && state.attachLink.characters) {
      for (var cName of Object.keys(state.attachLink.characters)) {
        AttachLink.syncStoryCard(state, cName);
      }
    }

    // Always update the live System Console Story Card!
    AttachLink.syncSystemConsoleCard(state);

    return { text: cleanedText };
  } catch (err) {
    // Fail-safe: Always return cleanedText or original text without crashing
    return { text };
  }
};

modifier(text);