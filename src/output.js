var modifier = (text) => {
  try {
    let cleanedText = text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    // 1. Handle Command Messages (e.g. /status, /track, or helpful notices)
    if (state.attachLink && state.attachLink.commandMessage) {
      cleanedText = `\n\n>>> 💡 [AttachLink System] ${state.attachLink.commandMessage} Please press continue to resume. <<<\n\n`;
      state.attachLink.justReflected = true;
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
      const rawCharName = state.attachLink.reflectingCharacter || state.attachLink.activeChar;
      const charName = AttachLink.cleanCharacterName(rawCharName);
      
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

      // Reset reflection state & flag to guarantee clean line jumps on continuation
      state.attachLink.turnsSinceReflection = 0;
      state.attachLink.isReflecting = false;
      state.attachLink.reflectingCharacter = null;
      state.attachLink.justReflected = true;
      
      const charData = AttachLink.ensureCharacter(charName, state);
      const moodText = (charData && charData.mood) ? ` | Mood: ${charData.mood}` : "";
      const bondVal = charData ? (charData.bond > 0 ? `+${charData.bond}` : charData.bond) : "";
      const bondText = bondVal !== "" ? ` | Bond: ${bondVal}` : "";
      const isRomanceDisabled = (state.attachLink && state.attachLink.romanceMode === "disabled");
      const romanceText = (!isRomanceDisabled && charData && typeof charData.romance !== 'undefined') ? ` | Romance: ${charData.romance}/5` : "";
      
      // Override output with pause message
      cleanedText = `\n\n>>> 🧠 [AttachLink Update] ${charName || "Companion"} reflected: Relationship updated${moodText}${bondText}${romanceText}! Press continue to resume the story. <<<\n\n`;
    } else {
      // If previous turn was a reflection pause or system notice, guarantee continuation starts on a fresh double-spaced paragraph
      if (state.attachLink && state.attachLink.justReflected) {
        state.attachLink.justReflected = false;
        cleanedText = "\n\n" + cleanedText.trimStart();
      }
      // Secondary leak cleaner pass on normal story output to guarantee zero immersion breaks
      cleanedText = AttachLink.cleanContextLeaks(cleanedText);
    }

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