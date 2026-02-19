import {
  DEFAULT_EXPLORE_TAB,
  getRequestedExploreTab,
  getResolvedExploreTab,
  shouldRedirectExploreTab,
} from "./exploreTabSync";

describe("exploreTabSync", () => {
  test("defaults missing route tab to network", () => {
    expect(getRequestedExploreTab(undefined)).toBe(DEFAULT_EXPLORE_TAB);
    expect(getRequestedExploreTab("")).toBe(DEFAULT_EXPLORE_TAB);
  });

  test("keeps requested tab when available", () => {
    expect(getResolvedExploreTab("timespan", ["network", "map", "timespan"])).toBe("timespan");
  });

  test("falls back to first available tab when requested tab is invalid", () => {
    expect(getResolvedExploreTab("timespan", ["network", "map"])).toBe("network");
  });

  test("does not fallback while fallback is disabled", () => {
    expect(
      getResolvedExploreTab("network", ["timespan", "datasets"], { allowFallback: false })
    ).toBe("network");
  });

  test("does not resolve when there are no available tabs", () => {
    expect(getResolvedExploreTab("network", [])).toBeNull();
  });

  test("redirects only when current route tab differs from target tab", () => {
    expect(shouldRedirectExploreTab("timespan", "timespan")).toBe(false);
    expect(shouldRedirectExploreTab("timespan", "network")).toBe(true);
    expect(shouldRedirectExploreTab(undefined, "network")).toBe(true);
    expect(shouldRedirectExploreTab("network", null)).toBe(false);
  });
});
