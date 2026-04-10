export const DEFAULT_MERGE_TAB = 'propose-merge';

export const MERGE_TABS = [
  { key: 'propose-merge', label: 'Propose merge' },
  { key: 'join-datasets', label: 'Join Datasets' },
  { key: 'download-merge-template', label: 'Download merge template' },
];

export const VALID_MERGE_TABS = new Set(MERGE_TABS.map((tab) => tab.key));

export const getRequestedMergeTab = (tab) => String(tab || '').trim().toLowerCase() || DEFAULT_MERGE_TAB;

export const getResolvedMergeTab = (tab) => {
  const normalizedTab = getRequestedMergeTab(tab);
  if (VALID_MERGE_TABS.has(normalizedTab)) {
    return normalizedTab;
  }
  return DEFAULT_MERGE_TAB;
};

export const getMergeTabIndex = (tab) =>
  Math.max(0, MERGE_TABS.findIndex((item) => item.key === getResolvedMergeTab(tab)));

export const shouldRedirectMergeTab = (tab) => {
  const normalizedTab = String(tab || '').trim().toLowerCase();
  return !normalizedTab || !VALID_MERGE_TABS.has(normalizedTab);
};
