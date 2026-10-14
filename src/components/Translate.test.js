import { describe, expect, test } from "vitest";

import { getCategoryIdColumns, getDatasetIdColumns } from "./Translate";

describe("dataset filter column options", () => {
  test("keeps columns with at least one AD or SD dataset CMID", () => {
    const rows = [
      { datasetID: "SD2257", dataset: "Citation text", other: "foo" },
      { datasetID: "", dataset: "Citation text", other: "AD-not-valid" },
    ];

    expect(getDatasetIdColumns(["datasetID", "dataset", "other"], rows)).toEqual(["datasetID"]);
  });
});

describe("country and context filter column options", () => {
  test("includes the Liberia workbook country and category IDs, excluding dataset IDs", () => {
    const columns = ["parentName", "country", "context", "datasetID", "invalid"];
    const rows = [
      { parentName: "Grand Cape Mount County", country: "SM125", context: "", datasetID: "SD2257", invalid: "SM-not-valid" },
      { parentName: "Garwula District", country: "SM125", context: " AM1515 ", datasetID: "AD941", invalid: "SM125extra" },
    ];

    expect(getCategoryIdColumns(columns, rows)).toEqual(["country", "context"]);
    expect(getDatasetIdColumns(columns, rows)).toEqual(["datasetID"]);
  });

  test("handles empty input and accepts trimmed case-insensitive IDs", () => {
    expect(getCategoryIdColumns(undefined, undefined)).toEqual([]);
    expect(getCategoryIdColumns(["country"], [])).toEqual([]);
    expect(getCategoryIdColumns(["country"], [{ country: " sm125 " }])).toEqual(["country"]);
    expect(getDatasetIdColumns(["dataset"], [{ dataset: " sd11 " }])).toEqual(["dataset"]);
  });
});
