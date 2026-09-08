/* ==========================================================================
   UNIVERSAL ATTACHLINK ENGINE v4.1 (COGNITIVE RELATIONSHIP PIPELINE)
   Works for ANY Scenario: Fantasy, Sci-Fi, Slice-of-Life, Romance, etc.
   ========================================================================== */

var AttachLinkConfig = {
  // 1. Manually specified characters (Supports multi-word names, e.g. ["Marie Onette"])
  MANUAL_CHARACTERS: [""],

  // 2. Anti-Spam Sighting Filter (Fixes the "Bartender Problem")
  // Unlisted NPCs must persist continuously across this many turns before receiving a card
  NEW_NPC_SIGHTING_THRESHOLD: 10,

  // 3. Automation Settings
  autoDetectFromStoryCards: true, // Existing character cards are tracked immediately
  autoGenerateStoryCardsForExistingNPCs: true, // Immediately generate companion AttachLink cards for all detected NPCs
  reflectionCooldown: 15,        // Turns before an automatic relationship reflection pause
  lookbackTurnsForPresence: 5,   // Actions back to check who is active in the scene

  // 4. 🎮 RELATIONSHIP PIPELINE CONFIGURATION
  // Friendship Spectrum (-5 Enemy ◄─ 0 Neutral ─► +5 Friend)
  bondLevels: {
    "-5": "Sworn Nemesis (Lethal hatred & complete hostility)",
    "-4": "Bitter Foe (Active animosity & sabotage)",
    "-3": "Open Adversary (Hostile friction & rivalry)",
    "-2": "Unfriendly (Cold dislike & tension)",
    "-1": "Distrustful (Guarded & suspicious)",
    "0":  "Neutral (Stranger / Acquaintance)",
    "1":  "Cordial (Friendly ease & polite warmth)",
    "2":  "Companion (Enjoyable company & casual friend)",
    "3":  "Reliable Friend (Supportive & trustworthy ally)",
    "4":  "Close Confidant (Deep emotional trust & vulnerability)",
    "5":  "Inseparable (Unconditional loyalty & soul-bound bond)"
  },

  // Romance Track (0 None to 5 Soulmates)
  romanceLevels: {
    "0": "Platonic (No romantic feelings)",
    "1": "Subtle Spark (Curiosity & passing butterflies)",
    "2": "Mutual Crush (Flustered & active romantic interest)",
    "3": "Lovers / Partners (Passionate romance & open affection)",
    "4": "Deep Devotion (Intense love & committed intimacy)",
    "5": "Eternal Soulmates (Bound by true, unbreakable love)"
  }
};

// Common capitalized sentence starters to ignore during candidate name detection
var BANNED_CANDIDATE_WORDS = new Set([
  "The", "A", "An", "You", "Your", "He", "She", "They", "We", "It", "Suddenly",
  "Meanwhile", "Inside", "Outside", "Then", "After", "Before", "When", "There",
  "Here", "What", "How", "Why", "Yes", "No", "Please", "Look", "Come", "Go",
  "Wait", "Stop", "Hello", "Goodbye", "Soon", "Finally", "Still", "Never", "Always"
]);

var escapeRegex = function(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Common non-character card types (100% scenario-neutral)
var NON_CHARACTER_CARD_TYPES = new Set([
  "location", "place", "area", "room", "building", "city", "world", "setting",
  "concept", "idea", "lore", "rule", "rules", "system", "mechanic", "protocol",
  "item", "object", "thing", "weapon", "armor", "equipment", "artifact",
  "vehicle", "faction", "group", "organization", "guild", "event", "quest"
]);

var CHARACTER_CARD_TYPES = new Set([
  "character", "person", "npc", "companion", "creature", "monster", "party"
]);

// ==================== CORE ENGINE ====================
var AttachLink = {
  init(state) {
    if (!state.attachLink) {
      state.attachLink = {
        characters: {},  // Active tracked characters with cards
        candidates: {},  // Sightings buffer for new, unverified NPCs
        activeChar: null,
        bootstrapped: false, // One-shot flag: create cards for all pre-existing NPC story cards
        turnsSinceReflection: 0,
        isReflecting: false,
        reflectingCharacter: null
      };
    }

    // Always purge any erroneously created non-character cards (locations, concepts, items)
    this.cleanupInvalidAttachLinkCards(state);

    // On very first run, immediately generate AttachLink cards for all named character NPCs
    if (!state.attachLink.bootstrapped) {
      state.attachLink.bootstrapped = true;
      this.bootstrapExistingNPCs(state);
    }
  },

  // Determines if a story card represents an actual character (100% scenario-neutral)
  isCharacterCard(card) {
    if (!card || !card.title) return false;
    var title = card.title.trim();

    // Never treat an AttachLink card itself as a base character card
    if (/AttachLink/i.test(title)) return false;

    // 1. Strict Type Check: If the card has ANY type, it MUST be a character type.
    // Any other type ("location", "item", "lore", "faction", etc.) is strictly skipped!
    var cardType = (card.type || "").toLowerCase().trim();
    if (cardType) {
      return cardType === "character" || cardType === "person" || cardType === "npc" || cardType === "companion";
    }

    // 2. Untyped Cards: Fallback only if type is completely blank/missing
    var entryText = (card.entry || card.value || card.description || "").trim();
    if (entryText.length > 30) {
      var hasPronounSubject = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+is\s+(?:the|a|an)\b/i.test(entryText) &&
        /\b(she|he|they|woman|man|girl|boy|singer|dancer|performer|warrior|mage|guard|worker|host|hostess)\b/i.test(entryText);
      var hasAppearanceStats = /\b(?:stands\s+\d+\s*(?:feet|ft|'|inches|in|cm)|weighs\s+\d+\s*(?:pounds|lbs|kg))\b/i.test(entryText);
      return hasPronounSubject || hasAppearanceStats;
    }

    return false;
  },

  // Generates name variants/aliases for a character (e.g. "Marie Onette" -> ["Marie Onette", "Marie"])
  getAliases(fullName) {
    var clean = (fullName || "").trim();
    if (!clean) return [];
    var aliases = [clean];
    var parts = clean.split(/\s+/);
    if (parts.length > 1 && parts[0].length >= 3 && !BANNED_CANDIDATE_WORDS.has(parts[0])) {
      aliases.push(parts[0]); // First name alias
    }
    return aliases;
  },

  // Collect all recognized character names from config and Story Cards safely
  getRecognizedCharacters() {
    var names = new Set((AttachLinkConfig.MANUAL_CHARACTERS || []).map(n => n.trim()).filter(Boolean));

    if (AttachLinkConfig.autoDetectFromStoryCards && typeof storyCards !== 'undefined' && Array.isArray(storyCards)) {
      // Collect known non-character card titles to prevent false positive matches
      var knownNonCharTitles = new Set();
      for (var card of storyCards) {
        if (!card || !card.title) continue;
        var t = card.title.trim().toLowerCase();
        var cType = (card.type || "").toLowerCase().trim();
        if (cType && cType !== "character" && cType !== "person" && cType !== "npc" && cType !== "companion") {
          knownNonCharTitles.add(t);
        }
      }

      for (var card of storyCards) {
        if (!card || !card.title) continue;
        var title = card.title.trim();

        // 1. Check existing AttachLink cards: extract character name only if valid
        if (/AttachLink/i.test(title)) {
          var match = title.match(/^(.+?)(?:'s|’s|\s)+AttachLink/i) || title.match(/^(.+?)\s*AttachLink/i);
          if (match && match[1].trim()) {
            var candidate = match[1].replace(/['’]s$/i, '').trim();
            if (!knownNonCharTitles.has(candidate.toLowerCase())) {
              var hasCharCard = storyCards.some(c => c && c.title && !/AttachLink/i.test(c.title) && c.title.trim().toLowerCase() === candidate.toLowerCase() && this.isCharacterCard(c));
              var isManual = AttachLinkConfig.MANUAL_CHARACTERS && AttachLinkConfig.MANUAL_CHARACTERS.includes(candidate);
              if (hasCharCard || isManual) {
                names.add(candidate);
              }
            }
          }
          continue;
        }

        // 2. Only accept cards that represent real characters (strictly skips locations, items, etc.)
        if (this.isCharacterCard(card)) {
          names.add(title);
        }
      }
    }
    return names;
  },

  // Automatically purges erroneously created AttachLink cards for locations, concepts, and items
  cleanupInvalidAttachLinkCards(state) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;

    for (var i = storyCards.length - 1; i >= 0; i--) {
      var card = storyCards[i];
      if (!card || !card.title || !/AttachLink/i.test(card.title)) continue;

      var match = card.title.match(/^(.+?)(?:'s|’s|\s)+AttachLink/i) || card.title.match(/^(.+?)\s*AttachLink/i);
      if (!match || !match[1].trim()) continue;

      var charName = match[1].replace(/['’]s$/i, '').trim();

      // If explicitly specified in MANUAL_CHARACTERS, preserve it
      if (AttachLinkConfig.MANUAL_CHARACTERS && AttachLinkConfig.MANUAL_CHARACTERS.includes(charName)) {
        continue;
      }

      // Check if there is a base card that is explicitly NOT a character
      var baseCard = storyCards.find(c => c && c.title && !/AttachLink/i.test(c.title) && c.title.trim().toLowerCase() === charName.toLowerCase());

      var isInvalid = false;
      if (baseCard) {
        var baseType = (baseCard.type || "").toLowerCase().trim();
        if (baseType && baseType !== "character" && baseType !== "person" && baseType !== "npc" && baseType !== "companion") {
          isInvalid = true;
        } else if (!this.isCharacterCard(baseCard)) {
          isInvalid = true;
        }
      } else {
        // If no base card exists and title contains clear place/system keywords, mark as invalid
        if (/\b(room|suite|den|lounge|chamber|bar|patio|deck|vault|stage|dock|docks|bay|wing|penthouse|building|hall|corridor|street|city|district|forest|cave|mountain|rules|policy|system|protocol|bot|bots)\b/i.test(charName)) {
          isInvalid = true;
        }
      }

      if (isInvalid) {
        // Purge from state tracking
        if (state && state.attachLink) {
          if (state.attachLink.characters) delete state.attachLink.characters[charName];
          if (state.attachLink.candidates) delete state.attachLink.candidates[charName];
          if (state.attachLink.activeChar === charName) state.attachLink.activeChar = null;
        }

        // Delete from storyCards array and call AID API if available
        if (typeof removeStoryCard === 'function') {
          try { removeStoryCard(i); } catch (e) {}
        } else if (typeof deleteStoryCard === 'function') {
          try { deleteStoryCard(i); } catch (e) {}
        }
        if (storyCards[i] === card) {
          storyCards.splice(i, 1);
        }
      }
    }
  },

  // Checks if a character's AttachLink story card already exists
  attachLinkCardExists(charName) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return false;
    var cardTitle = `${charName}'s AttachLink`;
    return storyCards.some(c => c && (c.title === cardTitle || c.name === cardTitle));
  },

  // Extracts Plot Essentials / Memory across all AI Dungeon versions & cards
  getPlotEssentials(state) {
    var essentials = [];
    if (state && state.memory) {
      if (typeof state.memory === 'string' && state.memory.trim()) {
        essentials.push(state.memory.trim());
      } else if (typeof state.memory === 'object') {
        if (state.memory.context) essentials.push(state.memory.context);
        if (state.memory.memory) essentials.push(state.memory.memory);
        if (state.memory.plotEssentials) essentials.push(state.memory.plotEssentials);
      }
    }
    if (typeof info !== 'undefined' && info && info.memory && typeof info.memory === 'string') {
      essentials.push(info.memory.trim());
    }
    // Scan storyCards for any card explicitly dedicated to Plot Essentials or Memory
    if (typeof storyCards !== 'undefined' && Array.isArray(storyCards)) {
      for (var card of storyCards) {
        if (!card || !card.title) continue;
        if (/plot\s*essential|scenario\s*lore|world\s*info|adventure\s*memory/i.test(card.title)) {
          var txt = card.entry || card.value || card.description || "";
          if (txt) essentials.push(txt.trim());
        }
      }
    }
    return essentials.join("\n\n").trim();
  },

  // Extracts opening scenario prompt from history
  getOpeningScenario(history) {
    if (Array.isArray(history) && history.length > 0) {
      var first = history[0];
      return (first ? (first.text || first.rawText || "") : "").trim();
    }
    return "";
  },

  // Finds base character card (excluding companion AttachLink cards)
  getBaseCharacterCard(charName) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards) || !charName) return null;
    var lower = charName.toLowerCase().trim();
    return storyCards.find(c => {
      if (!c || !c.title) return false;
      var t = c.title.toLowerCase().trim();
      return !/attachlink/i.test(t) && (t === lower || (c.keys && c.keys.toLowerCase().includes(lower)));
    }) || null;
  },

  // Scans opening scenario, plot essentials, and character cards to infer established lore relationship
  inferInitialRelationship(charName, state, history) {
    var baseCard = this.getBaseCharacterCard(charName);
    var cardText = baseCard ? (baseCard.entry || baseCard.value || baseCard.description || "") : "";
    var essentialsText = this.getPlotEssentials(state);
    var openingText = this.getOpeningScenario(history);

    var corpus = `${cardText}\n${essentialsText}\n${openingText}`.toLowerCase();
    var aliases = this.getAliases(charName).map(a => a.toLowerCase());
    
    // Check if the corpus mentions the character in connection with key relational markers
    var hasCharMention = aliases.some(a => corpus.includes(a)) || (cardText.trim().length > 0);

    var result = {
      bond: 0,
      romance: 0,
      mood: "Neutral",
      coreMemory: "",
      agenda: "",
      inferred: false
    };

    if (!hasCharMention && !cardText) {
      return result;
    }

    var matchesPattern = function(regex) {
      return (cardText && regex.test(cardText)) || (essentialsText && regex.test(essentialsText)) || (openingText && regex.test(openingText));
    };

    // 1. Spousal / Married / Engaged
    if (matchesPattern(/\b(wife|husband|spouse|fianc[eé]e?|bride|groom|married to you|your wife|your husband)\b/i)) {
      result.bond = 4;
      result.romance = 4;
      result.mood = "Loving";
      result.coreMemory = `Established in scenario lore as your spouse/partner.`;
      result.inferred = true;
      return result;
    }

    // 2. Dating / Lovers / Romantic Partners
    if (matchesPattern(/\b(girlfriend|boyfriend|lover|dating you|dating each other|in love with you|your girlfriend|your boyfriend|romantic partner|sweetheart)\b/i)) {
      result.bond = 3;
      result.romance = 3;
      result.mood = "Affectionate";
      result.coreMemory = `Established in scenario lore as dating / romantically involved with you.`;
      result.inferred = true;
      return result;
    }

    // 3. Crush / Mutual Flirtation / Attraction
    if (matchesPattern(/\b(crush on you|attracted to you|flirting with you|desires you|infatuated with you)\b/i)) {
      result.bond = 2;
      result.romance = 2;
      result.mood = "Flustered";
      result.coreMemory = `Established in scenario lore with mutual attraction / feelings for you.`;
      result.inferred = true;
      return result;
    }

    // 4. Best Friend / Inseparable / Lifelong Ally
    if (matchesPattern(/\b(best friend|childhood friend|closest friend|inseparable friend|lifelong friend)\b/i)) {
      result.bond = 4;
      result.romance = 0;
      result.mood = "Friendly";
      result.coreMemory = `Established in scenario lore as your best / childhood friend.`;
      result.inferred = true;
      return result;
    }

    // 5. Family / Relatives
    if (matchesPattern(/\b(sister|brother|mother|father|daughter|son|your sibling|family)\b/i)) {
      result.bond = 3;
      result.romance = 0;
      result.mood = "Warm";
      result.coreMemory = `Established in scenario lore as part of your family.`;
      result.inferred = true;
      return result;
    }

    // 6. Devoted / Servant / Submissive
    if (matchesPattern(/\b(devoted to you|obedient to you|your servant|your maid|your slave|servant of yours)\b/i)) {
      result.bond = 3;
      result.romance = 1;
      result.mood = "Devoted";
      result.coreMemory = `Established in scenario lore as loyal and devoted to you.`;
      result.inferred = true;
      return result;
    }

    // 7. Good Friend / Companion / Ally
    if (matchesPattern(/\b(close friend|good friend|companion|trusted ally|comrade|trusted partner)\b/i)) {
      result.bond = 2;
      result.romance = 0;
      result.mood = "Cordial";
      result.coreMemory = `Established in scenario lore as a trusted friend and ally.`;
      result.inferred = true;
      return result;
    }

    // 8. Co-worker / Business Partner / Colleague
    if (matchesPattern(/\b(co-worker|coworker|business partner|co-manager|colleague|employee|co-owner)\b/i)) {
      result.bond = 1;
      result.romance = 0;
      result.mood = "Professional";
      result.coreMemory = `Established in scenario lore as your professional coworker / partner.`;
      result.inferred = true;
      return result;
    }

    // 9. Nemesis / Sworn Enemy
    if (matchesPattern(/\b(nemesis|arch-enemy|deadly foe|sworn enemy|mortal enemy|lethal enemy)\b/i)) {
      result.bond = -4;
      result.romance = 0;
      result.mood = "Hostile";
      result.coreMemory = `Established in scenario lore as your bitter sworn enemy.`;
      result.inferred = true;
      return result;
    }

    // 10. Enemy / Hostile
    if (matchesPattern(/\b(enemy|hates you|despises you|hostile towards you|opponent|antagonist)\b/i)) {
      result.bond = -3;
      result.romance = 0;
      result.mood = "Cold";
      result.coreMemory = `Established in scenario lore as hostile towards you.`;
      result.inferred = true;
      return result;
    }

    // 11. Rival / Competitor
    if (matchesPattern(/\b(rival|competitor|distrusts you|suspicious of you|wary of you)\b/i)) {
      result.bond = -1;
      result.romance = 0;
      result.mood = "Guarded";
      result.coreMemory = `Established in scenario lore as your competitor / rival.`;
      result.inferred = true;
      return result;
    }

    return result;
  },

  // One-shot boot: generates AttachLink cards for ALL NPCs that already have story cards.
  // This runs automatically the very first time AttachLink initialises in a scenario,
  // reading opening prompt, plot essentials, and character cards to calibrate relationships!
  bootstrapExistingNPCs(state) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;

    this.cleanupInvalidAttachLinkCards(state);

    var historyRef = (typeof history !== 'undefined') ? history : [];
    var recognized = this.getRecognizedCharacters();
    for (var name of recognized) {
      var charData = this.ensureCharacter(name, state);
      if (!charData.initialized) {
        var inferred = this.inferInitialRelationship(name, state, historyRef);
        if (inferred && inferred.inferred) {
          charData.bond = inferred.bond;
          charData.romance = inferred.romance;
          charData.mood = inferred.mood;
          charData.coreMemory = inferred.coreMemory;
        }
        charData.initialized = true;
      }
      // Only write the card if it doesn't already exist (preserves player edits)
      if (!this.attachLinkCardExists(name)) {
        this.syncStoryCard(state, name);
      }
    }
  },

  // Manually force-refresh all tracked characters' story cards (e.g. after adding a new NPC)
  syncAllStoryCards(state) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;
    this.init(state);
    var recognized = this.getRecognizedCharacters();
    for (var name of recognized) {
      this.ensureCharacter(name, state);
      this.syncStoryCard(state, name);
    }
  },

  // Initialize a character with a neutral baseline & cognitive fields
  ensureCharacter(name, state) {
    this.init(state);
    var cleanName = (name || "").trim();
    if (!cleanName) return null;

    if (!state.attachLink.characters[cleanName]) {
      state.attachLink.characters[cleanName] = {
        name: cleanName,
        bond: 0,          // Stage 0: Neutral Acquaintance (-5 to +5)
        romance: 0,       // Stage 0: Platonic (0 to 5)
        mood: "Neutral",  // Dynamic emotional state / demeanor
        agenda: "",       // NPC private agenda / secret goal
        thoughts: [],     // Monologue buffer
        coreMemory: "",   // Permanent consolidated foundation
        lastSeenAction: 0,
        initialized: false
      };
    }
    return state.attachLink.characters[cleanName];
  },

  // Scans history for presence, manages anti-spam discovery and candidate decay
  resolveActiveCharacter(state, history) {
    this.init(state);
    var currentAction = (typeof info !== 'undefined' && info.actionCount) ? info.actionCount : 0;
    var lookback = AttachLinkConfig.lookbackTurnsForPresence;
    var recentHistory = Array.isArray(history) ? history.slice(-lookback) : [];
    var textCorpus = recentHistory.map(h => (h ? (h.text || h.rawText || "") : "")).join(" ");
    var lowerCorpus = textCorpus.toLowerCase();

    var recognized = this.getRecognizedCharacters();

    // 1. Scan for potential new NPC names (1-word or 2-word proper nouns)
    var potentialNames = textCorpus.match(/\b[A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?\b/g) || [];
    var seenThisTurn = new Set();

    for (var rawName of potentialNames) {
      var cleanName = rawName.trim();
      var firstWord = cleanName.split(/\s+/)[0];
      if (BANNED_CANDIDATE_WORDS.has(firstWord) || recognized.has(cleanName)) continue;

      // Reject candidates matching known non-character story cards (locations, concepts, etc.)
      if (typeof storyCards !== 'undefined' && Array.isArray(storyCards)) {
        var isKnownNonChar = storyCards.some(c => c && c.title && NON_CHARACTER_CARD_TYPES.has((c.type || "").toLowerCase().trim()) && c.title.trim().toLowerCase() === cleanName.toLowerCase());
        if (isKnownNonChar) continue;
      }

      // Reject candidates that contain obvious non-person tokens (rooms, bars, vaults, etc.)
      if (/\b(room|suite|den|lounge|chamber|bar|patio|deck|vault|stage|dock|docks|bay|wing|penthouse|building|hall|corridor|street|city|district|forest|cave|mountain|rules|policy|system|protocol|bot|bots)\b/i.test(cleanName)) {
        continue;
      }

      seenThisTurn.add(cleanName);

      // Increment sighting counter
      state.attachLink.candidates[cleanName] = (state.attachLink.candidates[cleanName] || 0) + 1;

      // When an unlisted NPC persists for the full threshold, promote them!
      if (state.attachLink.candidates[cleanName] >= AttachLinkConfig.NEW_NPC_SIGHTING_THRESHOLD) {
        this.ensureCharacter(cleanName, state);
        delete state.attachLink.candidates[cleanName];
      }
    }

    // 2. CANDIDATE DECAY: One-off side characters fade away if not actively present
    for (var name in state.attachLink.candidates) {
      if (!seenThisTurn.has(name)) {
        state.attachLink.candidates[name]--;
        if (state.attachLink.candidates[name] <= 0) {
          delete state.attachLink.candidates[name];
        }
      }
    }

    // 3. Select the best active character currently in the scene
    var allTracked = Object.keys(state.attachLink.characters).concat(Array.from(recognized));
    var uniqueTracked = [...new Set(allTracked)].filter(Boolean);
    if (uniqueTracked.length === 0) {
      state.attachLink.activeChar = null;
      return null;
    }

    var bestChar = null;
    var highestScore = -999;

    for (var charName of uniqueTracked) {
      var charData = this.ensureCharacter(charName, state);
      var aliases = this.getAliases(charName);
      
      var matches = 0;
      for (var alias of aliases) {
        var lowerAlias = alias.toLowerCase();
        var escaped = escapeRegex(lowerAlias);
        var count = (lowerCorpus.match(new RegExp(`\\b${escaped}\\b`, "g")) || []).length;
        matches += count;
      }

      if (matches > 0) charData.lastSeenAction = currentAction;
      var turnsSinceSeen = currentAction - (charData.lastSeenAction || 0);

      // Priority calculation: (Presence * 15) - (Absence Decay * 3)
      var score = (matches * 15) - (turnsSinceSeen * 3);
      if (AttachLinkConfig.MANUAL_CHARACTERS && AttachLinkConfig.MANUAL_CHARACTERS.includes(charName)) {
        score += 5;
      }

      if (score > highestScore && turnsSinceSeen <= 10) {
        highestScore = score;
        bestChar = charName;
      }
    }

    state.attachLink.activeChar = bestChar;
    return bestChar;
  },

  // Apply LLM-generated reflection deltas or absolute sets directly (Primary Agentic Engine)
  applyDeltas(state, charName, deltas) {
    this.init(state);
    var charData = this.ensureCharacter(charName, state);
    if (!charData || !deltas) return;

    // Mood update
    if (deltas.mood && typeof deltas.mood === 'string') {
      var cleanMood = deltas.mood.trim();
      if (cleanMood.length > 1 && cleanMood.length < 30) {
        charData.mood = cleanMood.charAt(0).toUpperCase() + cleanMood.slice(1).toLowerCase();
      }
    }

    // Bond (-5 to +5): supports absolute set or delta adjustment
    if (typeof deltas.bond === 'number' && !isNaN(deltas.bond)) {
      if (deltas.isAbsoluteBond) {
        charData.bond = Math.max(-5, Math.min(5, deltas.bond));
      } else {
        charData.bond = Math.max(-5, Math.min(5, charData.bond + deltas.bond));
      }
    }

    // Romance (0 to 5): supports absolute set or delta adjustment
    if (typeof deltas.romance === 'number' && !isNaN(deltas.romance)) {
      if (deltas.isAbsoluteRomance) {
        charData.romance = Math.max(0, Math.min(5, deltas.romance));
      } else {
        if (deltas.romance > 0) {
          if (charData.bond >= 0) {
            charData.romance = Math.min(5, charData.romance + deltas.romance);
          }
        } else {
          charData.romance = Math.max(0, charData.romance + deltas.romance);
        }
      }
    }

    // Severe hostility naturally deteriorates romance
    if (charData.bond <= -3 && charData.romance > 0) {
      charData.romance = Math.max(0, charData.romance - 1);
    }
  },

  // Prompt Context Injection
  getPromptContext(state) {
    this.init(state);
    var active = state.attachLink.activeChar;
    if (!active) return "";

    var charData = this.ensureCharacter(active, state);
    var bondDesc = AttachLinkConfig.bondLevels[charData.bond.toString()] || "Neutral";
    var romanceDesc = AttachLinkConfig.romanceLevels[charData.romance.toString()] || "Platonic";
    var moodDesc = charData.mood || "Neutral";

    var summary = `[AttachLink: ${active} | Mood: ${moodDesc} | Bond: ${charData.bond > 0 ? `+${charData.bond}` : charData.bond} (${bondDesc}) | Romance: ${charData.romance}/5 (${romanceDesc})]`;

    if (charData.agenda) {
      summary += `\n[${active}'s Secret Agenda: "${charData.agenda}"]`;
    }
    if (charData.coreMemory) {
      summary += `\n[${active}'s Core Impression: "${charData.coreMemory}"]`;
    }
    return summary;
  },

  addThought(state, charName, thoughtText) {
    this.init(state);
    var charData = this.ensureCharacter(charName, state);
    var cleaned = thoughtText.trim().replace(/^["“']|["”']$/g, '');
    if (!cleaned || cleaned.length < 4) return;

    charData.thoughts.push(cleaned);
  },

  // Synthesizes thoughts, updates Agenda, and resets the thought buffer to 0
  setConsolidatedMemory(state, charName, summaryText, agendaText = "") {
    this.init(state);
    var charData = this.ensureCharacter(charName, state);
    var cleanedSummary = summaryText.trim().replace(/^["“']|["”']$/g, '');
    if (cleanedSummary && cleanedSummary.length >= 6) {
      charData.coreMemory = cleanedSummary;
    }

    if (agendaText) {
      var cleanedAgenda = agendaText.trim().replace(/^["“']|["”']$/g, '');
      if (cleanedAgenda && cleanedAgenda.length >= 4) {
        charData.agenda = cleanedAgenda;
      }
    }

    charData.thoughts = []; // Reset raw thoughts back to 0
  },

  renderBondBar(val) {
    var neg = val < 0 ? "◄".repeat(Math.abs(val)) + "─".repeat(5 - Math.abs(val)) : "─────";
    var pos = val > 0 ? "►".repeat(val) + "─".repeat(5 - val) : "─────";
    var center = val === 0 ? "■" : "│";
    return `[${neg} ${center} ${pos}]`;
  },

  renderRomanceBar(val) {
    return `[${'♥'.repeat(val)}${'♡'.repeat(5 - val)}]`;
  },

  // Self-Building Manual for the Story Card's "NOTES" section (Consumes 0 prompt tokens!)
  buildCardNotes(charName) {
    return `📖 [ATTACHLINK USER GUIDE - ${charName.toUpperCase()}]\n` +
      `Tracks ${charName}'s emotional bonds, standing, inner thoughts, and agentic agenda in real time.\n` +
      `(Note: This Notes section is player-facing and consumes 0 AI prompt tokens!)\n\n` +
      `📊 RELATIONSHIP TRACKS & STAGES:\n\n` +
      `• Bond Spectrum (-5 Enemy ◄─ 0 Neutral ─► +5 Friend):\n` +
      `   [-5] Sworn Nemesis (Lethal hatred & complete hostility)\n` +
      `   [-4] Bitter Foe (Active animosity & sabotage)\n` +
      `   [-3] Open Adversary (Hostile friction & rivalry)\n` +
      `   [-2] Unfriendly (Cold dislike & tension)\n` +
      `   [-1] Distrustful (Guarded & suspicious)\n` +
      `   [ 0] Neutral (Stranger / Acquaintance)\n` +
      `   [+1] Cordial (Friendly ease & polite warmth)\n` +
      `   [+2] Companion (Enjoyable company & casual friend)\n` +
      `   [+3] Reliable Friend (Supportive & trustworthy ally)\n` +
      `   [+4] Close Confidant (Deep emotional trust & vulnerability)\n` +
      `   [+5] Inseparable (Unconditional loyalty & soul-bound bond)\n\n` +
      `• Romance Pipeline (0 Platonic to 5 Soulmates):\n` +
      `   [0/5] Platonic (No romantic feelings)\n` +
      `   [1/5] Subtle Spark (Passing curiosity & warm butterflies)\n` +
      `   [2/5] Mutual Crush (Flustered & active romantic interest)\n` +
      `   [3/5] Lovers / Partners (Open romantic passion & dating)\n` +
      `   [4/5] Deep Devotion (Intense love & committed passion)\n` +
      `   [5/5] Eternal Soulmates (Bound by true, unbreakable love)\n\n` +
      `🧠 AUTOMATIC PAUSE MENU & REFLECTIONS:\n` +
      `• Every ${AttachLinkConfig.reflectionCooldown} turns, the script will automatically pause the story.\n` +
      `• The AI will analyze your actions and update the NPC's core thoughts, agenda, and relationship levels.\n` +
      `• Type \`/reflect\` manually to force a relationship check anytime.`;
  },

  // Sync Story Card (Writes Entry and Notes safely across AID versions)
  syncStoryCard(state, charName) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards) || !charName) return;

    var charData = this.ensureCharacter(charName, state);
    var cardTitle = `${charName}'s AttachLink`;

    var bondSign = charData.bond > 0 ? `+${charData.bond}` : charData.bond;
    var bondDesc = AttachLinkConfig.bondLevels[charData.bond.toString()] || "Neutral";
    var romanceDesc = AttachLinkConfig.romanceLevels[charData.romance.toString()] || "Platonic";
    var moodDesc = charData.mood || "Neutral";

    var agendaText = charData.agenda ? `Secret Agenda: "${charData.agenda}"\n` : "";
    var coreMemoryText = charData.coreMemory ? `Core Impression: "${charData.coreMemory}"\n` : "";

    var cardContent = `[${cardTitle} - Relationship Status]\n` +
      `• Mood: ${moodDesc}\n` +
      `• Bond: ${this.renderBondBar(charData.bond)} (${bondSign}) ${bondDesc}\n` +
      `• Romance: ${this.renderRomanceBar(charData.romance)} (${charData.romance}/5) ${romanceDesc}\n\n` +
      agendaText +
      coreMemoryText;

    var cardNotes = this.buildCardNotes(charName);
    var aliases = this.getAliases(charName);
    var keys = `${aliases.join(", ")}, ${cardTitle}, AttachLink, relationship, mind`;
    var type = "Character";

    var index = storyCards.findIndex(c => c && (c.title === cardTitle || c.name === cardTitle));
    if (index !== -1) {
      if (typeof updateStoryCard === 'function') {
        try { updateStoryCard(index, keys, cardContent, type, cardTitle, cardNotes); }
        catch (e) { try { updateStoryCard(index, keys, cardContent, type); } catch (e2) {} }
      }
      if (storyCards[index]) {
        storyCards[index].entry = cardContent;
        storyCards[index].description = cardNotes;
        storyCards[index].notes = cardNotes; // Supports Phoenix and legacy property names
      }
    } else {
      if (typeof addStoryCard === 'function') {
        try { addStoryCard(keys, cardContent, type, cardTitle, cardNotes); }
        catch (e) { try { addStoryCard(keys, cardContent, type); } catch (e2) {} }
      }
      // If addStoryCard did not synchronously push to the local storyCards array, push safely
      var afterIndex = storyCards.findIndex(c => c && (c.title === cardTitle || c.name === cardTitle));
      if (afterIndex === -1) {
        storyCards.push({
          title: cardTitle,
          name: cardTitle,
          keys: keys,
          entry: cardContent,
          type: type,
          description: cardNotes,
          notes: cardNotes
        });
      }
    }
  }
};

// ==================== CONTEXT BUDGET & CLEANER ====================

// 1. Trims oldest story history if context exceeds token budget
AttachLink.fitContext = function(text, extraCharsNeeded = 300) {
  if (!text) return "";
  var maxLimit = Math.max((typeof info !== 'undefined' && info.maxChars ? info.maxChars : 3500) - extraCharsNeeded - 50, 1500);
  if (text.length <= maxLimit) return text;

  var excess = text.length - maxLimit;
  var cutIndex = text.indexOf("\n\n", excess);
  return cutIndex !== -1 ? text.slice(cutIndex + 2) : text.slice(excess);
};

// 2. Multi-word leak cleaner: completely wipes leftover thought traces from text
AttachLink.cleanContextLeaks = function(text) {
  if (!text) return "";
  return text.replace(/(?:^|\n)\s*[\(\[\*]*\s*[^:\n\r]+?(?:'s)?\s*AttachLink(?:\s*(?:Consolidation|Summary))?\s*[:=\-][^\n]*\n*/gi, "\n\n").trim();
};

// Ensure globals are exported on globalThis
if (typeof globalThis !== 'undefined') {
  globalThis.AttachLinkConfig = AttachLinkConfig;
  globalThis.AttachLink = AttachLink;
}