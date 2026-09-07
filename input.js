const modifier = (text) => {
  // 1. Identify active character in the scene
  AttachLink.resolveActiveCharacter(state, history);

  // 2. Adjust bond and romance based on player input
  AttachLink.updateMeters(text, state);

  return { text };
};

modifier(text);