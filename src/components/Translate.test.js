import { describe, expect, test } from "vitest";

import { getDatasetIdColumns } from "./Translate";

describe("dataset filter column options", () => {
  test("keeps columns with at least one AD or SD dataset CMID", () => {
    const rows = [
      { datasetID: "SD2257", dataset: "Citation text", other: "foo" },
      { datasetID: "", dataset: "Citation text", other: "AD-not-valid" },
    ];

    expect(getDatasetIdColumns(["datasetID", "dataset", "other"], rows)).toEqual(["datasetID"]);
  });
});
