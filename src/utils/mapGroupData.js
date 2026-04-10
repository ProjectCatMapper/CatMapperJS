const MAP_TUPLE_KEYS = ['CMID', 'long', 'lat', 'CMName'];

export function mapTupleRowsToPoints(rows = []) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .filter((row) => Array.isArray(row) && row.length >= MAP_TUPLE_KEYS.length)
    .map((row) => ({
      CMID: row[0],
      long: row[1],
      lat: row[2],
      CMName: row[3],
    }));
}

export async function fetchMapGroupData(assetPath, fetchImpl = fetch) {
  const response = await fetchImpl(assetPath);
  if (!response.ok) {
    throw new Error(`Unable to load map data: ${assetPath}`);
  }

  const rows = await response.json();
  return mapTupleRowsToPoints(rows);
}
