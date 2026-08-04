import { describe, expect, it } from 'vitest';
import { explorePrompt, exploreUrl, getAlternativeMatchState } from './ExcelAddinApp';

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

  it('does not count backend no-match placeholder rows as selectable options', () => {
    expect(getAlternativeMatchState({
      candidates: [{ CMuniqueRowID: '0', matchType_Name: 'none' }],
      selectedIndex: 0,
    })).toBe('no-match');
  });

  it('links Explore to the database selected in the add-in', () => {
    expect(exploreUrl('ArchaMap')).toBe('https://catmapper.org/archamap/explore');
    expect(exploreUrl('SocioMap')).toBe('https://catmapper.org/sociomap/explore');
  });

  it('directs both unmatched and incorrectly matched rows to a deeper search', () => {
    expect(explorePrompt(true)).toContain('none of these proposed matches are correct');
    expect(explorePrompt(false)).toContain('more in-depth search');
  });
});
