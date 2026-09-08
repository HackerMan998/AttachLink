var modifier = (text) => {
  try {
    if (typeof AttachLink !== 'undefined') {
      // 1. Identify active character in the scene (handles multi-word names & candidates)
      AttachLink.resolveActiveCharacter(state, history);

      // 2. Track turns and handle manual /reflect command
      var trimmedText = text.trim();
      if (trimmedText.match(/^\/reflect/i)) {
        state.attachLink.turnsSinceReflection = AttachLinkConfig.reflectionCooldown;
        text = ""; // Hide command from AI
      } else {
        state.attachLink.turnsSinceReflection++;
      }
    }
    return { text };
  } catch (err) {
    return { text };
  }
};

modifier(text);