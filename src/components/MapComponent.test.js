import { describe, expect, test } from "vitest";

import { getPointTooltipLines } from "./mapPointTooltip";

describe("node info map point tooltips", () => {
  test("shows CMName and CMID for direct USES points", () => {
    expect(getPointTooltipLines({
      CMName: "District A",
      CMID: "AM2",
      source: "Dataset A",
    })).toEqual([
      "CMName: District A",
      "CMID: AM2",
      "Source: Dataset A",
    ]);
  });

  test("uses inherited point identity fields", () => {
    expect(getPointTooltipLines({
      sourceNodeName: "District B",
      sourceNodeCMID: "AM3",
      source: "Dataset B",
      inherited: true,
      inheritanceRelationship: "USES",
    })).toEqual([
      "CMName: District B",
      "CMID: AM3",
      "Inherited from District B (AM3) via USES",
      "Source: Dataset B",
    ]);
  });

  test("always identifies the source represented by the dot", () => {
    expect(getPointTooltipLines({
      CMName: "District C",
      CMID: "AM4",
    })).toEqual([
      "CMName: District C",
      "CMID: AM4",
      "Source: Unknown",
    ]);
  });
});
