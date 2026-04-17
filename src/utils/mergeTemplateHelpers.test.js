import { describe, expect, it } from 'vitest';
import {
  buildLinkFileSheets,
  parseKeyExpression,
  summarizeMergeTemplate,
} from './mergeTemplateHelpers';

describe('mergeTemplateHelpers', () => {
  it('detects category-only merging templates that should expose a link file', () => {
    const summary = summarizeMergeTemplate({
      nodeType: 'MERGING',
      stackSummaryTotals: { variableCount: 0 },
      equivalenceTies: [{ datasetID: 'AD1' }],
    });

    expect(summary.isMergingTemplate).toBe(true);
    expect(summary.hasVariableMappings).toBe(false);
    expect(summary.canDownloadLinkFile).toBe(true);
  });

  it('parses composite key expressions into named fields', () => {
    expect(parseKeyExpression('Site == AZ D:11:11 && Site_Num == AZ D:11:11')).toEqual({
      Site: 'AZ D:11:11',
      Site_Num: 'AZ D:11:11',
    });
  });

  it('builds stack-aware wide and long link-file sheets from equivalence ties', () => {
    const sheets = buildLinkFileSheets(
      [
        { datasetID: 'AD354274', datasetName: 'Becoming Hopi - Kivas' },
        { datasetID: 'AD354275', datasetName: 'Becoming Hopi - Pithouses' },
      ],
      [
        {
          stackID: 'AD958',
          datasetID: 'AD354274',
          Key: 'Site == Red Rock House && Site_Num == AZ J:6:1',
          originalCMID: 'AM1',
          originalCMName: 'Original A',
          equivalentCMID: 'AM900',
          equivalentCMName: 'Canonical A',
        },
        {
          stackID: 'AD958',
          datasetID: 'AD354275',
          Key: 'Site == Red Rock House && Site_Num == AZ J:6:1',
          originalCMID: 'AM2',
          originalCMName: 'Original B',
          equivalentCMID: 'AM900',
          equivalentCMName: 'Canonical A',
        },
      ]
    );

    expect(sheets).toHaveLength(2);
    expect(sheets[0].sheetName).toBe('LinkFileWide');
    expect(sheets[1].sheetName).toBe('LinkFileLong');
    expect(sheets[0].rows).toEqual([
      {
        stackID: 'AD958',
        CMID: 'AM900',
        CMName: 'Canonical A',
        Key: 'Site == Red Rock House && Site_Num == AZ J:6:1',
        Site: 'Red Rock House',
        Site_Num: 'AZ J:6:1',
        datasetIDs: 'AD354274, AD354275',
        datasetNames: 'Becoming Hopi - Kivas; Becoming Hopi - Pithouses',
      },
    ]);
    expect(sheets[1].rows[0]).toMatchObject({
      datasetID: 'AD354274',
      datasetName: 'Becoming Hopi - Kivas',
      CMID: 'AM900',
      CMName: 'Canonical A',
      Site: 'Red Rock House',
      Site_Num: 'AZ J:6:1',
    });
  });
});
