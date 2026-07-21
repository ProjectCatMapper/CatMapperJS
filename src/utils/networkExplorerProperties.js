const INTERNAL_OWNERSHIP_PROPERTIES = new Set([
  'createdat',
  'createdbyuserid',
  'contributionid',
  'owneruserid',
]);

export const isNetworkExplorerPropertyVisible = (key) =>
  !INTERNAL_OWNERSHIP_PROPERTIES.has(String(key || '').trim().toLowerCase());

export const getNetworkExplorerPropertyEntries = (properties = {}) =>
  Object.entries(properties).filter(([key]) => isNetworkExplorerPropertyVisible(key));

export const generateNetworkTooltipContent = (properties = {}) =>
  getNetworkExplorerPropertyEntries(properties)
    .filter(([, value]) => value != null && value !== '' && value !== 'NULL' && value !== 'null')
    .map(([key, value]) => `${key}: ${value}\n`);
