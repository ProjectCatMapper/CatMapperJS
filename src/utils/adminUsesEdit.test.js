import { describe, expect, it } from 'vitest';
import { getUsesEditError, updateUsesEditField, filterContextualEditProperties } from './adminUsesEdit';

const form = () => ({
  s1_1: 'edit', s1_2: 'AM1', s1_3: 'Ware == Brown', s1_7: 1, s1_8: 'Key',
  s1_4: [[{ CMID: 'AM1' }, { id: 'rel-1', Key: 'Type == Brown' }, { CMID: 'AD187' }]],
});

describe('USES correction target', () => {
  it('hides prohibited edits while preserving their deletion', () => {
    const options = ['Name', 'language', 'district'];
    const allowed = ['Name', 'district'];
    expect(filterContextualEditProperties(options, 'edit', allowed)).toEqual(allowed);
    expect(filterContextualEditProperties(options, 'delete', allowed)).toEqual(options);
    expect(filterContextualEditProperties(options, 'edit', null)).toEqual(options);
  });
  it.each(['', 0, -1, 2, 1.5, true])('blocks invalid selection %s', selection => {
    expect(getUsesEditError({ ...form(), s1_7: selection })).not.toBe('');
  });
  it('requires an explicit property and matching category', () => {
    expect(getUsesEditError({ ...form(), s1_8: '' })).toContain('property');
    expect(getUsesEditError({ ...form(), s1_2: 'AM2' })).toContain('category');
    expect(getUsesEditError(form())).toBe('');
  });
  it('clears the old ties, property and draft when changing categories', () => {
    const next = updateUsesEditField(form(), 's1_2', 'AM2');
    expect(next).toMatchObject({ s1_2: 'AM2', s1_4: [], s1_7: '', s1_8: '', s1_3: '' });
    expect(getUsesEditError(next)).not.toBe('');
  });
  it('does not carry a draft or property onto a different tie', () => {
    expect(updateUsesEditField(form(), 's1_7', 2)).toMatchObject({ s1_7: 2, s1_8: '', s1_3: '' });
    expect(updateUsesEditField(form(), 's1_8', 'Name')).toMatchObject({ s1_8: 'Name', s1_3: '' });
  });
  it('preserves spaces while entering a value', () => {
    expect(updateUsesEditField(form(), 's1_3', 'Type == Plain Brown ')).toHaveProperty('s1_3', 'Type == Plain Brown ');
  });
});
