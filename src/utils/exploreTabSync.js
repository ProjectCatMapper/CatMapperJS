export const DEFAULT_EXPLORE_TAB = "network";

export const getRequestedExploreTab = (tabval) => tabval || DEFAULT_EXPLORE_TAB;

export const getResolvedExploreTab = (
  requestedTab,
  availableTabs = [],
  options = {}
) => {
  const { allowFallback = true } = options;
  if (!Array.isArray(availableTabs) || availableTabs.length === 0) return null;
  if (availableTabs.includes(requestedTab)) return requestedTab;
  if (!allowFallback) return requestedTab;
  return availableTabs[0];
};

export const shouldRedirectExploreTab = (currentRouteTab, targetTab) =>
  Boolean(targetTab && !currentRouteTab);
