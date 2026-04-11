export function buildNodePageJsonUrl(apiBase, database, cmid) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  return `${base}/entity/${encodeURIComponent(database)}/${encodeURIComponent(cmid)}.json`;
}

export function downloadJsonObject(data, fileName) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: "application/json",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export async function fetchNodePageJson({
  apiBase,
  database,
  cmid,
  fetchImpl = fetch,
  signal,
}) {
  const url = buildNodePageJsonUrl(apiBase, database, cmid);
  const response = await fetchImpl(url, { signal });
  if (!response.ok) {
    throw new Error(`JSON request failed with status ${response.status}`);
  }
  return response.json();
}
