import { describe, expect, it } from 'vitest';
import {
  filterUsesPropertyOptions,
  formatAdminPropertyValue,
  formatChangeReviewProposal,
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

  it('keeps excluded fields available for deletion', () => {
    const options = ['log', 'geoPolygon', 'modifiedByOtherUser', 'ownerUserId', 'district'];

    expect(filterUsesPropertyOptions(options, 'delete')).toEqual(options);
  });
});
