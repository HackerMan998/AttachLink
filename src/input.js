var modifier = (text) => {
  try {
    if (typeof AttachLink !== 'undefined') {
      AttachLink.init(state);

      // 1. Identify active character in the scene
      AttachLink.resolveActiveCharacter(state, history);

      var trimmed = text.trim();

      // Command: /track [Name] (e.g. /track Vera)
      var trackMatch = trimmed.match(/^\/track(?:\s+(.+))?$/i);
      if (trackMatch) {
        var targetName = trackMatch[1] ? trackMatch[1].trim() : "";
        if (!targetName) targetName = AttachLink.findProminentNameInScene(history);
        if (targetName) {
          var charData = AttachLink.ensureCharacter(targetName, state);
          var actualName = charData ? charData.name : targetName;
          state.attachLink.activeChar = actualName;
          AttachLink.syncStoryCard(state, actualName);
          AttachLink.syncSystemConsoleCard(state);
          state.attachLink.commandMessage = `Now tracking ${actualName}! A companion AttachLink card has been created.`;
        } else {
          state.attachLink.commandMessage = `Please specify a character to track, e.g. /track Vera`;
        }
        return { text: "" };
      }

      // Command: /status
      if (trimmed.match(/^\/status$/i)) {
        var turns = (state.attachLink && state.attachLink.turnsSinceReflection) || 0;
        var maxTurns = AttachLinkConfig.reflectionCooldown || 15;
        var remaining = Math.max(0, maxTurns - turns);
        var active = (state.attachLink && state.attachLink.activeChar) || "None";
        state.attachLink.commandMessage = `Status: Active NPC is "${active}". Turn ${turns}/${maxTurns} (${remaining} turns until automatic pause).`;
        AttachLink.syncSystemConsoleCard(state);
        return { text: "" };
      }

      // Command: /reflect [Optional Name] (e.g. /reflect or /reflect Vera)
      var reflectMatch = trimmed.match(/^\/reflect(?:\s+(.+))?$/i);
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
          return { text: "" };
        } else {
          state.attachLink.commandMessage = `No active character detected in scene. Type '/reflect [Name]' (e.g. /reflect Vera) or create a Character Story Card.`;
          AttachLink.syncSystemConsoleCard(state);
          return { text: "" };
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