import { describe, expect, it } from 'vitest';
import {
  filterUsesPropertyOptions,
  formatAdminPropertyValue,
  formatChangeReviewProposal,
  getChangeReviewDetails,
} from './Admin';

describe('formatAdminPropertyValue', () => {
  it('separates list node property values with the admin delimiter', () => {
    expect(formatAdminPropertyValue(['SM461549', 'SM461550', 'SM461551']))
      .toBe('SM461549 || SM461550 || SM461551');
  });

  it('formats object list items by their display label', () => {
    expect(formatAdminPropertyValue([{ label: 'Focus A' }, { CMID: 'SM461550' }]))
      .toBe('Focus A || SM461550');
  });
});

describe('formatChangeReviewProposal', () => {
  it('summarizes a USES edit with old and proposed values', () => {
    expect(formatChangeReviewProposal({
      action: 'add/edit/delete USES property',
      input: {
        s1_1: 'edit',
        s1_3: 'New label',
        s1_4: [[{ CMID: 'SM1' }, { label: 'Old label' }, { CMID: 'SD1' }]],
        s1_7: '1',
        s1_8: 'label',
      },
    })).toBe('edit USES label: Old label → New label on SD1');
  });
});

describe('getChangeReviewDetails', () => {
  it('turns a USES payload into labeled reviewer fields without raw JSON', () => {
    const details = getChangeReviewDetails({
      action: 'add/edit/delete USES property',
      targetCmid: 'SM1',
      input: {
        s1_1: 'edit',
        s1_3: 'New label',
        s1_4: [[
          { CMID: 'SM1', CMName: 'Category one' },
          { Key: 'uses-1', label: 'Old label' },
          { CMID: 'SD1', CMName: 'Dataset one' },
        ]],
        s1_7: '1',
        s1_8: 'label',
      },
    });

    expect(details).toEqual(expect.arrayContaining([
      { label: 'Category', value: 'SM1 — Category one' },
      { label: 'Dataset', value: 'SD1 — Dataset one' },
      { label: 'Relationship key', value: 'uses-1' },
      { label: 'Current value', value: 'Old label' },
      { label: 'Proposed value', value: 'New label' },
    ]));
    expect(JSON.stringify(details)).not.toContain('s1_');
  });

  it('parses a stored relation selection into readable deletion fields', () => {
    const details = getChangeReviewDetails({
      action: 'delete USES relation',
      input: {
        s1_2: 'SM1',
        s1_7: JSON.stringify([
          { CMID: 'SM1', CMName: 'Category one' },
          { Key: 'uses-1' },
          { CMID: 'SD1', CMName: 'Dataset one' },
        ]),
      },
    });

    expect(details).toEqual(expect.arrayContaining([
      { label: 'Source', value: 'SM1 — Category one' },
      { label: 'Dataset', value: 'SD1 — Dataset one' },
      { label: 'Relationship key', value: 'uses-1' },
    ]));
  });
});

describe('filterUsesPropertyOptions', () => {
  it('excludes internal fields from USES add and edit property options', () => {
    const options = [
      'Name',
      'log',
      'geoPolygon',
      'modifiedByOtherUser',
      'ownerUserId',
      'populationEstimate',
    ];

    expect(filterUsesPropertyOptions(options, 'add'))
      .toEqual(['Name', 'populationEstimate']);
    expect(filterUsesPropertyOptions(options, 'edit'))
      .toEqual(['Name', 'populationEstimate']);
  });

  it('matches excluded properties without case or surrounding whitespace', () => {
    expect(filterUsesPropertyOptions([
      ' LOG ',
      'GEOPOLYGON',
      ' modifiedbyotheruser ',
      'OWNERUSERID',
      'district',
    ], 'edit')).toEqual(['district']);
  });

  it('excludes internal USES fields from deletion', () => {
    const options = [
      'log',
      'logID',
      'geoPolygon',
      'modifiedByOtherUser',
      'ownerUserId',
      'createdByUserId',
      'createdAt',
      'contributionId',
      'district',
    ];

    expect(filterUsesPropertyOptions(options, 'delete')).toEqual(['district']);
  });
});
