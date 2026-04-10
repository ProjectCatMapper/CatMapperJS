import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MERGE_TAB,
  getMergeTabIndex,
  getRequestedMergeTab,
  getResolvedMergeTab,
  shouldRedirectMergeTab,
} from './mergeTabSync';

describe('mergeTabSync', () => {
  it('normalizes missing tabs to the default tab', () => {
    expect(getRequestedMergeTab()).toBe(DEFAULT_MERGE_TAB);
    expect(getResolvedMergeTab()).toBe(DEFAULT_MERGE_TAB);
    expect(getMergeTabIndex()).toBe(0);
  });

  it('accepts valid merge tab slugs', () => {
    expect(getResolvedMergeTab('join-datasets')).toBe('join-datasets');
    expect(getMergeTabIndex('download-merge-template')).toBe(2);
    expect(shouldRedirectMergeTab('download-merge-template')).toBe(false);
  });

  it('redirects invalid tabs to the default tab', () => {
    expect(getResolvedMergeTab('nope')).toBe(DEFAULT_MERGE_TAB);
    expect(getMergeTabIndex('nope')).toBe(0);
    expect(shouldRedirectMergeTab('')).toBe(true);
    expect(shouldRedirectMergeTab('nope')).toBe(true);
  });
});
