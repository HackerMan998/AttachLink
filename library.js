/* ==========================================================================
   UNIVERSAL ATTACHLINK ENGINE v3.1 (NEUTRAL RELATIONSHIP PIPELINE)
   Works for ANY Scenario: Fantasy, Sci-Fi, Slice-of-Life, Romance, etc.
   ========================================================================== */

const AttachLinkConfig = {
  // 1. Manually specified characters (Optional: add major character names here)
  MANUAL_CHARACTERS: [],

  // 2. Anti-Spam Sighting Filter (Fixes the "Bartender Problem")
  // Unlisted NPCs must persist continuously across this many turns before receiving a card
  NEW_NPC_SIGHTING_THRESHOLD: 10,

  // 3. Automation Settings
  autoDetectFromStoryCards: true, // Existing character cards are tracked immediately
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

  // Keywords that adjust relationship
  keywords: {
    bondInc: ["friend", "trust", "help", "protect", "save", "smile", "laugh", "thank", "kind", "honest", "promise", "safe", "gift", "hug", "care", "praise"],
    bondDec: ["hate", "despise", "betray", "lie", "threaten", "attack", "insult", "mock", "cold", "ignore", "steal", "abandon", "enemy", "disgust", "hostile"],
    romanceInc: ["kiss", "blush", "caress", "attracted", "holding hands", "crush", "date", "romantic", "gaze", "whisper", "sensual", "undress", "embrace", "love you", "heart race"],
    romanceDec: ["just friends", "stop", "pull away", "uninterested", "break up", "rejection", "turned off", "platonic"]
  }
};

// Common capitalized sentence starters to ignore during name detection
const BANNED_CANDIDATE_WORDS = new Set([
  "The", "A", "An", "You", "Your", "He", "She", "They", "We", "It", "Suddenly",
  "Meanwhile", "Inside", "Outside", "Then", "After", "Before", "When", "There",
  "Here", "What", "How", "Why", "Yes", "No", "Please", "Look", "Come", "Go"
]);

const matchWord = (text, word) => {
  const clean = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${clean}\\b`, 'i').test(text);
};

// ==================== CORE ENGINE ====================
const AttachLink = {
  init(state) {
    if (!state.attachLink) {
      state.attachLink = {
        characters: {}, // Active tracked characters with cards
        candidates: {}, // Sightings buffer for new, unverified NPCs
        activeChar: null
      };
    }
  },

  // Collect all immediately recognized character names from Story Cards
  getRecognizedCharacters() {
    const names = new Set(AttachLinkConfig.MANUAL_CHARACTERS);

    if (AttachLinkConfig.autoDetectFromStoryCards && Array.isArray(storyCards)) {
      for (const card of storyCards) {
        if (card.type && card.type.toLowerCase() === "character" && card.title) {
          const cleanName = card.title.split(/['’\s]/)[0].trim();
          if (cleanName.length > 1 && !cleanName.includes("AttachLink")) {
            names.add(cleanName);
          }
        }
      }
    }
    return names;
  },

  // Initialize a character with a 100% neutral baseline
  ensureCharacter(name, state) {
    this.init(state);
    if (!state.attachLink.characters[name]) {
      state.attachLink.characters[name] = {
        name: name,
        bond: 0,       // Stage 0: Neutral Acquaintance (-5 to +5)
        romance: 0,    // Stage 0: Platonic (0 to 5)
        thoughts: [],  // Monologue bank
        coreMemory: "",// Permanent consolidated foundation
        lastSeenAction: 0
      };
    }
    return state.attachLink.characters[name];
  },

  // Scans history for presence, manages anti-spam discovery and candidate decay
  resolveActiveCharacter(state, history) {
    this.init(state);
    const currentAction = info.actionCount || 0;
    const lookback = AttachLinkConfig.lookbackTurnsForPresence;
    const recentHistory = Array.isArray(history) ? history.slice(-lookback) : [];
    const textCorpus = recentHistory.map(h => (h.text || h.rawText || "")).join(" ");
    const lowerCorpus = textCorpus.toLowerCase();

    const recognized = this.getRecognizedCharacters();

    // 1. Scan for potential proper names
    const potentialNames = textCorpus.match(/\b[A-Z][a-z]{2,15}\b/g) || [];
    const seenThisTurn = new Set();

    for (const rawName of potentialNames) {
      if (BANNED_CANDIDATE_WORDS.has(rawName) || recognized.has(rawName)) continue;
      seenThisTurn.add(rawName);

      // Increment sighting counter
      state.attachLink.candidates[rawName] = (state.attachLink.candidates[rawName] || 0) + 1;

      // When an unlisted NPC persists for the full threshold, promote them!
      if (state.attachLink.candidates[rawName] >= AttachLinkConfig.NEW_NPC_SIGHTING_THRESHOLD) {
        this.ensureCharacter(rawName, state);
        delete state.attachLink.candidates[rawName];
      }
    }

    // 2. CANDIDATE DECAY: One-off side characters fade away if not actively present
    for (const name in state.attachLink.candidates) {
      if (!seenThisTurn.has(name)) {
        state.attachLink.candidates[name]--;
        if (state.attachLink.candidates[name] <= 0) {
          delete state.attachLink.candidates[name];
        }
      }
    }

    // 3. Select the best active character currently in the scene
    const allTracked = Object.keys(state.attachLink.characters).concat(Array.from(recognized));
    const uniqueTracked = [...new Set(allTracked)];
    if (uniqueTracked.length === 0) return null;

    let bestChar = null;
    let highestScore = -999;

    for (const name of uniqueTracked) {
      const charData = this.ensureCharacter(name, state);
      const lower = name.toLowerCase();
      const matches = (lowerCorpus.match(new RegExp(`\\b${lower}\\b`, "g")) || []).length;

      if (matches > 0) charData.lastSeenAction = currentAction;
      const turnsSinceSeen = currentAction - (charData.lastSeenAction || 0);

      // Priority calculation: (Presence * 15) - (Absence Decay * 3)
      let score = (matches * 15) - (turnsSinceSeen * 3);
      if (AttachLinkConfig.MANUAL_CHARACTERS.includes(name)) score += 5;

      if (score > highestScore && turnsSinceSeen <= 10) {
        highestScore = score;
        bestChar = name;
      }
    }

    state.attachLink.activeChar = bestChar;
    return bestChar;
  },

  // Updates Bond (-5 to +5) and Romance (0 to 5) bidirectionally
  updateMeters(text, state) {
    this.init(state);
    const active = state.attachLink.activeChar;
    if (!active) return;

    const charData = this.ensureCharacter(active, state);
    const kw = AttachLinkConfig.keywords;

    // Bond Track: Can increase to +5 or deteriorate to -5
    if (kw.bondInc.some(w => matchWord(text, w)) && charData.bond < 5) charData.bond++;
    if (kw.bondDec.some(w => matchWord(text, w)) && charData.bond > -5) charData.bond--;

    // Romance Track: Advances only if bond is not hostile (Bond >= 0)
    if (kw.romanceInc.some(w => matchWord(text, w)) && charData.bond >= 0 && charData.romance < 5) {
      charData.romance++;
    }
    if (kw.romanceDec.some(w => matchWord(text, w)) && charData.romance > 0) {
      charData.romance--;
    }

    // Severe hostility naturally deteriorates romance
    if (charData.bond <= -3 && charData.romance > 0) {
      charData.romance = Math.max(0, charData.romance - 1);
    }
  },

  // Ultra-compact context injection
  getPromptContext(state) {
    this.init(state);
    const active = state.attachLink.activeChar;
    if (!active) return "";

    const charData = this.ensureCharacter(active, state);
    const bondDesc = AttachLinkConfig.bondLevels[charData.bond.toString()];
    const romanceDesc = AttachLinkConfig.romanceLevels[charData.romance.toString()];

    let summary = `[AttachLink: ${active} | Bond: ${charData.bond > 0 ? `+${charData.bond}` : charData.bond} (${bondDesc}) | Romance: ${charData.romance}/5 (${romanceDesc})]`;
    if (charData.coreMemory) {
      summary += `\n[${active}'s Core Impression: "${charData.coreMemory}"]`;
    }
    return summary;
  },

  addThought(state, charName, thoughtText) {
    this.init(state);
    const charData = this.ensureCharacter(charName, state);
    const cleaned = thoughtText.trim().replace(/^["“']|["”']$/g, '');
    if (!cleaned || cleaned.length < 4) return;

    charData.thoughts.push(cleaned);
  },

  // Synthesizes thoughts and clears the buffer back to 0
  setConsolidatedMemory(state, charName, summaryText) {
    this.init(state);
    const charData = this.ensureCharacter(charName, state);
    const cleaned = summaryText.trim().replace(/^["“']|["”']$/g, '');
    if (!cleaned || cleaned.length < 6) return;

    charData.coreMemory = cleaned;
    charData.thoughts = []; // Reset raw thoughts back to 0
  },

  renderBondBar(val) {
    const neg = val < 0 ? "◄".repeat(Math.abs(val)) + "─".repeat(5 - Math.abs(val)) : "─────";
    const pos = val > 0 ? "►".repeat(val) + "─".repeat(5 - val) : "─────";
    const center = val === 0 ? "■" : "│";
    return `[${neg} ${center} ${pos}]`;
  },

  renderRomanceBar(val) {
    return `[${'♥'.repeat(val)}${'♡'.repeat(5 - val)}]`;
  },

  // Self-Building Manual for the Story Card's "NOTES" section (Consumes 0 prompt tokens!)
  buildCardNotes(charName) {
    return `📖 [ATTACHLINK USER GUIDE - ${charName.toUpperCase()}]\n` +
      `Tracks ${charName}'s emotional bonds, standing, and subconscious monologues in real time.\n` +
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
      `• At 5 thoughts, the AI synthesizes them into a permanent "Core Impression".\n` +
      `• The thoughts reset to 0 to keep the Story Card token-friendly.`;
  },

  // Sync Story Card (Writes both Entry and Notes)
  syncStoryCard(state, charName) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards) || !charName) return;

    const charData = this.ensureCharacter(charName, state);
    const cardTitle = `${charName}'s AttachLink`;

    const bondSign = charData.bond > 0 ? `+${charData.bond}` : charData.bond;
    const bondDesc = AttachLinkConfig.bondLevels[charData.bond.toString()];
    const romanceDesc = AttachLinkConfig.romanceLevels[charData.romance.toString()];

    let coreMemoryText = charData.coreMemory ? `Core Impression: "${charData.coreMemory}"\n\n` : "";
    let thoughtsText = charData.thoughts.length > 0
      ? charData.thoughts.map((t, i) => `  ${i + 1}. "${t}"`).join("\n")
      : "  (Formulating initial impressions...)";

    const cardContent = `[${cardTitle} - Relationship Status]\n` +
      `• Bond: ${this.renderBondBar(charData.bond)} (${bondSign}) ${bondDesc}\n` +
      `• Romance: ${this.renderRomanceBar(charData.romance)} (${charData.romance}/5) ${romanceDesc}\n\n` +
      `${coreMemoryText}Recent Thoughts (${charData.thoughts.length}/5):\n` +
      `${thoughtsText}\n\n` +
      `(At 5 thoughts, memories auto-summarize into Core Impression)`;

    const cardNotes = this.buildCardNotes(charName);
    const keys = `${charName}, ${cardTitle}, AttachLink, relationship, mind`;
    const type = "Character";

    let index = storyCards.findIndex(c => c.title === cardTitle || c.name === cardTitle);
    if (index !== -1) {
      if (typeof updateStoryCard === 'function') {
        try { updateStoryCard(index, keys, cardContent, type, cardTitle, cardNotes); }
        catch (e) { updateStoryCard(index, keys, cardContent, type); }
      }
      storyCards[index].entry = cardContent;
      storyCards[index].description = cardNotes; // Direct assignment ensures Notes update
    } else {
      if (typeof addStoryCard === 'function') {
        try { addStoryCard(keys, cardContent, type, cardTitle, cardNotes); }
        catch (e) { addStoryCard(keys, cardContent, type); }
      }
    }
  }
};

// ==================== CONTEXT BUDGET & CLEANER ====================

// 1. Trims oldest story history if context exceeds token budget
AttachLink.fitContext = (text, extraCharsNeeded = 200) => {
  const maxLimit = Math.max((info.maxChars || 3500) - extraCharsNeeded - 50, 1500);
  if (text.length <= maxLimit) return text;

  const excess = text.length - maxLimit;
  const cutIndex = text.indexOf("\n\n", excess);
  return cutIndex !== -1 ? text.slice(cutIndex + 2) : text.slice(excess);
};

// 2. Cleans leftover thought traces from recent story so AI never copies them
AttachLink.cleanContextLeaks = (text) => {
  return text.replace(/(?:^|\n)\s*[\(\[\*]*\s*[a-zA-Z]+(?:'s)?\s*AttachLink(?:\s*(?:Consolidation|Summary))?\s*[:=\-][^\n]*\n*/gi, "\n\n").trim();
};