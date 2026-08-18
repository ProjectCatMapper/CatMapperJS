const INTERNAL_OWNERSHIP_PROPERTIES = new Set([
  'createdat',
  'createdbyuserid',
  'contributionid',
  'modifiedbyotheruser',
  'owneruserid',
]);

export const isNetworkExplorerPropertyVisible = (key) =>
  !INTERNAL_OWNERSHIP_PROPERTIES.has(String(key || '').trim().toLowerCase());

export const getNetworkExplorerPropertyEntries = (properties = {}) =>
  Object.entries(properties).filter(([key]) => isNetworkExplorerPropertyVisible(key));

export const isNetworkExplorerTooltipLineVisible = (line) =>
  isNetworkExplorerPropertyVisible(String(line || '').split(':', 1)[0]);

export const filterNetworkExplorerTooltipLines = (lines = []) =>
  (Array.isArray(lines) ? lines : []).filter(isNetworkExplorerTooltipLineVisible);

export const generateNetworkTooltipContent = (properties = {}) =>
  getNetworkExplorerPropertyEntries(properties)
    .filter(([, value]) => value != null && value !== '' && value !== 'NULL' && value !== 'null')
    .map(([key, value]) => `${key}: ${value}\n`);
