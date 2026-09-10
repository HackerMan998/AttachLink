var modifier = (text) => {
  try {
    if (typeof AttachLink !== 'undefined') {
      AttachLink.init(state);
      AttachLink.readSettingsFromConsoleCard(state);

      // 1. Identify active character in the scene
      AttachLink.resolveActiveCharacter(state, history);

      var trimmed = text.trim();

      // Command: /tone [mode] (e.g. /tone gritty, /tone romance, /tone balanced, /tone political)
      var toneMatch = trimmed.match(/^\/?tone(?:\s+(.+))?$/i);
      if (toneMatch) {
        var chosenTone = toneMatch[1] ? toneMatch[1].trim().toLowerCase() : "";
        if (["balanced", "gritty", "romance", "political"].includes(chosenTone)) {
          state.attachLink.tone = chosenTone;
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] Story Tone set to: ${chosenTone.toUpperCase()}.\n• Reflection directives and relationship dynamics updated.`;
        } else {
          var curTone = (state.attachLink && state.attachLink.tone) || "balanced";
          state.message = `[AttachLink Tone] Current: ${curTone.toUpperCase()}\nUsage: /tone [balanced | gritty | romance | political]\n• gritty: Cynical, slow trust, betrayal tracking, harsh consequences.\n• balanced: Natural human behavior, fair boundaries, steady pacing.\n• romance: Emotional intimacy, passion, vulnerability, chemistry.\n• political: Transactional loyalties, faction leverage, intrigue.`;
        }
        return { text: "", stop: true };
      }

      // Command: /romance [on|off] (e.g. /romance off, /romance on)
      var romanceMatch = trimmed.match(/^\/?romance(?:\s+(.+))?$/i);
      if (romanceMatch) {
        var arg = romanceMatch[1] ? romanceMatch[1].trim().toLowerCase() : "";
        if (["off", "disable", "disabled", "hide", "hidden"].includes(arg)) {
          state.attachLink.romanceMode = "disabled";
          AttachLink.syncAllStoryCards(state);
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] Romance Track DISABLED.\n• Heart gauges and romance directives hidden globally across all cards.`;
        } else if (["on", "enable", "enabled", "show"].includes(arg)) {
          state.attachLink.romanceMode = "enabled";
          AttachLink.syncAllStoryCards(state);
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] Romance Track ENABLED.\n• Heart gauges and romantic chemistry active.`;
        } else {
          var curRomance = (state.attachLink && state.attachLink.romanceMode) || "enabled";
          state.message = `[AttachLink Romance] Currently: ${curRomance.toUpperCase()}\nUsage: /romance [on | off]\n• on: Shows heart gauges and tracks romantic chemistry.\n• off: Completely removes romance from all story cards and reflection directives.`;
        }
        return { text: "", stop: true };
      }

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
        var tone = (state.attachLink && state.attachLink.tone) || "balanced";
        var romance = (state.attachLink && state.attachLink.romanceMode) || "enabled";
        state.message = `[AttachLink Status] Active NPC: "${active}" | Turn ${turns}/${maxTurns} (${remaining} until auto-pause) | Tone: ${tone.toUpperCase()} | Romance: ${romance.toUpperCase()}`;
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

      // Command: /attachlink or /al or /help
      if (trimmed.match(/^\/?(?:attachlink|al)(?:\s+help)?$/i)) {
        state.message = `[AttachLink Engine Commands]\n` +
          `• /tone [mode]      : Set tone (balanced, gritty, romance, political)\n` +
          `• /romance [on|off] : Enable or disable romance gauges globally\n` +
          `• /reflect [Name]   : Trigger immediate relationship reflection\n` +
          `• /track [Name]     : Add companion card for an unlisted NPC\n` +
          `• /status           : View current settings and countdown`;
        return { text: "", stop: true };
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