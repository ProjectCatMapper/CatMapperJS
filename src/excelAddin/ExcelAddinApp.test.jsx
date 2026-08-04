import { describe, expect, it } from 'vitest';
import { getAlternativeMatchState } from './ExcelAddinApp';

describe('Excel add-in alternative match state', () => {
  it('does not treat unselected multiple matches as no match', () => {
    expect(getAlternativeMatchState({
      candidates: [{ CMID_Name: 'AM1' }, { CMID_Name: 'AM2' }],
      selectedIndex: -1,
    })).toBe('multiple-unselected');
  });

  it('reports no match only when no candidate options exist', () => {
    expect(getAlternativeMatchState({ candidates: [], selectedIndex: -1 })).toBe('no-match');
  });
});
