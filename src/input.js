var modifier = (text) => {
  try {
    if (typeof AttachLink !== 'undefined') {
      AttachLink.init(state);

      // 1. Identify active character in the scene
      AttachLink.resolveActiveCharacter(state, history);

      var trimmed = text.trim();

      // Command: /track [Name] (e.g. /track Vera or track Vera)
      var trackMatch = trimmed.match(/^\/?track(?:\s+(.+))?$/i);
      if (trackMatch) {
        var targetName = trackMatch[1] ? trackMatch[1].trim() : "";
        if (!targetName) targetName = AttachLink.findProminentNameInScene(history);
        if (targetName) {
          var charData = AttachLink.ensureCharacter(targetName, state);
          var actualName = charData ? charData.name : targetName;
          state.attachLink.activeChar = actualName;
          AttachLink.syncStoryCard(state, actualName);
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] Now tracking ${actualName}! A companion AttachLink card has been created.`;
        } else {
          state.message = `[AttachLink] Please specify a character to track, e.g. /track Vera`;
        }
        return { text: "", stop: true };
      }

      // Command: /status or status
      if (trimmed.match(/^\/?status$/i)) {
        var turns = (state.attachLink && state.attachLink.turnsSinceReflection) || 0;
        var maxTurns = AttachLinkConfig.reflectionCooldown || 15;
        var remaining = Math.max(0, maxTurns - turns);
        var active = (state.attachLink && state.attachLink.activeChar) || "None";
        state.message = `[AttachLink Status] Active NPC: "${active}" | Turn ${turns}/${maxTurns} (${remaining} turns until auto-pause)`;
        AttachLink.syncSystemConsoleCard(state);
        return { text: "", stop: true };
      }

      // Command: /reflect [Optional Name] (e.g. /reflect, reflect, or /reflect Vera)
      var reflectMatch = trimmed.match(/^\/?reflect(?:\s+(.+))?$/i);
      if (reflectMatch) {
        var targetName = reflectMatch[1] ? reflectMatch[1].trim() : "";
        if (!targetName) {
          targetName = (state.attachLink && state.attachLink.activeChar) || AttachLink.findProminentNameInScene(history);
        }

        if (targetName) {
          var charData = AttachLink.ensureCharacter(targetName, state);
          var actualName = charData ? charData.name : targetName;
          state.attachLink.activeChar = actualName;
          state.attachLink.isReflecting = true;
          state.attachLink.reflectingCharacter = actualName;
          state.attachLink.turnsSinceReflection = AttachLinkConfig.reflectionCooldown;
          AttachLink.syncSystemConsoleCard(state);
          // Return non-empty action so AI Dungeon executes reflection immediately without error!
          return { text: `[${actualName} reflects on recent events]` };
        } else {
          state.message = `[AttachLink] No active character detected in scene. Type '/reflect [Name]' (e.g. /reflect Vera) or create a Character Story Card.`;
          AttachLink.syncSystemConsoleCard(state);
          return { text: "", stop: true };
        }
      }

      // Normal turn: increment turn counter
      state.attachLink.turnsSinceReflection = (state.attachLink.turnsSinceReflection || 0) + 1;
      AttachLink.syncSystemConsoleCard(state);
    }
    return { text };
  } catch (err) {
    return { text };
  }
};

modifier(text);