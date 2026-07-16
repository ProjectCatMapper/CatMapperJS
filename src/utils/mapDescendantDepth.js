export const getDescendantDepthLimit = (limits, fallback = 30) => {
  const configuredMaxDepth = Number(limits?.maxDepth) || fallback;
  const availableDepth = Number(limits?.availableDescendantDepth);

  return Number.isFinite(availableDepth) && availableDepth > 0
    ? Math.min(configuredMaxDepth, availableDepth)
    : configuredMaxDepth;
};

export const getInitialDescendantDepth = (limits, fallback = 5) => {
  const defaultDepth = Number(limits?.defaultDepth) || fallback;
  return Math.min(defaultDepth, getDescendantDepthLimit(limits));
};
