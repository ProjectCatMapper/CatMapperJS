export const buildDatasetDownloadDomainOptions = (subdomainCatalog = {}, allowedLabels = []) => {
  const allowed = new Set((allowedLabels || []).filter(Boolean));
  const entries = Object.entries(subdomainCatalog || {})
    .map(([domain, values]) => {
      const subdomains = Array.isArray(values) ? values.filter(Boolean) : [];
      const matchedSubdomains = subdomains.filter((value) => allowed.has(value));

      if (matchedSubdomains.length === 0) {
        return null;
      }

      const found = [...matchedSubdomains];
      if (domain && subdomains.includes(domain) && !found.includes(domain)) {
        found.unshift(domain);
      }

      return [domain, found];
    })
    .filter(Boolean);

  return Object.fromEntries([
    ["ANY DOMAIN", ["ANY DOMAIN"]],
    ...entries,
  ]);
};
