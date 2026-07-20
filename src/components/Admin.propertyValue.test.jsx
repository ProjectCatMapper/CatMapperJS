import { describe, expect, it } from 'vitest';
import {
  filterUsesPropertyOptions,
  formatAdminPropertyValue,
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

describe('filterUsesPropertyOptions', () => {
  it('excludes log and geoPolygon from USES add and edit property options', () => {
    const options = [
      'Name',
      'log',
      'geoPolygon',
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
      'district',
    ], 'edit')).toEqual(['district']);
  });

  it('keeps log and geoPolygon available for deletion', () => {
    const options = ['log', 'geoPolygon', 'district'];

    expect(filterUsesPropertyOptions(options, 'delete')).toEqual(options);
  });
});
