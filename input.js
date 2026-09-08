var modifier = (text) => {
  try {
    if (typeof AttachLink !== 'undefined') {
      // 1. Identify active character in the scene (handles multi-word names & candidates)
      AttachLink.resolveActiveCharacter(state, history);

      // 2. Adjust bond and romance based on player input (negation-safe keywords)
      AttachLink.updateMeters(text, state);
    }
    return { text };
  } catch (err) {
    return { text };
  }
};

modifier(text);