var modifier = (text) => {
  try {
    if (typeof AttachLink !== 'undefined') {
      AttachLink.init(state);
      AttachLink.readSettingsFromConsoleCard(state);

      // 1. Identify active character in the scene
      AttachLink.resolveActiveCharacter(state, history);

      var trimmed = text.trim();

      // Command: /tone [mode] (e.g. /tone gritty, /tone romance, /tone balanced, /tone political, /tone comedy, /tone horror)
      var toneMatch = trimmed.match(/^\/?tone(?:\s+(.+))?$/i);
      if (toneMatch) {
        var chosenTone = toneMatch[1] ? toneMatch[1].trim().toLowerCase() : "";
        if (["balanced", "gritty", "romance", "political", "comedy", "horror"].includes(chosenTone)) {
          state.attachLink.tone = chosenTone;
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] Story Tone set to: ${chosenTone.toUpperCase()}.\n• Reflection directives and relationship dynamics updated.`;
        } else {
          var curTone = (state.attachLink && state.attachLink.tone) || "balanced";
          state.message = `[AttachLink Tone] Current: ${curTone.toUpperCase()}\nUsage: /tone [balanced | gritty | romance | political | comedy | horror]\n• balanced: Natural human behavior, fair boundaries, steady pacing.\n• gritty: Cynical, slow trust, betrayal tracking, harsh consequences.\n• romance: Emotional intimacy, passion, vulnerability, chemistry.\n• political: Transactional loyalties, faction leverage, intrigue.\n• comedy: Playful banter, witty sarcasm, comedic friction.\n• horror: Psychological dread, paranoia, fear responses, fragile trust.`;
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

      // Command: /untrack [Name] or /forget [Name]
      var untrackMatch = trimmed.match(/^\/?(?:untrack|forget)(?:\s+(.+))?$/i);
      if (untrackMatch) {
        var targetName = untrackMatch[1] ? untrackMatch[1].trim() : (state.attachLink.activeChar || "");
        if (targetName) {
          var removed = AttachLink.untrackCharacter(targetName, state);
          state.message = `[AttachLink] Stopped tracking "${removed || targetName}". Companion card removed.`;
        } else {
          state.message = `[AttachLink] Specify a character to untrack, e.g. /untrack Vera`;
        }
        return { text: "", stop: true };
      }

      // Command: /setbond [Name] [val] or /bond [Name] [val] (e.g. /setbond Mia +1 or /setbond Mia 4)
      var bondCmdMatch = trimmed.match(/^\/?(?:setbond|bond)(?:\s+([a-zA-Z\s]+?))?\s+([=+\-]?\d+)$/i);
      if (bondCmdMatch) {
        var targetName = bondCmdMatch[1] ? bondCmdMatch[1].trim() : (state.attachLink.activeChar || "");
        var rawVal = bondCmdMatch[2].trim();
        if (targetName) {
          var charData = AttachLink.ensureCharacter(targetName, state);
          var actualName = charData ? charData.name : targetName;
          var isAbsolute = !rawVal.startsWith("+") && !rawVal.startsWith("-");
          var num = parseInt(rawVal.replace("=", ""), 10);
          AttachLink.applyDeltas(state, actualName, { bond: num, isAbsoluteBond: isAbsolute });
          AttachLink.syncStoryCard(state, actualName);
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] ${actualName}'s Bond updated to: ${charData.bond > 0 ? '+' + charData.bond : charData.bond} (${AttachLinkConfig.bondLevels[charData.bond.toString()] || 'Neutral'})`;
        } else {
          state.message = `[AttachLink] Usage: /setbond [Name] [val] (e.g. /setbond Mia +1 or /setbond Mia 4)`;
        }
        return { text: "", stop: true };
      }

      // Command: /setromance [Name] [val] (e.g. /setromance Mia 3)
      var romanceCmdMatch = trimmed.match(/^\/?(?:setromance|romanceval)(?:\s+([a-zA-Z\s]+?))?\s+([=+\-]?\d+)$/i);
      if (romanceCmdMatch) {
        var targetName = romanceCmdMatch[1] ? romanceCmdMatch[1].trim() : (state.attachLink.activeChar || "");
        var rawVal = romanceCmdMatch[2].trim();
        if (targetName) {
          var charData = AttachLink.ensureCharacter(targetName, state);
          var actualName = charData ? charData.name : targetName;
          var isAbsolute = !rawVal.startsWith("+") && !rawVal.startsWith("-");
          var num = parseInt(rawVal.replace("=", ""), 10);
          AttachLink.applyDeltas(state, actualName, { romance: num, isAbsoluteRomance: isAbsolute });
          AttachLink.syncStoryCard(state, actualName);
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] ${actualName}'s Romance updated to: ${charData.romance}/5 (${AttachLinkConfig.romanceLevels[charData.romance.toString()] || 'Platonic'})`;
        } else {
          state.message = `[AttachLink] Usage: /setromance [Name] [val] (e.g. /setromance Mia 3 or /setromance Mia +1)`;
        }
        return { text: "", stop: true };
      }

      // Command: /setmood [Name] [Mood] (e.g. /setmood Mia Anxious)
      var moodMatch = trimmed.match(/^\/?(?:setmood|mood)(?:\s+([a-zA-Z\s]+?))?\s*[:\-]\s*(.+)$/i) ||
                      trimmed.match(/^\/?(?:setmood|mood)\s+([a-zA-Z]+)\s+([a-zA-Z\s]+)$/i);
      if (moodMatch) {
        var targetName = moodMatch[1] ? moodMatch[1].trim() : (state.attachLink.activeChar || "");
        var newMood = moodMatch[2] ? moodMatch[2].trim() : "";
        if (targetName && newMood) {
          var charData = AttachLink.ensureCharacter(targetName, state);
          var actualName = charData ? charData.name : targetName;
          AttachLink.applyDeltas(state, actualName, { mood: newMood });
          AttachLink.syncStoryCard(state, actualName);
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] ${actualName}'s Mood updated to: ${charData.mood}`;
        } else {
          state.message = `[AttachLink] Usage: /setmood [Name] [Mood] (e.g. /setmood Mia Devoted)`;
        }
        return { text: "", stop: true };
      }

      // Command: /cooldown [turns] (e.g. /cooldown 10)
      var cdMatch = trimmed.match(/^\/?cooldown(?:\s+(\d+))?$/i);
      if (cdMatch) {
        if (cdMatch[1]) {
          var turns = Math.max(3, Math.min(50, parseInt(cdMatch[1], 10)));
          state.attachLink.cooldown = turns;
          AttachLink.syncSystemConsoleCard(state);
          state.message = `[AttachLink] Reflection cooldown set to every ${turns} turns.`;
        } else {
          var curCd = (state.attachLink && state.attachLink.cooldown) || AttachLinkConfig.reflectionCooldown || 15;
          state.message = `[AttachLink] Current reflection cooldown: every ${curCd} turns.\nUsage: /cooldown [number] (e.g. /cooldown 10)`;
        }
        return { text: "", stop: true };
      }

      // Command: /list or /party
      if (trimmed.match(/^\/?(?:list|party|characters)$/i)) {
        var charLines = [];
        if (state.attachLink && state.attachLink.characters) {
          for (var name in state.attachLink.characters) {
            var d = state.attachLink.characters[name];
            if (!d) continue;
            var bSign = d.bond > 0 ? `+${d.bond}` : d.bond;
            var bDesc = AttachLinkConfig.bondLevels[d.bond ? d.bond.toString() : "0"] || "Neutral";
            var rPart = state.attachLink.romanceMode === "disabled" ? "" : ` | Romance: ${d.romance || 0}/5`;
            charLines.push(`  • ${name}: Bond ${bSign} (${bDesc})${rPart} | Mood: ${d.mood || 'Neutral'}`);
          }
        }
        var partySummary = charLines.length > 0 ? charLines.join("\n") : "  • No characters tracked yet. Create a Character Card or use /track [Name].";
        state.message = `[AttachLink Tracked Party]\n${partySummary}`;
        return { text: "", stop: true };
      }

      // Command: /status or status
      if (trimmed.match(/^\/?status$/i)) {
        var turns = (state.attachLink && state.attachLink.turnsSinceReflection) || 0;
        var maxTurns = (state.attachLink && state.attachLink.cooldown) || AttachLinkConfig.reflectionCooldown || 15;
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
          var maxTurns = (state.attachLink && state.attachLink.cooldown) || AttachLinkConfig.reflectionCooldown || 15;
          state.attachLink.activeChar = actualName;
          state.attachLink.isReflecting = true;
          state.attachLink.reflectingCharacter = actualName;
          state.attachLink.turnsSinceReflection = maxTurns;
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
          `• /tone [mode]      : Set tone (balanced, gritty, romance, political, comedy, horror)\n` +
          `• /romance [on|off] : Enable or disable romance gauges globally\n` +
          `• /reflect [Name]   : Trigger immediate relationship reflection\n` +
          `• /track [Name]     : Add companion card for an unlisted NPC\n` +
          `• /untrack [Name]   : Stop tracking an NPC and delete card\n` +
          `• /setbond [N] [v]  : Set or adjust bond (e.g. /setbond Mia +1 or /setbond Mia 4)\n` +
          `• /setromance [N] [v]: Set romance level (e.g. /setromance Mia 3)\n` +
          `• /setmood [N] [m]  : Set companion mood (e.g. /setmood Mia Anxious)\n` +
          `• /cooldown [turns] : Set reflection interval (e.g. /cooldown 10)\n` +
          `• /list             : View compact summary of all tracked NPCs\n` +
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