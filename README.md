<p align="center">
  <img src="./assets/cover.jpg" width="800" alt="AttachLink Cover">
</p>

# <p align="center">AttachLink 🔗</p>
### <p align="center"><i>Living NPC Minds, Dynamic Bonds, and Emotional Chemistry for AI Dungeon</i></p>

<p align="center">
  Made with ❤️ by <b>Neal (<a href="https://ko-fi.com/nealverse">Nealverse</a>)</b> · <a href="https://github.com/HackerMan998">HackerMan998</a>
</p>

<p align="center">
  <a href="https://ko-fi.com/nealverse"><img src="https://img.shields.io/badge/Ko--fi-Support%20Nealverse-ff5e5b?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Support on Ko-fi"></a>
  <a href="https://play.aidungeon.com/profile?contentType=scenario&sort=updated"><img src="https://img.shields.io/badge/AI%20Dungeon-Play%20My%20Scenarios-7952e8?style=for-the-badge&logo=gamepad&logoColor=white" alt="AI Dungeon Scenarios"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-CC0_1.0-blue.svg?style=for-the-badge" alt="CC0 1.0 License"></a>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-what-it-looks-like-in-game">In-Game Cards</a> •
  <a href="#-relationship-tracks--story-tones">Tracks & Tones</a> •
  <a href="#-in-game-commands">Commands</a> •
  <a href="#-quick-installation-guide">Installation</a> •
  <a href="#-creator-settings">Settings</a> •
  <a href="#-support--creator-scenarios">Support</a>
</p>

---

## 🌟 Overview

**AttachLink** is an advanced relationship, cognitive memory, and dynamic tone engine designed specifically for **AI Dungeon**.

In default AI Dungeon, companions can easily act generic, sycophantic, or forget recent events over long adventures. **AttachLink** gives your story's characters:
- **Their Own Private Minds:** Personal first-person inner monologues and shifting moods that react to your actions.
- **Hidden Agendas & Independent Agency:** Secret desires and personal goals that steer how they treat you.
- **Dynamic Story Tone:** Switch between **Balanced**, **Gritty** (slow trust, betrayal tracking, realistic grudges), **Romance**, or **Political** (intrigue, leverage) at any time.
- **Toggleable Romance Track:** Fully enable romantic chemistry with heart meters, or completely disable romance for pure platonic/grimdark survival.
- **Dual-Track Progression:** Independent tracking for **Trust & Friendship** (Bond -5 to +5) and **Romantic Passion** (Romance 0 to 5).
- **Milestone Memories:** A growing chronological timeline of shared memories preserved right on their Story Cards.

Whether you're exploring high-fantasy dungeons, surviving gritty grimdark worlds, or playing a cozy romance, your companions will truly feel alive.

---

## ⚡ How It Works

AttachLink works quietly behind the scenes without interrupting your narrative flow:

1. **Automatic Detection & Grudge Calibration (Turn 0):** On the very first turn, it automatically reads your scenario's existing character story cards and opening lore. If a character was abandoned or betrayed in the backstory, AttachLink automatically bootstraps them with realistic animosity (`Bond: -4`, `Mood: Resentful`).
2. **The 15-Turn Pause Menu:** Every 15 turns (or whenever you type `/reflect`), the story temporarily pauses. The companion steps into their own mind, reflects on recent events, writes an authentic inner monologue, and updates their relationship stats.
3. **Dynamic Tone Directives:** Directives adapt to your chosen tone (e.g. Gritty enforces harsh skepticism, while Political prioritizes leverage).
4. **Intimacy & Combat Awareness:** Shared romance, physical intimacy, or surviving life-or-death battles dynamically surge relationship levels.
5. **Real-Time In-Game Customization:** Adjust story tone or toggle romance on/off anytime using slash commands or editing the in-game System Console Story Card!
6. **Zero Immersion Leaks:** Internal commands and reflection prompts are cleanly swallowed—they will never clutter your story text.

---

## 🖥️ What It Looks Like In-Game

AttachLink automatically creates and updates real AI Dungeon Story Cards:

### 1. Companion Relationship Card
Every companion has their own card with live visual meters:

```text
[Mia's AttachLink - Relationship Status]
• Mood: Devoted
• Bond: [───── │ ►►►►►] (+5) Inseparable (Soul-bound loyalty & unbreakable bond)
• Romance: [♥♥♥♥♥] (5/5) Eternal Soulmates (Bound by true, timeless love)

Secret Agenda: "Stay close and build a quiet life together after this quest."
Core Impression: "Being so close to them makes me feel truly safe. When they held my hand through the storm, I knew I never wanted to let go."

[Memory History]
• "They listened to me by the campfire when no one else would."
• "A bit reckless, but they kept their promise to protect our village."
```
*(Note: When Romance Mode is disabled, the Romance gauge is completely hidden for a pure platonic adventure!)*

### 2. Live System Console & Settings Card
A live in-game dashboard story card showing active characters, turn countdowns, and live-editable settings:

```text
[AttachLink Engine v4.5 - System Dashboard & Settings]
• Active NPC in Scene: Mia
• Reflection Countdown: Turn 8 / 15 (7 turns until auto-pause)
• Story Tone: Balanced (Edit to: Balanced | Gritty | Romance | Political | Comedy | Horror)
• Romance Track: Enabled (Edit to: Enabled | Disabled)

[Tracked Relationships]
  • Mia: Bond +5 (Inseparable) | Romance 5/5 | Mood: Devoted
  • Gary: Bond +2 (Companion) | Romance 0/5 | Mood: Cordial

[Quick Commands]
• /tone [mode]      : Set tone (balanced, gritty, romance, political, comedy, horror)
• /romance [on/off] : Toggle romance gauges globally (e.g. /romance off)
• /reflect [Name]   : Pause immediately to reflect on relationship
• /track [Name]     : Add an unlisted NPC to tracking
• /untrack [Name]   : Remove an NPC from tracking and delete card
• /setbond [N] [v]  : Set or adjust bond (e.g. /setbond Mia +1 or /setbond Mia 4)
• /setmood [N] [m]  : Set current mood (e.g. /setmood Mia Anxious)
• /cooldown [turns] : Set reflection interval (e.g. /cooldown 10)
• /list             : View compact summary of all tracked NPCs
• /status           : Display current countdown and settings
```

---

## 📊 Relationship Tracks & Story Tones

AttachLink lets you tailor your adventure's psychological realism to your exact preferences:

### 🎭 Dynamic Story Tone Presets
Change the psychological pacing on the fly with `/tone [mode]` or by editing the `Story Tone:` line in the **AttachLink System Console** story card:

| Tone | Pacing & Behavior | Best For |
|:---:|:---|:---|
| **`balanced`** *(Default)* | Natural human realism, healthy boundaries, and steady pacing. Companions form bonds through shared deeds; casual banter is `Bond: +0`. | High fantasy, slice-of-life, sci-fi adventures. |
| **`gritty`** | **Cynical & consequence-driven.** NPCs prioritize survival, hold realistic grudges, and take deep offense to betrayal or abandonment (`Bond: -1 to -2`). Past abandonment is auto-detected from backstory (`Bond: -4`, `Resentful`). Trust must be bought in blood or sacrifice. | Grimdark, post-apocalyptic, zombie survival, dark fantasy. |
| **`romance`** | **Emotional intimacy & passion.** Highlights fluttering hearts, blushing, vulnerability, and mutual attraction. Shared quiet moments stir chemistry. | Otome, romantic drama, dating sims, slice-of-life romance. |
| **`political`** | **Faction leverage & transactional intrigue.** NPCs evaluate you through mutual utility, leverage, and faction rank. Secret agendas focus on personal ambition or power. | Court intrigue, cyberpunk corporate espionage, kingdom building. |
| **`comedy`** | **Playful banter & comedic friction.** NPCs react with witty sarcasm, dynamic humor, and funny inner monologue observations. Bond shifts through hilarious or chaotic misadventures. | Comedy, anime-style adventures, lighthearted fantasy, buddy cop. |
| **`horror`** | **Paranoia & psychological dread.** NPCs are on edge, wrestling with fear, survival stress, and dread. Trust is fragile and easily shaken by unnatural or unsettling events. | Survival horror, psychological thriller, cosmic horror, Eldritch mystery. |

---

### 🤝 The Bond Track (-5 to +5)
*Measures friendship, loyalty, respect, and mutual trust:*

| Level | Visual Gauge | Standing | What It Means |
|:---:|:---:|:---|:---|
| **-5** | `[◄◄◄◄◄ │ ─────]` | **Sworn Nemesis** | Lethal hatred, mortal enmity, and vengeful hostility. |
| **-4** | `[◄◄◄◄─ │ ─────]` | **Bitter Foe** | Active animosity, malicious sabotage, and bitterness (e.g. past abandonment). |
| **-3** | `[◄◄◄── │ ─────]` | **Open Adversary** | Constant friction, open rivalry, and active defiance. |
| **-2** | `[◄◄─── │ ─────]` | **Unfriendly** | Cold dislike, social tension, and guarded irritation. |
| **-1** | `[◄──── │ ─────]` | **Distrustful** | Skeptical of your motives and guarded with personal info. |
| **0** | `[───── │ ─────]` | **Neutral** | Casual stranger or acquaintance; no strong feelings yet. |
| **+1** | `[───── │ ►────]` | **Cordial** | Polite warmth, friendly ease, and approachable demeanor. |
| **+2** | `[───── │ ►►───]` | **Companion** | Enjoyable company, helpful ally, and casual friend. |
| **+3** | `[───── │ ►►►──]` | **Reliable Friend** | Trustworthy partner, supportive confidant, and faithful ally. |
| **+4** | `[───── │ ►►►►─]` | **Close Confidant** | Deep emotional vulnerability, shared secrets, and fierce loyalty. |
| **+5** | `[───── │ ►►►►►]` | **Inseparable** | Unconditional devotion, soul-bound loyalty, and unbreakable bond. |

---

### 💖 The Romance Track (0 to 5) & Non-Romance Mode
*Measures romantic attraction, desire, emotional chemistry, and physical intimacy:*

| Stage | Hearts Gauge | Relationship | What It Means |
|:---:|:---:|:---|:---|
| **0/5** | `[♡♡♡♡♡]` | **Platonic** | No romantic feelings or physical attraction. Purely platonic. |
| **1/5** | `[♥♡♡♡♡]` | **Subtle Spark** | Passing butterflies, subtle blushing, and curious glances. |
| **2/5** | `[♥♥♡♡♡]` | **Mutual Crush** | Flustered attraction, playful teasing, and mutual romantic interest. |
| **3/5** | `[♥♥♥♡♡]` | **Lovers / Partners** | Open romantic affection, physical intimacy, and passionate dating. |
| **4/5** | `[♥♥♥♥♡]` | **Deep Devotion** | Intense love, physical and emotional commitment, and profound passion. |
| **5/5** | `[♥♥♥♥♥]` | **Eternal Soulmates** | Timeless, unbreakable love and total romantic devotion. |

> 🚫 **Pure Platonic / Non-Romance Gameplay:**  
> Don't want romance in your scenario? Type **`/romance off`** or edit `Romance Track: Disabled` in the System Console card!  
> AttachLink will **completely strip heart meters and romantic directives** from all cards and AI prompts, ensuring the AI strictly focuses on friendship, survival, and loyalty without unwanted flirting. Type **`/romance on`** anytime to restore it.

---

## 💬 In-Game Commands

Simply type these commands into the player action box during gameplay. AttachLink swallows them immediately—**nothing leaks into the story**:

| Command | Example | Description |
|:---|:---|:---|
| **`/tone [mode]`** | `/tone gritty` | Sets story tone (`balanced`, `gritty`, `romance`, `political`, `comedy`, `horror`). |
| **`/romance [on/off]`** | `/romance off` | Globally toggles romance gauges and romantic reflection directives. |
| **`/reflect`** | `/reflect` | Forces an immediate reflection pause for the active character in the current scene. |
| **`/reflect [Name]`** | `/reflect Mia` | Triggers an immediate reflection for a specific companion by name. |
| **`/track [Name]`** | `/track Vera` | Starts tracking an unlisted NPC and creates their companion card. |
| **`/untrack [Name]`** | `/untrack Vera` | Stops tracking an NPC and deletes their companion card. |
| **`/setbond [N] [v]`** | `/setbond Mia +1` | Directly sets or adjusts Bond (`+1`, `-2`, or absolute `4`). |
| **`/setromance [N] [v]`** | `/setromance Mia 3` | Directly sets Romance stage (`0` to `5`). |
| **`/setmood [N] [m]`** | `/setmood Mia Anxious` | Updates companion's current emotional mood. |
| **`/cooldown [turns]`** | `/cooldown 10` | Sets the reflection turn frequency (default: 15). |
| **`/list`** | `/list` | Displays a compact chat overview of all tracked party members. |
| **`/status`** | `/status` | Displays active character, reflection countdown, story tone, and romance mode. |
| **`/attachlink`** | `/al` | Displays a quick command reference guide in-game. |

---

## 🚀 Quick Installation Guide

Setting up AttachLink takes **less than 2 minutes**:

### Step 1: Enable Scripting in AI Dungeon
1. Go to [AI Dungeon](https://play.aidungeon.com/) on PC (or Desktop view on mobile).
2. Edit your scenario and click the **Details** tab.
3. Scroll down to **Scripting**, toggle **Scripts Enabled** to **ON**, and click **Edit Scripts**.

---

### Step 2: Copy & Paste the 4 Tabs

Click each tab below to view and copy the code:

<details>
<summary><b>👉 Tab 1: Input (Click to expand)</b></summary>

Select the **Input** tab in AI Dungeon, delete any existing code, and paste:

```javascript
// AttachLink - Input Modifier
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
```
</details>

<details>
<summary><b>👉 Tab 2: Context (Click to expand)</b></summary>

Select the **Context** tab in AI Dungeon, delete any existing code, and paste:

```javascript
// AttachLink - Context Modifier
var modifier = (text) => {
  try {
    // 1. Clean previous thought leaks from recent text
    let cleanedText = typeof AttachLink !== 'undefined' && AttachLink.cleanContextLeaks
      ? AttachLink.cleanContextLeaks(text)
      : text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    AttachLink.init(state);
    AttachLink.readSettingsFromConsoleCard(state);

    // 2. Identify active character or manual reflection target
    const activeChar = AttachLink.resolveActiveCharacter(state, history);
    const targetChar = (state.attachLink && state.attachLink.reflectingCharacter) || activeChar;

    let finalText = cleanedText;

    if (targetChar) {
      const charData = AttachLink.ensureCharacter(targetChar, state);
      const currentAction = (typeof info !== 'undefined' && info.actionCount) ? info.actionCount : 0;

      // Inject relationship & cognitive context into frontMemory
      const emotionalContext = AttachLink.getPromptContext(state);
      if (typeof state.memory === 'string') {
        // Strip any previous AttachLink block before injecting updated relationship context
        state.memory = state.memory.replace(/\[AttachLink:[\s\S]*?\](?:\n\[[^\]]*Agenda:[\s\S]*?\])?(?:\n\[[^\]]*Impression:[\s\S]*?\])?\n?/i, '').trim();
        state.memory = emotionalContext + (state.memory ? "\n" + state.memory : "");
      } else {
        state.memory = state.memory || {};
        state.memory.frontMemory = emotionalContext;
      }

      // 3. Check for automatic or manual pause menu reflection
      let taskPrompt = "";
      const isReflecting = state.attachLink && state.attachLink.isReflecting;
      const turns = (state.attachLink && state.attachLink.turnsSinceReflection) || 0;
      const cooldown = (state.attachLink && state.attachLink.cooldown) || AttachLinkConfig.reflectionCooldown || 15;

      if (isReflecting || (currentAction > 0 && turns >= cooldown)) {
        state.attachLink.isReflecting = true;
        state.attachLink.reflectingCharacter = state.attachLink.reflectingCharacter || targetChar;

        const tone = (state.attachLink && state.attachLink.tone) || AttachLinkConfig.defaultTone || "balanced";
        const isRomanceDisabled = (state.attachLink && state.attachLink.romanceMode === "disabled");

        let toneDirectives = "";
        if (tone === "gritty") {
          toneDirectives = `• TONE: GRITTY & CYNICAL. ${targetChar} prioritizes survival and holds realistic grudges. Any past abandonment, selfishness, or deception incurs sharp Bond penalties (-1 to -2) and lasting resentment. Casual chat is strictly Bond: +0. Trust requires proven sacrifice or shared blood.`;
        } else if (tone === "political") {
          toneDirectives = `• TONE: POLITICAL & INTRIGUE. ${targetChar} views relationships through faction loyalties, power, and leverage. Secret agendas focus on personal or faction gain. They may feign loyalty while preparing to switch sides if profitable.`;
        } else if (tone === "romance") {
          toneDirectives = `• TONE: ROMANCE & CHEMISTRY. Highlight emotional vulnerability, fluttering hearts, blushing, and romantic desire. Shared intimate moments stir deep attraction.`;
        } else if (tone === "comedy") {
          toneDirectives = `• TONE: COMEDY & BANTER. Highlight witty teasing, humorous skepticism, quirky inner observations, and comedic personality friction. Bond shifts naturally through hilarious or chaotic shared misadventures.`;
        } else if (tone === "horror") {
          toneDirectives = `• TONE: HORROR & PSYCHOLOGICAL DREAD. ${targetChar} is on edge, wrestling with paranoia, fear, and survival stress. Hidden agendas focus on staying alive or escaping dread. Trust is fragile and easily shaken by unnatural or unsettling behavior.`;
        } else {
          toneDirectives = `• TONE: BALANCED REALISM. ${targetChar} reacts authentically with independent agency, pride, and boundaries. Casual banter is Bond: +0. Trust is earned steadily over time.`;
        }

        let romanceRule = isRomanceDisabled
          ? `• Romance: DISABLED (Do not evaluate or output Romance; focus purely on Bond, Loyalty, and Mood).`
          : `• Romance (+1): Earned ONLY through explicit romantic chemistry, flirtation, or mutual intimacy. Never advance romance from casual talk.`;

        let formatSnippet = isRomanceDisabled
          ? `(${targetChar}'s AttachLink: "[1-3 sentences of genuine inner monologue reacting directly to the recent scene]" | Mood: [Emotion] | Agenda: [Their personal secret desire or next goal] | Bond: [+0, +1, -1, etc.])`
          : `(${targetChar}'s AttachLink: "[1-3 sentences of genuine inner monologue reacting directly to the recent scene]" | Mood: [Emotion] | Agenda: [Their personal secret desire or next goal] | Bond: [+0, +1, -1, etc.] | Romance: [+0, +1, etc.])`;

        taskPrompt = `\n\n[Task: STOP THE STORY & REFLECT. Step into the mind of ${targetChar} and evaluate their authentic feelings, skepticism, and agency regarding recent events with the protagonist.
Write ${targetChar}'s authentic, unfiltered first-person inner monologue in quotes (their genuine thoughts, doubts, pride, or emotional reactions).

CRITICAL CHARACTER AGENCY & TONE RULES:
${toneDirectives}
• Maintain Independent Agency: ${targetChar} has their own pride, goals, and boundaries. They do NOT automatically become loyal or obedient just because the protagonist talks to them.
• Anti-Sycophancy: Everyday actions or polite banter result in Bond: +0 (No change).
• Bond (+1): Earned ONLY through proven sacrifice, major shared trials, deep vulnerability, or keeping critical promises.
• Bond (-1 to -2): Decreased by manipulation, disrespect, broken promises, abandonment, or hostility.
${romanceRule}
• Secret Agenda: What does ${targetChar} secretly desire or want for THEMSELVES next (e.g. self-preservation, testing the protagonist, faction ambition)?

Format strictly as:
${formatSnippet}
Rules:
• Do NOT copy bracket placeholders. Write genuine thoughts for ${targetChar}.
• Do NOT continue the story or write dialogue.]\n`;
      }

      if (taskPrompt) {
        // Ensure prompt fits within model context budget before appending
        const fittedBase = AttachLink.fitContext(cleanedText, taskPrompt.length);
        finalText = fittedBase + taskPrompt;
      }
    }

    return { text: finalText };
  } catch (err) {
    // Fail-safe: Never crash scenario context generation
    return { text };
  }
};

modifier(text);
```
</details>

<details>
<summary><b>👉 Tab 3: Output (Click to expand)</b></summary>

Select the **Output** tab in AI Dungeon, delete any existing code, and paste:

```javascript
// AttachLink - Output Modifier
var modifier = (text) => {
  try {
    let cleanedText = text;

    if (typeof AttachLink === 'undefined') {
      return { text: cleanedText };
    }

    // 1. Handle Command Messages (e.g. /status, /track, or notices)
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

      // Record reflection timestamp for party rotation
      const charData = AttachLink.ensureCharacter(charName, state);
      if (charData) {
        charData.lastReflectedAction = (typeof info !== 'undefined' && info.actionCount) ? info.actionCount : 0;
      }

      // Reset reflection state & flag to guarantee clean line jumps on continuation
      state.attachLink.turnsSinceReflection = 0;
      state.attachLink.isReflecting = false;
      state.attachLink.reflectingCharacter = null;
      state.attachLink.justReflected = true;
      
      const moodText = (charData && charData.mood) ? ` | Mood: ${charData.mood}` : "";
      const bondVal = charData ? (charData.bond > 0 ? `+${charData.bond}` : charData.bond) : "";
      const bondText = bondVal !== "" ? ` | Bond: ${bondVal}` : "";
      const isRomanceDisabled = (state.attachLink && state.attachLink.romanceMode === "disabled");
      const romanceText = (!isRomanceDisabled && charData && typeof charData.romance !== 'undefined') ? ` | Romance: ${charData.romance}/5` : "";
      
      // Override output with pause message
      cleanedText = `\n\n>>> 🧠 [AttachLink Update] ${charName || "Companion"} reflected: Relationship updated${moodText}${bondText}${romanceText}! Press continue to resume the story. <<<\n\n`;

      // Sync the reflected character's card immediately
      if (charName) {
        AttachLink.syncStoryCard(state, charName);
      }
    } else {
      // If previous turn was a reflection pause or system notice, guarantee continuation starts on a fresh double-spaced paragraph
      if (state.attachLink && state.attachLink.justReflected) {
        state.attachLink.justReflected = false;
        cleanedText = "\n\n" + cleanedText.trimStart();
      }
      // Secondary leak cleaner pass on normal story output to guarantee zero immersion breaks
      cleanedText = AttachLink.cleanContextLeaks(cleanedText);
    }

    // Always update the live System Console Story Card!
    AttachLink.syncSystemConsoleCard(state);

    return { text: cleanedText };
  } catch (err) {
    return { text };
  }
};

modifier(text);
```
</details>

<details>
<summary><b>👉 Tab 4: Library (Click to view instructions)</b></summary>

Select the **Library** tab in AI Dungeon, delete any existing code, and paste the full script from [`src/library.js`](./src/library.js).

> **Note:** Because `library.js` contains the complete engine (character discovery, card generators, state management, and memory history), you can open and copy it directly from:  
> 🔗 **[`src/library.js`](./src/library.js)**
</details>

Finally, click the yellow **SAVE** button in the top right corner of the AI Dungeon script editor!

---

## ⚙️ Creator Settings

If you are a scenario creator, you can easily customize AttachLink at the very top of [`src/library.js`](./src/library.js):

```javascript
var AttachLinkConfig = {
  // 1. Dynamic Story Tone & Romance Presets
  // Tone: "balanced" | "gritty" | "romance" | "political" | "comedy" | "horror" (Can be edited in Story Cards or via /tone [mode])
  defaultTone: "balanced",

  // Romance Mode: "enabled" (show hearts) | "disabled" (pure loyalty/bond, no hearts)
  defaultRomanceMode: "enabled",

  // 2. Manually track specific NPC names (e.g. ["Marie", "Claire"])
  MANUAL_CHARACTERS: [""],

  // 3. Strict NPC Filtering
  // Keep false (recommended) so only real NPCs with Character Story Cards receive companion cards.
  // This completely prevents common words like "Her", "And", "Pacific" from turning into cards!
  autoDiscoverUnlistedNPCs: false,

  // 4. Automation Settings
  autoDetectFromStoryCards: true,             // Tracks pre-existing NPCs immediately on Turn 0
  autoGenerateStoryCardsForExistingNPCs: true, // Auto-generates AttachLink companion cards
  reflectionCooldown: 15,                     // Turns between automatic pause-and-reflect cycles
  lookbackTurnsForPresence: 5                 // Number of recent turns inspected for NPC presence
};
```

---

## 💡 Gameplay & Immersion Tips

- 🖥️ **Check the System Console:** Open your `AttachLink System Console` story card anytime to see turn progress and current standing with all party members.
- 🎭 **Tune Your Story's Feel:** Type `/tone gritty` for dangerous slow-trust survival, `/tone romance` for high-chemistry intimacy, or `/tone political` for scheming factions.
- 🚫 **Go Pure Platonic:** Type `/romance off` anytime to hide heart meters and remove romance directives across all cards.
- 🤝 **Build Real Trust:** Working together, keeping promises, and defending companions advances **Bond**.
- 💖 **Physical Intimacy & Romance:** Flirting, passionate dates, and sexual intimacy naturally surge **Romance**, unlocking deeper devotion and updating their core thoughts.
- 🧠 **Living Responses:** Companions genuinely remember their impressions—the AI reads their `Core Impression` in the background, subtly steering how they speak and act.
- 📜 **Look Back at History:** Check companion cards periodically to read their `[Memory History]` timeline of how your relationship developed over time!

---

## ☕ Support & Creator Scenarios

If AttachLink brings your AI Dungeon adventures to life and you'd like to support continued updates (or help me and my family stay afloat with essentials and bank loans), please consider dropping a tip on Ko-fi! Every bit of support means the world to me and helps keep projects like AttachLink completely free, open-source, and actively maintained.

<p align="center">
  <a href="https://ko-fi.com/nealverse" target="_blank">
    <img src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" height="42" alt="Buy Me a Coffee at ko-fi.com" />
  </a>
  <br>
  👉 <a href="https://ko-fi.com/nealverse"><b>ko-fi.com/nealverse</b></a>
</p>

### 🎮 Play My AI Dungeon Scenarios
Looking for interactive adventures to test AttachLink in? Explore my playable scenarios on AI Dungeon:  
👉 **[Nealverse's AI Dungeon Profile & Scenarios](https://play.aidungeon.com/profile?contentType=scenario&sort=updated)**

---

## 📜 License & Open Source Permissions

AttachLink is free, open-source, and dedicated to the public domain under the **[Creative Commons CC0 1.0 Universal (CC0 1.0) Public Domain Dedication](LICENSE)**.

You have complete worldwide freedom to:
- **Use & Play:** Embed AttachLink into any of your personal or publicly published scenarios.
- **Modify & Adapt:** Customize stats, tweak relationship formulas, or rewrite reflection prompts.
- **Distribute & Share:** Share scenarios, scripts, or derivative works anywhere without restrictions.
- **No Legal Strings Attached:** Attribution is not legally required, though crediting **AttachLink by Nealverse** or tipping on [Ko-fi](https://ko-fi.com/nealverse) is warmly appreciated! ❤️

---

<p align="center"><b>AttachLink v4.5</b> · Built for AI Dungeon with passion and care.</p>
