/* ==========================================================================
   UNIVERSAL ATTACHLINK ENGINE v4.1 (COGNITIVE RELATIONSHIP PIPELINE)
   Works for ANY Scenario: Fantasy, Sci-Fi, Slice-of-Life, Romance, etc.
   ========================================================================== */

var AttachLinkConfig = {
  // 1. Manually specified characters (Supports multi-word names, e.g. ["Marie Onette"])
  MANUAL_CHARACTERS: [""],

  // 2. NPC Detection Scope
  // Set to false (default) so only real NPCs with Character Story Cards (or MANUAL_CHARACTERS) receive cards.
  // This prevents common story words like "Her", "And", "Pacific" from ever turning into cards!
  autoDiscoverUnlistedNPCs: false,
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

// Comprehensive list of English pronouns, conjunctions, prepositions, adverbs, and generic capitalized story words
var BANNED_CANDIDATE_WORDS = new Set([
  // Pronouns & Possessives
  "I", "Me", "My", "Mine", "Myself",
  "You", "Your", "Yours", "Yourself", "Yourselves",
  "He", "Him", "His", "Himself",
  "She", "Her", "Hers", "Herself",
  "It", "Its", "Itself",
  "We", "Us", "Our", "Ours", "Ourselves",
  "They", "Them", "Their", "Theirs", "Themselves",
  "Who", "Whom", "Whose", "Which", "What", "Whatever",
  "This", "That", "These", "Those",
  "One", "Ones", "Someone", "Somebody", "Something",
  "Anyone", "Anybody", "Anything",
  "Everyone", "Everybody", "Everything",
  "No one", "Nobody", "Nothing",

  // Conjunctions & Prepositions
  "And", "Or", "But", "Nor", "For", "Yet", "So",
  "Although", "Though", "Even", "If", "Unless", "Until", "While", "Because", "Since",
  "About", "Above", "Across", "After", "Against", "Along", "Among", "Around", "At",
  "Before", "Behind", "Below", "Beneath", "Beside", "Between", "Beyond", "By",
  "Down", "During", "Except", "From", "In", "Inside", "Into", "Near", "Of", "Off",
  "On", "Onto", "Out", "Outside", "Over", "Past", "Through", "Throughout", "To",
  "Toward", "Towards", "Under", "Underneath", "Upon", "With", "Within", "Without",

  // Determiners, Adverbs, and Common Sentence Starters
  "The", "A", "An", "Some", "Any", "Every", "Each", "All", "Both", "Half",
  "Either", "Neither", "Much", "Many", "More", "Most", "Few", "Fewer", "Little",
  "Less", "Least", "Several", "Such", "Own", "Other", "Another",
  "Suddenly", "Meanwhile", "Then", "There", "Here", "Where", "When", "Why", "How",
  "Yes", "No", "Not", "Never", "Always", "Often", "Seldom", "Rarely", "Usually",
  "Please", "Look", "Looked", "Looking", "Come", "Came", "Coming", "Go", "Went", "Going",
  "Wait", "Waited", "Stop", "Stopped", "Hello", "Goodbye", "Soon", "Finally", "Still",
  "Just", "Only", "Also", "Too", "Very", "Really", "Almost", "Quite", "Already",
  "Now", "Today", "Tonight", "Tomorrow", "Yesterday", "Morning", "Night", "Day",
  "First", "Second", "Third", "Next", "Last", "Once", "Twice", "Again", "Back", "Away",

  // Generic adjectives / geographical words
  "Pacific", "Atlantic", "Arctic", "Indian", "North", "South", "East", "West",
  "Central", "Northern", "Southern", "Eastern", "Western", "Upper", "Lower"
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
  isBannedWord(word) {
    if (!word || typeof word !== 'string') return true;
    var w = word.trim();
    if (BANNED_CANDIDATE_WORDS.has(w)) return true;
    var titleCase = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    return BANNED_CANDIDATE_WORDS.has(titleCase);
  },

  init(state) {
    if (!state.attachLink) {
      state.attachLink = {};
    }
    state.attachLink.characters = state.attachLink.characters || {};
    state.attachLink.candidates = state.attachLink.candidates || {};
    if (typeof state.attachLink.activeChar === 'undefined') state.attachLink.activeChar = null;
    if (typeof state.attachLink.turnsSinceReflection === 'undefined') state.attachLink.turnsSinceReflection = 0;
    if (typeof state.attachLink.isReflecting === 'undefined') state.attachLink.isReflecting = false;
    if (typeof state.attachLink.reflectingCharacter === 'undefined') state.attachLink.reflectingCharacter = null;

    // Always purge any erroneously created non-character cards (locations, concepts, items)
    this.cleanupInvalidAttachLinkCards(state);

    // On very first run, immediately generate AttachLink cards for all named character NPCs and system dashboard
    if (!state.attachLink.bootstrapped) {
      state.attachLink.bootstrapped = true;
      this.bootstrapExistingNPCs(state);
      this.syncSystemConsoleCard(state);
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

  // Cleans sub-descriptors and formats character names (e.g. "Anna - Behavior" -> "Anna", "Chris - Anna Friend" -> "Chris")
  cleanCharacterName(title) {
    if (!title || typeof title !== 'string') return "";
    var name = title.trim();

    // Strip AttachLink suffix if present
    name = name.replace(/(?:'s|’s|\s)+AttachLink.*$/i, '').trim();

    // Strip parentheticals and brackets: "Gary (The Bartender)" -> "Gary"
    name = name.replace(/\s*[\(\[\{][^\)\]\}]+[\)\]\}]/g, '').trim();

    // Strip colon/hyphen descriptor suffixes: "Anna - Behavior", "Chris - Anna Friend", "Lyra: Royal Heir"
    var separatorMatch = name.match(/^([^:\-]+?)\s*[:\-–—]\s*(.+)$/);
    if (separatorMatch) {
      var prefix = separatorMatch[1].trim();
      var suffix = separatorMatch[2].trim();
      if (/^(?:behavior|appearance|personality|lore|backstory|info|stats|profile|dialogue|prompt|character|friend|enemy|ally|companion|rival|boss|npc|data|notes|guide)/i.test(suffix) ||
          /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(prefix)) {
        if (!this.isBannedWord(prefix) && prefix.length >= 2) {
          name = prefix;
        }
      }
    }

    name = name.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
    return name;
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
    var names = new Set((AttachLinkConfig.MANUAL_CHARACTERS || []).map(n => this.cleanCharacterName(n)).filter(Boolean));

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
            var candidate = this.cleanCharacterName(match[1]);
            if (candidate && !knownNonCharTitles.has(candidate.toLowerCase()) && !this.isBannedWord(candidate)) {
              var hasCharCard = storyCards.some(c => c && c.title && !/AttachLink/i.test(c.title) && this.cleanCharacterName(c.title).toLowerCase() === candidate.toLowerCase() && this.isCharacterCard(c));
              var isManual = AttachLinkConfig.MANUAL_CHARACTERS && AttachLinkConfig.MANUAL_CHARACTERS.some(m => this.cleanCharacterName(m).toLowerCase() === candidate.toLowerCase());
              if (hasCharCard || isManual) {
                names.add(candidate);
              }
            }
          }
          continue;
        }

        // 2. Only accept cards that represent real characters (strictly skips locations, items, etc.)
        if (this.isCharacterCard(card)) {
          var cleanName = this.cleanCharacterName(title);
          if (cleanName && !knownNonCharTitles.has(cleanName.toLowerCase()) && !this.isBannedWord(cleanName)) {
            names.add(cleanName);
          }
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
      if (!card || !card.title) continue;
      // Never purge the System Console card
      if (/AttachLink\s*System\s*Console/i.test(card.title)) continue;
      if (!/AttachLink/i.test(card.title)) continue;

      var match = card.title.match(/^(.+?)(?:'s|’s|\s)+AttachLink/i) || card.title.match(/^(.+?)\s*AttachLink/i);
      if (!match || !match[1].trim()) continue;

      var rawCharName = match[1].replace(/['’]s$/i, '').trim();
      var charName = this.cleanCharacterName(rawCharName);

      // If explicitly specified in MANUAL_CHARACTERS, preserve it (case-insensitive)
      if (AttachLinkConfig.MANUAL_CHARACTERS && AttachLinkConfig.MANUAL_CHARACTERS.some(m => this.cleanCharacterName(m).toLowerCase() === charName.toLowerCase())) {
        if (rawCharName.toLowerCase() !== charName.toLowerCase()) {
          isInvalid = true;
        } else {
          continue;
        }
      }

      // Check if there is a base card that is explicitly a valid character card
      var baseCard = storyCards.find(c => c && c.title && !/AttachLink/i.test(c.title) && this.cleanCharacterName(c.title).toLowerCase() === charName.toLowerCase());

      var isInvalid = false;

      // If the card title has a mangled/uncleaned sub-descriptor (e.g. "Anna - Behavior's AttachLink") purge it!
      if (rawCharName.toLowerCase() !== charName.toLowerCase()) {
        isInvalid = true;
      } else if (this.isBannedWord(charName)) {
        isInvalid = true;
      } else if (baseCard) {
        var baseType = (baseCard.type || "").toLowerCase().trim();
        if (baseType && baseType !== "character" && baseType !== "person" && baseType !== "npc" && baseType !== "companion") {
          isInvalid = true;
        } else if (!this.isCharacterCard(baseCard)) {
          isInvalid = true;
        }
      } else {
        // If no base card exists, only keep if it is explicitly in MANUAL_CHARACTERS or active tracked characters
        var isTracked = state && state.attachLink && state.attachLink.characters && 
          Object.keys(state.attachLink.characters).some(k => this.cleanCharacterName(k).toLowerCase() === charName.toLowerCase());
        var isManual = AttachLinkConfig.MANUAL_CHARACTERS && 
          AttachLinkConfig.MANUAL_CHARACTERS.some(m => this.cleanCharacterName(m).toLowerCase() === charName.toLowerCase());
        if (!isTracked && !isManual) {
          isInvalid = true;
        }
      }

      if (isInvalid) {
        // Purge from state tracking
        if (state && state.attachLink) {
          if (state.attachLink.characters) {
            delete state.attachLink.characters[rawCharName];
            delete state.attachLink.characters[charName];
          }
          if (state.attachLink.candidates) {
            delete state.attachLink.candidates[rawCharName];
            delete state.attachLink.candidates[charName];
          }
          if (state.attachLink.activeChar === rawCharName || state.attachLink.activeChar === charName) {
            state.attachLink.activeChar = null;
          }
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
    var clean = this.cleanCharacterName(charName);
    var cardTitle = `${clean}'s AttachLink`;
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
    var lower = this.cleanCharacterName(charName).toLowerCase().trim();
    return storyCards.find(c => {
      if (!c || !c.title) return false;
      var t = c.title.toLowerCase().trim();
      if (/attachlink/i.test(t)) return false;
      var cleanT = this.cleanCharacterName(c.title).toLowerCase().trim();
      return cleanT === lower || t === lower || (c.keys && c.keys.toLowerCase().includes(lower));
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
    var cleanName = this.cleanCharacterName(name);
    if (!cleanName) return null;

    // Never track banned words
    if (this.isBannedWord(cleanName)) return null;

    // Check case-insensitively if this character already exists in state
    var existingKey = Object.keys(state.attachLink.characters).find(k => k.toLowerCase() === cleanName.toLowerCase());
    if (existingKey) {
      var existingData = state.attachLink.characters[existingKey];
      if (existingData.coreMemory && /deep thoughts|thoughts about the protagonist/i.test(existingData.coreMemory)) {
        existingData.coreMemory = "";
      }
      if (existingData.agenda && /personal secret goal|secret personal goal/i.test(existingData.agenda)) {
        existingData.agenda = "";
      }
      return existingData;
    }

    // Normalize to Title Case (e.g. "cera" -> "Cera", "claire stanfield" -> "Claire Stanfield")
    var titleCaseName = cleanName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

    if (!state.attachLink.characters[titleCaseName]) {
      state.attachLink.characters[titleCaseName] = {
        name: titleCaseName,
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
    return state.attachLink.characters[titleCaseName];
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

    // Purge only accidental banned words from existing state tracking (never purge valid tracked NPCs)
    for (var trackedName of Object.keys(state.attachLink.characters)) {
      if (this.isBannedWord(trackedName)) {
        delete state.attachLink.characters[trackedName];
      }
    }

    // 1. Scan for potential new NPC names ONLY if autoDiscoverUnlistedNPCs is explicitly enabled
    if (AttachLinkConfig.autoDiscoverUnlistedNPCs) {
      var potentialNames = textCorpus.match(/\b[A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?\b/g) || [];
      var seenThisTurn = new Set();

      for (var rawName of potentialNames) {
        var cleanName = rawName.trim();
        var firstWord = cleanName.split(/\s+/)[0];
        if (BANNED_CANDIDATE_WORDS.has(firstWord) || BANNED_CANDIDATE_WORDS.has(cleanName) || recognized.has(cleanName)) continue;

        // Reject candidates matching known story cards
        if (typeof storyCards !== 'undefined' && Array.isArray(storyCards)) {
          var isKnownNonChar = storyCards.some(c => c && c.title && c.title.trim().toLowerCase() === cleanName.toLowerCase());
          if (isKnownNonChar) continue;
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
    } else {
      state.attachLink.candidates = {};
    }

    // 3. Select the best active character currently in the scene
    var allTracked = Object.keys(state.attachLink.characters).concat(Array.from(recognized));
    var uniqueTracked = [...new Set(allTracked)].filter(n => n && !BANNED_CANDIDATE_WORDS.has(n));
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

  // Robust parser for LLM reflection responses (extracts monologue, mood, agenda, bond, romance)
  parseReflection(text, charName, history) {
    var result = {
      thought: "",
      mood: null,
      agenda: null,
      bond: undefined,
      isAbsoluteBond: false,
      romance: undefined,
      isAbsoluteRomance: false
    };

    if (text === null || text === undefined) text = "";
    if (typeof text !== 'string') text = String(text);
    if (!text.trim() && (!Array.isArray(history) || history.length === 0)) return result;

    var isDummyThought = function(t) {
      if (!t) return true;
      return /deep thoughts|thoughts about the protagonist|inner monologue about|insert thought|write thought/i.test(t);
    };

    var isDummyAgenda = function(a) {
      if (!a) return true;
      return /personal secret goal|secret personal goal|secret goal|insert agenda|what npc wants/i.test(a);
    };

    // 1. Extract thought / inner monologue
    // Priority A: Quoted string of substantial length
    var quoteMatch = text.match(/["“]([^"”]{10,})["”]/);
    if (quoteMatch && !isDummyThought(quoteMatch[1])) {
      result.thought = quoteMatch[1].trim();
    } else {
      // Priority B: Text after AttachLink: before any attribute keywords or pipes/newlines
      var fallbackMatch = text.match(/AttachLink\s*[:=\-]\s*([^|•\n\r]+)/i);
      if (fallbackMatch) {
        var cleanFallback = fallbackMatch[1].trim().replace(/^[\(\[\*"'“]+|[\)\]\*"”]+$/g, '');
        if (!isDummyThought(cleanFallback)) {
          result.thought = cleanFallback;
        }
      }
    }

    // 2. Extract Mood (supports: Mood: Devoted, Mood: [Devoted], • Mood: Devoted, etc.)
    var moodMatch = text.match(/(?:Mood|Emotion|Demeanor)\s*[:=\-]?\s*[\[\("“']?([a-zA-Z\s\/\-]+?)[\]\)"”']?(?:\s*(?:\||\n|\r|$))/i);
    if (moodMatch) {
      var rawMood = moodMatch[1].trim();
      if (rawMood.length >= 2 && rawMood.length <= 35 && !/current emotion|emotion/i.test(rawMood)) {
        result.mood = rawMood.charAt(0).toUpperCase() + rawMood.slice(1).toLowerCase();
      }
    }

    // 3. Extract Agenda (supports: Agenda: Master lessons, Agenda: [Goal], etc.)
    var agendaMatch = text.match(/(?:Agenda|Goal|Desire)\s*[:=\-]?\s*[\[\("“']?([^\]\)"”\n\r|]+?)[\]\)"”']?(?:\s*(?:\||\n|\r|$))/i);
    if (agendaMatch) {
      var rawAgenda = agendaMatch[1].trim();
      if (rawAgenda.length >= 3 && rawAgenda.length <= 150 && !isDummyAgenda(rawAgenda)) {
        result.agenda = rawAgenda;
      }
    }

    // 4. Extract Bond (supports: Bond: +1, Bond: [+1], Bond: =3, • Bond: +2, Bond: 1, Bond: 0, etc.)
    var bondMatch = text.match(/(?:Bond(?:\s*Level)?)\s*[:=\-]?\s*[\[\(]?\s*([=+\-]?\s*\d+)/i);
    if (bondMatch) {
      var rawBond = bondMatch[1].replace(/\s+/g, '');
      if (rawBond.startsWith("=")) {
        result.bond = parseInt(rawBond.slice(1), 10);
        result.isAbsoluteBond = true;
      } else {
        result.bond = parseInt(rawBond, 10);
        result.isAbsoluteBond = false;
      }
    }

    // 5. Extract Romance (supports: Romance: +1, Romance: [+1], Romance: 1/5, etc.)
    var romanceMatch = text.match(/(?:Romance(?:\s*Level)?)\s*[:=\-]?\s*[\[\(]?\s*([=+\-]?\s*\d+)/i);
    if (romanceMatch) {
      var rawRomance = romanceMatch[1].replace(/\s+/g, '');
      if (rawRomance.startsWith("=")) {
        result.romance = parseInt(rawRomance.slice(1), 10);
        result.isAbsoluteRomance = true;
      } else {
        result.romance = parseInt(rawRomance, 10);
        result.isAbsoluteRomance = false;
      }
    }

    // 6. Context & Scene-Aware Intelligence
    var recentCorpus = "";
    if (Array.isArray(history) && history.length > 0) {
      recentCorpus = history.slice(-6).map(h => (h ? (h.text || h.rawText || "") : "")).join(" ");
    }
    var fullScene = (recentCorpus + " " + text).toLowerCase();

    var isSexOrIntimacy = /\b(cock|pussy|dick|shaft|thrust\w*|inside (her|me|him|them)|cervix|wet|folds|naked|climax|orgasm|moan\w*|groan\w*|legs wide|tight walls|whimper\w*|sucking|blowjob|fellatio|condom|sex|making love|naked skin)\b/i.test(fullScene);

    // If the model echoed dummy text or omitted a real monologue, generate an authentic thought based on the scene:
    if (!result.thought) {
      if (isSexOrIntimacy) {
        result.thought = `Being so completely intimate together was intense... experiencing that vulnerability brings us closer.`;
      } else {
        result.thought = `Reflecting on recent events and keeping my own priorities in mind as things progress.`;
      }
    }

    // Explicit sexual intimacy guarantee
    if (isSexOrIntimacy) {
      if (result.bond === undefined || result.bond < 1) {
        result.bond = 1;
        result.isAbsoluteBond = false;
      }
      if (result.romance === undefined || result.romance <= 0) {
        result.romance = 1;
        result.isAbsoluteRomance = false;
      }
      if (!result.mood || result.mood === "Neutral") {
        result.mood = "Passionate";
      }
      if (!result.agenda) {
        result.agenda = `Deepen our intimacy and explore what this connection means.`;
      }
    }

    // Anti-Sycophancy Defaults:
    // If the LLM omitted Bond, Romance, or Mood, default to 0 (NO CHANGE).
    // Never inject unearned loyalty or false hostility!
    if (result.bond === undefined) {
      result.bond = 0;
      result.isAbsoluteBond = false;
    }
    if (result.romance === undefined) {
      result.romance = 0;
      result.isAbsoluteRomance = false;
    }
    if (!result.mood) {
      result.mood = "Neutral";
    }

    return result;
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

    var pastMemoriesText = "";
    if (charData.thoughts && Array.isArray(charData.thoughts) && charData.thoughts.length > 0) {
      var filteredPast = charData.thoughts.filter(t => t && t !== charData.coreMemory && !/deep thoughts|thoughts about the protagonist/i.test(t));
      if (filteredPast.length > 0) {
        pastMemoriesText = `\n[Memory History]\n` + filteredPast.slice(0, 3).map(t => `• "${t}"`).join("\n") + "\n";
      }
    }

    var cardContent = `[${cardTitle} - Relationship Status]\n` +
      `• Mood: ${moodDesc}\n` +
      `• Bond: ${this.renderBondBar(charData.bond)} (${bondSign}) ${bondDesc}\n` +
      `• Romance: ${this.renderRomanceBar(charData.romance)} (${charData.romance}/5) ${romanceDesc}\n\n` +
      agendaText +
      coreMemoryText +
      pastMemoriesText;

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
  },

  // Live System Console Story Card: displays dashboard, countdown, and active character
  syncSystemConsoleCard(state) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;
    this.init(state);

    var cardTitle = "AttachLink System Console";
    var turns = (state.attachLink && state.attachLink.turnsSinceReflection) || 0;
    var maxTurns = AttachLinkConfig.reflectionCooldown || 15;
    var remaining = Math.max(0, maxTurns - turns);
    var active = (state.attachLink && state.attachLink.activeChar) || "None detected in current scene";

    var charLines = [];
    if (state.attachLink && state.attachLink.characters) {
      for (var name in state.attachLink.characters) {
        var d = state.attachLink.characters[name];
        if (!d) continue;
        var bDesc = AttachLinkConfig.bondLevels[d.bond ? d.bond.toString() : "0"] || "Neutral";
        var rDesc = AttachLinkConfig.romanceLevels[d.romance ? d.romance.toString() : "0"] || "Platonic";
        var bSign = d.bond > 0 ? `+${d.bond}` : d.bond;
        charLines.push(`  • ${name}: Bond ${bSign} (${bDesc}) | Romance ${d.romance || 0}/5 (${rDesc}) | Mood: ${d.mood || 'Neutral'}`);
      }
    }

    var charSection = charLines.length > 0
      ? charLines.join("\n")
      : "  • (No characters tracked yet. Create a Character Story Card or type /track [Name])";

    var cardContent = `[AttachLink Engine v4.3 - System Dashboard]\n` +
      `• Active NPC in Scene: ${active}\n` +
      `• Reflection Countdown: Turn ${turns} / ${maxTurns} (${remaining} turns until auto-pause)\n` +
      `• Tracking Mode: Character Story Cards & Manual Commands\n\n` +
      `[Tracked Relationships]\n` +
      `${charSection}\n\n` +
      `[Quick Commands]\n` +
      `• /reflect [Name] : Pause immediately to reflect on relationship (e.g. /reflect Vera)\n` +
      `• /track [Name]   : Add an unlisted NPC to tracking (e.g. /track Vera)\n` +
      `• /status         : Display current countdown status in chat`;

    var cardNotes = `📖 [ATTACHLINK SYSTEM CONSOLE GUIDE]\n` +
      `This system card provides a real-time status dashboard for AttachLink.\n` +
      `It updates automatically every turn and tracks cooldowns and active characters.\n` +
      `(Consumes 0 prompt tokens during story generation).`;

    var keys = "AttachLink, AttachLink System, System Console, status, dashboard, console";
    var type = "System";

    var index = storyCards.findIndex(c => c && (c.title === cardTitle || c.name === cardTitle));
    if (index !== -1) {
      if (typeof updateStoryCard === 'function') {
        try { updateStoryCard(index, keys, cardContent, type, cardTitle, cardNotes); }
        catch (e) { try { updateStoryCard(index, keys, cardContent, type); } catch (e2) {} }
      }
      if (storyCards[index]) {
        storyCards[index].entry = cardContent;
        storyCards[index].description = cardNotes;
        storyCards[index].notes = cardNotes;
      }
    } else {
      if (typeof addStoryCard === 'function') {
        try { addStoryCard(keys, cardContent, type, cardTitle, cardNotes); }
        catch (e) { try { addStoryCard(keys, cardContent, type); } catch (e2) {} }
      }
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
  },

  // Scans recent history to find prominent NPC names in the current scene (e.g. "Vera")
  findProminentNameInScene(history) {
    if (!Array.isArray(history) || history.length === 0) return null;
    var recent = history.slice(-5);
    var corpus = recent.map(h => (h ? (h.text || h.rawText || "") : "")).join(" ");
    var words = corpus.match(/\b[A-Z][a-z]{2,15}\b/g) || [];
    var counts = {};
    for (var w of words) {
      if (this.isBannedWord(w)) continue;
      // Reject if known location or concept title
      if (typeof storyCards !== 'undefined' && Array.isArray(storyCards)) {
        var isPlace = storyCards.some(c => c && c.title && c.title.trim().toLowerCase() === w.toLowerCase());
        if (isPlace) continue;
      }
      counts[w] = (counts[w] || 0) + 1;
    }
    var best = null;
    var max = 0;
    for (var name in counts) {
      if (counts[name] > max) {
        max = counts[name];
        best = name;
      }
    }
    return best;
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

// 2. Multi-word leak cleaner: completely wipes leftover thought traces and system banners from text
AttachLink.cleanContextLeaks = function(text) {
  if (!text) return "";
  var cleaned = text.replace(/(?:^|\n)\s*[\(\[\*]*\s*[^:\n\r]+?(?:'s)?\s*AttachLink(?:\s*(?:Consolidation|Summary|Update))?\s*[:=\-][^\n]*\n*/gi, "\n\n");
  // Clean any lingering pause menu notices or system banners from context so AI never sees or imitates them
  cleaned = cleaned.replace(/(?:^|\n)\s*>>>\s*[🧠💡]\s*\[AttachLink[^\]]*\][^\n<]*<<<\s*/gi, "\n\n");
  return cleaned.trim();
};

// Ensure globals are exported on globalThis
if (typeof globalThis !== 'undefined') {
  globalThis.AttachLinkConfig = AttachLinkConfig;
  globalThis.AttachLink = AttachLink;
}