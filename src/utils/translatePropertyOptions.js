import domainOptions from '../assets/dropdown.json';

export const FALLBACK_TRANSLATE_PROPERTY_OPTIONS = [
  'Name',
  'Key',
  'CatMapper ID (CMID)',
];

export const getTranslatePropertyOptions = (domain) => {
  const options = domainOptions?.[domain];
  return Array.isArray(options) && options.length > 0
    ? [...options]
    : [...FALLBACK_TRANSLATE_PROPERTY_OPTIONS];
};
