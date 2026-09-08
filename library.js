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
  thoughtChancePercent: 65,      // % chance per turn for active NPC to form a thought
  lookbackTurnsForPresence: 5,   // Actions back to check who is active in the scene
  MAX_THOUGHTS_BEFORE_SUMMARY: 5, // Triggers automatic memory consolidation at 5 thoughts

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
  },

  // Keywords that adjust relationship as fallback when LLM deltas are omitted
  keywords: {
    bondInc: ["friend", "trust", "help", "protect", "save", "smile", "laugh", "thank", "kind", "honest", "promise", "safe", "gift", "hug", "care", "praise", "comfort"],
    bondDec: ["hate", "despise", "betray", "lie", "threaten", "attack", "insult", "mock", "cold", "ignore", "steal", "abandon", "enemy", "disgust", "hostile", "strike"],
    romanceInc: ["kiss", "blush", "caress", "attracted", "holding hands", "crush", "date", "romantic", "gaze", "whisper", "sensual", "undress", "embrace", "love you", "heart race"],
    romanceDec: ["just friends", "stop", "pull away", "uninterested", "break up", "rejection", "turned off", "platonic"]
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

// Negation-aware keyword matcher (prevents "don't trust" from counting as positive trust)
var matchWordSafe = function(text, word) {
  var clean = escapeRegex(word);
  var regex = new RegExp(`(?<!\\b(?:not|never|no|don't|dont|cannot|can't|hardly)\\s+(?:really\\s+)?)\\b${clean}\\b`, 'i');
  return regex.test(text);
};

// ==================== CORE ENGINE ====================
var AttachLink = {
  init(state) {
    if (!state.attachLink) {
      state.attachLink = {
        characters: {},  // Active tracked characters with cards
        candidates: {},  // Sightings buffer for new, unverified NPCs
        activeChar: null,
        bootstrapped: false // One-shot flag: create cards for all pre-existing NPC story cards
      };
    }

    // On very first run, immediately generate AttachLink cards for all named NPCs
    // that already have story cards (physical description, personality, etc.)
    if (!state.attachLink.bootstrapped) {
      state.attachLink.bootstrapped = true;
      this.bootstrapExistingNPCs(state);
    }
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
      for (var card of storyCards) {
        if (!card || !card.title) continue;
        var title = card.title.trim();

        // 1. If it's an existing AttachLink card, extract the original character name
        if (/AttachLink/i.test(title)) {
          var match = title.match(/^(.+?)(?:'s)?\s*AttachLink/i);
          if (match && match[1].trim()) {
            names.add(match[1].trim());
          }
          continue;
        }

        // 2. If it's a character card, keep the FULL multi-word name
        var cardType = (card.type || "").toLowerCase();
        var isExplicitChar = cardType === "character" || cardType === "person" || cardType === "npc";

        // Heuristic: no type set but entry reads like a character description.
        // Deliberately broad to catch cards like "Frenni Fazclaire" which may not
        // have type="character" but clearly describe a named person.
        var entryText = (card.entry || card.description || "");
        var isLikelyChar = !isExplicitChar && entryText.length > 30 &&
          /\b(she|he|her|his|hers|him|they|them|woman|man|girl|boy|named|wears|stands|weighs|hair|eyes|ears|tall|inches|feet|pounds|personality|charismatic|introverted|extroverted|shy|confident|kind|cruel|brave|singer|manager|guard|servant|lord|lady|doctor|professor)\b/i.test(entryText);

        // Also catch any card whose title is a Proper Name(s) with a non-trivial entry
        var titleLooksLikeName = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}$/.test(title) && entryText.length > 20;

        if (isExplicitChar || isLikelyChar || titleLooksLikeName) {
          names.add(title);
        }
      }
    }
    return names;
  },

  // Checks if a character's AttachLink story card already exists
  attachLinkCardExists(charName) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return false;
    var cardTitle = `${charName}'s AttachLink`;
    return storyCards.some(c => c && (c.title === cardTitle || c.name === cardTitle));
  },

  // One-shot boot: generates AttachLink cards for ALL NPCs that already have story cards.
  // This runs automatically the very first time AttachLink initialises in a scenario,
  // giving every pre-existing named NPC (e.g. Frenni Fazclaire) an instant tracking card.
  bootstrapExistingNPCs(state) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;

    var recognized = this.getRecognizedCharacters();
    for (var name of recognized) {
      this.ensureCharacter(name, state);
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
        thoughts: [],     // Monologue buffer (cleared at consolidation)
        coreMemory: "",   // Permanent consolidated foundation
        lastSeenAction: 0
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

  // Apply LLM-generated reflection deltas directly (Primary Agentic Engine)
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

    // Bond delta (-5 to +5)
    if (typeof deltas.bond === 'number' && !isNaN(deltas.bond)) {
      charData.bond = Math.max(-5, Math.min(5, charData.bond + deltas.bond));
    }

    // Romance delta (0 to 5, only advances if Bond >= 0)
    if (typeof deltas.romance === 'number' && !isNaN(deltas.romance)) {
      if (deltas.romance > 0) {
        if (charData.bond >= 0) {
          charData.romance = Math.min(5, charData.romance + deltas.romance);
        }
      } else {
        charData.romance = Math.max(0, charData.romance + deltas.romance);
      }
    }

    // Severe hostility naturally deteriorates romance
    if (charData.bond <= -3 && charData.romance > 0) {
      charData.romance = Math.max(0, charData.romance - 1);
    }
  },

  // Fallback: Updates Bond and Romance via negation-safe keyword scanning
  updateMeters(text, state) {
    this.init(state);
    var active = state.attachLink.activeChar;
    if (!active || !text) return;

    var charData = this.ensureCharacter(active, state);
    var kw = AttachLinkConfig.keywords;

    // Bond Track: Can increase to +5 or deteriorate to -5
    if (kw.bondInc.some(w => matchWordSafe(text, w)) && charData.bond < 5) charData.bond++;
    if (kw.bondDec.some(w => matchWordSafe(text, w)) && charData.bond > -5) charData.bond--;

    // Romance Track: Advances only if bond is not hostile (Bond >= 0)
    if (kw.romanceInc.some(w => matchWordSafe(text, w)) && charData.bond >= 0 && charData.romance < 5) {
      charData.romance++;
    }
    if (kw.romanceDec.some(w => matchWordSafe(text, w)) && charData.romance > 0) {
      charData.romance--;
    }

    // Hostility checks
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
      `🧠 5-THOUGHT CONSOLIDATION CYCLE:\n` +
      `• Thoughts accumulate from 1 to 5 as you interact.\n` +
      `• At 5 thoughts, the AI synthesizes them into a permanent "Core Impression" and updates their "Secret Agenda".\n` +
      `• The thoughts reset to 0 to keep the Story Card token-friendly.`;
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
    var thoughtsText = charData.thoughts.length > 0
      ? charData.thoughts.map((t, i) => `  ${i + 1}. "${t}"`).join("\n")
      : "  (Formulating initial impressions...)";

    var cardContent = `[${cardTitle} - Relationship Status]\n` +
      `• Mood: ${moodDesc}\n` +
      `• Bond: ${this.renderBondBar(charData.bond)} (${bondSign}) ${bondDesc}\n` +
      `• Romance: ${this.renderRomanceBar(charData.romance)} (${charData.romance}/5) ${romanceDesc}\n\n` +
      agendaText +
      coreMemoryText +
      `\nRecent Thoughts (${charData.thoughts.length}/5):\n` +
      `${thoughtsText}\n\n` +
      `(At 5 thoughts, memories auto-summarize into Core Impression & Agenda)`;

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