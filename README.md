# AttachLink 🔗
### *Living NPC Minds, Dynamic Bonds, and Emotional Chemistry~*
Made with ❤️ by Nealverse

---

## Overview

**AttachLink** is an advanced relationship, cognitive memory, and emotional chemistry engine for **AI Dungeon**. It brings your story's characters to life by tracking their personal impressions, shifting moods, secret agendas, and evolving feelings toward your protagonist over long adventures.

Whether your story is an epic fantasy, gritty sci-fi, slice-of-life, or intense romance, AttachLink seamlessly simulates companion minds:
- **Dual-Track Relationships:** Tracks both deep emotional friendship/trust (**Bond -5 to +5**) and romantic passion (**Romance 0 to 5**).
- **Pause & Reflect System:** Every 15 turns (or on-demand with `/reflect`), the story pauses so NPCs can write unfiltered, authentic inner monologues evaluating what just happened.
- **Scene-Aware Intimacy Scaling:** Intimate, romantic, sexual, or life-or-death combat scenes dynamically surge romance and bonds.
- **Live System Console Dashboard:** Real-time in-game countdown and status dashboard story card.
- **Zero Story Pollution:** Cleanly swallows commands with zero immersion breaks or command text leaks.

---

## Main Features

| Feature | Description |
|:---|:---|
| 🎭 **Dual-Track Progression** | Independent tracking for **Bond** (-5 Nemesis to +5 Inseparable) and **Romance** (0 Platonic to 5 Soulmates). |
| 📊 **Visual Progress Meters** | Companion cards display animated ASCII/Unicode gauges: `[───── │ ►►►──] (+3)` and `[♥♥♥♡♡] (3/5)`. |
| 🧠 **Pause Menu Reflection** | Automatically pauses the story every 15 turns to allow NPCs to reflect on your actions and update their feelings. |
| 📜 **Memory History Timeline** | Preserves milestone reflections over time so you can look back on your relationship's emotional journey. |
| 💖 **Intimacy & Scene Awareness** | Detects romance, sex, and shared battles, dynamically surging romance and bond levels. |
| 🖥️ **Live System Console Card** | A dedicated system story card tracking active NPCs, turn countdowns, and quick command references. |
| ⚡ **Turn 0 Lore Bootstrapping** | Reads existing character cards, Plot Essentials, and Opening Scenarios to initialize relationships immediately. |
| 🛡️ **Anti-Leak & Strict Filtering** | Never leaks internal thought tags into adventure text. Strictly ignores locations, items, and words like *Her* or *Pacific*. |
| 💬 **In-Game Slash Commands** | Quick commands like `/reflect [Name]`, `/track [Name]`, and `/status` with zero text leakage. |

---

## Relationship Tracks & Spectrum

### 🤝 The Bond Spectrum (-5 to +5)
Represents friendship, loyalty, respect, and emotional trust:

| Level | Standing | Description |
|:---:|:---|:---|
| **[-5]** | **Sworn Nemesis** | Lethal hatred, vengeful hostility, and mortal enmity. |
| **[-4]** | **Bitter Foe** | Active animosity, malicious sabotage, and deep bitterness. |
| **[-3]** | **Open Adversary** | Hostile friction, open rivalry, and constant conflict. |
| **[-2]** | **Unfriendly** | Cold dislike, irritation, and palpable social tension. |
| **[-1]** | **Distrustful** | Guarded, suspicious, and skeptical of your motives. |
| **[ 0]** | **Neutral** | Stranger or casual acquaintance; no strong feelings yet. |
| **[+1]** | **Cordial** | Polite warmth, friendly ease, and approachable demeanor. |
| **[+2]** | **Companion** | Enjoyable company, casual friend, and reliable presence. |
| **[+3]** | **Reliable Friend** | Trustworthy ally, supportive confidant, and faithful friend. |
| **[+4]** | **Close Confidant** | Deep emotional vulnerability, mutual secrets, and fierce loyalty. |
| **[+5]** | **Inseparable** | Unconditional devotion, soul-bound loyalty, and unbreakable bond. |

---

### 💖 The Romance Track (0 to 5)
Represents romantic attraction, desire, and emotional intimacy:

| Level | Stage | Description |
|:---:|:---|:---|
| **[0/5]** | **Platonic** | No romantic feelings or physical attraction. |
| **[1/5]** | **Subtle Spark** | Passing butterflies, subtle blushing, and curious glances. |
| **[2/5]** | **Mutual Crush** | Flustered attraction, playful flirting, and active romantic interest. |
| **[3/5]** | **Lovers / Partners** | Open romantic affection, dating, and passionate intimacy. |
| **[4/5]** | **Deep Devotion** | Intense love, physical and emotional commitment, and profound passion. |
| **[5/5]** | **Eternal Soulmates** | Unbreakable romantic devotion bound by true, timeless love. |

---

## In-Game Slash Commands

AttachLink commands are entered directly into the player action box. They are cleanly swallowed by the engine and **never leak into your story history**:

- **`/reflect [Optional Name]`**  
  *Examples:* `/reflect` or `/reflect Mia`  
  Forces an immediate relationship reflection turn for the active character (or specified NPC). The NPC will analyze the recent scene, write an authentic inner monologue, and update their stats.
- **`/track [Name]`**  
  *Examples:* `/track Vera` or `/track Claire Stanfield`  
  Immediately begins tracking an unlisted NPC who doesn't have an original base card. Generates their companion card and adds them to the System Console.
- **`/status`**  
  Displays the current active character and the exact turns remaining until the next automatic reflection pause.

---

## Scenario Script Install Guide

### Step 1: Open Script Settings
1. Open the [AI Dungeon website](https://play.aidungeon.com/) on PC (or Desktop view on mobile).
2. Edit your scenario (or create a new one).
3. Navigate to the **DETAILS** tab at the top.
4. Scroll down to **Scripting** and toggle **Scripts Enabled** to ON.
5. Click **EDIT SCRIPTS**.

---

### Step 2: Paste Tab Codes

#### 1. The `Input` Tab
Select the **Input** tab, delete any existing code, and paste:
```javascript
// AttachLink - Input Modifier
var modifier = (text) => {
  try {
    if (typeof AttachLink !== 'undefined') {
      AttachLink.init(state);
      AttachLink.resolveActiveCharacter(state, history);

      var trimmed = text.trim();

      // Command: /track [Name]
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

      // Command: /reflect [Optional Name]
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
```

---

#### 2. The `Context` Tab
Select the **Context** tab, delete any existing code, and paste:
```javascript
// AttachLink - Context Modifier
var modifier = (text) => {
  try {
    let cleanedText = typeof AttachLink !== 'undefined' && AttachLink.cleanContextLeaks
      ? AttachLink.cleanContextLeaks(text)
      : text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    AttachLink.init(state);

    const activeChar = AttachLink.resolveActiveCharacter(state, history);
    const targetChar = (state.attachLink && state.attachLink.reflectingCharacter) || activeChar;

    let finalText = cleanedText;

    if (targetChar) {
      const charData = AttachLink.ensureCharacter(targetChar, state);
      const currentAction = (typeof info !== 'undefined' && info.actionCount) ? info.actionCount : 0;

      const emotionalContext = AttachLink.getPromptContext(state);
      if (typeof state.memory === 'string') {
        if (!state.memory.includes("[AttachLink:")) {
          state.memory = emotionalContext + (state.memory ? "\n" + state.memory : "");
        }
      } else {
        state.memory = state.memory || {};
        state.memory.frontMemory = emotionalContext;
      }

      let taskPrompt = "";
      const isReflecting = state.attachLink && state.attachLink.isReflecting;
      const turns = (state.attachLink && state.attachLink.turnsSinceReflection) || 0;

      if (isReflecting || (currentAction > 0 && turns >= AttachLinkConfig.reflectionCooldown)) {
        state.attachLink.isReflecting = true;
        state.attachLink.reflectingCharacter = state.attachLink.reflectingCharacter || targetChar;
        taskPrompt = `\n\n[Task: STOP THE STORY & REFLECT. Step into the mind of ${targetChar} and reflect deeply on what just happened in the recent scene with the protagonist.
Write ${targetChar}'s authentic, unfiltered first-person internal monologue in quotes (what she is feeling, thinking about the protagonist, and desiring next).
Evaluate her updated relationship stats based on the scene:
• Physical intimacy / Sex / Romance: Increase Romance (+1 to +2) and Bond (+1 to +2). Mood: Passionate, Devoted, Loving, or Flustered.
• Teamwork / Friendship / Bonding: Increase Bond (+1 to +2). Mood: Warm, Cordial, or Cheerful.
• Conflict / Betrayal / Fear: Decrease Bond (-1 to -2). Mood: Guarded, Distrustful, or Hostile.
Format strictly as:
(${targetChar}'s AttachLink: "[1-3 sentences of genuine inner monologue reacting directly to the recent scene]" | Mood: [Emotion] | Agenda: [What she secretly desires or wants next] | Bond: [+/-1 to +/-3] | Romance: [+/-1 to +/-3])
Rules:
• Do NOT copy bracket placeholders. Write genuine thoughts for ${targetChar}.
• Do NOT continue the story or write dialogue.]\n`;
      }

      if (taskPrompt) {
        const fittedBase = AttachLink.fitContext(cleanedText, taskPrompt.length);
        finalText = fittedBase + taskPrompt;
      }
    }

    return { text: finalText };
  } catch (err) {
    return { text };
  }
};

modifier(text);
```

---

#### 3. The `Output` Tab
Select the **Output** tab, delete any existing code, and paste:
```javascript
// AttachLink - Output Modifier
var modifier = (text) => {
  try {
    let cleanedText = text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    // 1. Handle Command Messages
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

    // 2. Handle Automatic or Manual Pause Menu Reflection
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

      state.attachLink.turnsSinceReflection = 0;
      state.attachLink.isReflecting = false;
      state.attachLink.reflectingCharacter = null;
      
      cleanedText = `\n\n>>> 🧠 [AttachLink Update] ${charName || "The characters are"} reflecting on your actions... Relationship updated! Please press continue to resume the story. <<<\n`;
    }

    cleanedText = AttachLink.cleanContextLeaks(cleanedText);

    if (state.attachLink && state.attachLink.characters) {
      for (var cName of Object.keys(state.attachLink.characters)) {
        AttachLink.syncStoryCard(state, cName);
      }
    }

    AttachLink.syncSystemConsoleCard(state);

    return { text: cleanedText };
  } catch (err) {
    return { text };
  }
};

modifier(text);
```

---

#### 4. The `Library` Tab
1. Select the **Library** tab on the left.
2. Delete any existing code.
3. Copy the full contents of [`library.js`](./library.js) and paste it into your empty **Library** tab.
4. Click the yellow **SAVE** button in the top right corner!

---

## For Creators: The Control Panel

At the very top of `library.js`, you'll find the creator configuration block:

```javascript
var AttachLinkConfig = {
  // 1. Manually specified characters (Supports full names, e.g. ["Marie Onette", "Claire"])
  MANUAL_CHARACTERS: [""],

  // 2. NPC Detection Scope
  // Set to false (default) so only real NPCs with Character Story Cards receive companion cards.
  // This completely prevents common words like "Her", "And", "Pacific" from turning into cards!
  autoDiscoverUnlistedNPCs: false,

  // 3. Automation Settings
  autoDetectFromStoryCards: true,             // Existing character cards are tracked immediately on Turn 0
  autoGenerateStoryCardsForExistingNPCs: true, // Immediately generates companion cards for all detected NPCs
  reflectionCooldown: 15,                     // Turns between automatic pause-and-reflect cycles
  lookbackTurnsForPresence: 5                 // Number of recent turns inspected for active character presence
};
```

---

## Gameplay & World-Building Tips

- **Read Your System Console:** AttachLink automatically maintains a story card titled `AttachLink System Console`. Open it to check turn countdowns and current standing with all tracked characters.
- **Natural Evolution:** Relationships evolve based on your actions. Spending time talking, sharing secrets, or protecting an NPC raises Bond. Flirting, romantic gestures, and physical intimacy advance Romance.
- **Intimacy Reactivity:** Sexual and romantic encounters naturally trigger Romance surges (advancing toward Lovers and Eternal Soulmates) and update the character's core thoughts.
- **NPCs Remember:** Each character's `Core Impression` is continuously supplied to the AI in the background, subtly steering how they talk to and treat you.
- **Milestone Memories:** Check your companion story cards periodically! You'll see their latest impression at the top, along with a `[Memory History]` timeline of past key moments.

---

## Permissions & Open Source

AttachLink is free and open-source. You have full permission to use, share, modify, or embed AttachLink in any of your personal or published AI Dungeon scenarios. Please enjoy, and have fun building living worlds! ❤️

---

<p align="center"><b>AttachLink v4.3</b> · Built for AI Dungeon with passion and care.</p>

