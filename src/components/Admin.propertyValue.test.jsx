import { describe, expect, it } from 'vitest';
import { formatAdminPropertyValue } from './Admin';

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
