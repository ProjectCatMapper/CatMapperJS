import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  loadTranslateState,
  saveTranslateState,
  clearTranslateState,
} from './translateSessionStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reset the module-level in-memory cache between tests by re-importing the
 *  module with a fresh module registry. */
const resetModule = async () => {
  // vitest re-import trick: use vi.resetModules() + dynamic import
};

// ---------------------------------------------------------------------------
// Session-storage mock
// ---------------------------------------------------------------------------

const makeSessionStorageMock = () => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _getStore: () => store,
  };
};

describe('translateSessionStore', () => {
  let storageMock;
  // Re-import the module fresh for each test so the in-memory cache is empty.
  let load, save, clear;

  beforeEach(async () => {
    storageMock = makeSessionStorageMock();
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: storageMock,
      writable: true,
      configurable: true,
    });
    vi.useFakeTimers();
    vi.resetModules();
    ({ loadTranslateState: load, saveTranslateState: save, clearTranslateState: clear } =
      await import('./translateSessionStore'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------

  it('returns null when no state has been saved', () => {
    expect(load('archamap')).toBeNull();
  });

  it('returns null for a falsy database argument', () => {
    expect(load('')).toBeNull();
    expect(load(null)).toBeNull();
    expect(load(undefined)).toBeNull();
  });

  it('stores state in memory and returns it on the next load', () => {
    save('archamap', { zeroDropdownValue: 'term', reviewRows: [{ a: 1 }] });
    const loaded = load('archamap');
    expect(loaded).toEqual({ zeroDropdownValue: 'term', reviewRows: [{ a: 1 }] });
  });

  it('does not write to sessionStorage before the debounce delay', () => {
    save('archamap', { x: 1 });
    expect(storageMock.setItem).not.toHaveBeenCalled();
  });

  it('writes to sessionStorage after the debounce delay fires', () => {
    save('archamap', { x: 1 });
    vi.runAllTimers();
    expect(storageMock.setItem).toHaveBeenCalledTimes(1);
    const written = JSON.parse(storageMock.setItem.mock.calls[0][1]);
    expect(written).toEqual({ x: 1 });
  });

  it('debounces rapid successive saves (only one sessionStorage write)', () => {
    save('archamap', { x: 1 });
    save('archamap', { x: 2 });
    save('archamap', { x: 3 });
    vi.runAllTimers();
    expect(storageMock.setItem).toHaveBeenCalledTimes(1);
    const written = JSON.parse(storageMock.setItem.mock.calls[0][1]);
    expect(written).toEqual({ x: 3 });
  });

  it('falls back to sessionStorage when in-memory cache is empty (simulates soft reload)', () => {
    // Seed sessionStorage directly (simulating a prior save after module reload)
    storageMock.getItem.mockImplementation((key) => {
      if (key === 'translate_state_sociomap') return JSON.stringify({ y: 99 });
      return null;
    });
    const loaded = load('sociomap');
    expect(loaded).toEqual({ y: 99 });
  });

  it('clear removes the state from memory and sessionStorage', () => {
    save('archamap', { a: 1 });
    vi.runAllTimers(); // flush debounce so sessionStorage is written
    clear('archamap');
    expect(load('archamap')).toBeNull();
    expect(storageMock.removeItem).toHaveBeenCalledWith('translate_state_archamap');
  });

  it('clear cancels any pending debounced write', () => {
    save('archamap', { a: 1 });
    clear('archamap'); // cancel before debounce fires
    vi.runAllTimers();
    expect(storageMock.setItem).not.toHaveBeenCalled();
  });

  it('handles separate databases independently', () => {
    save('archamap', { val: 'a' });
    save('sociomap', { val: 's' });
    expect(load('archamap')).toEqual({ val: 'a' });
    expect(load('sociomap')).toEqual({ val: 's' });
    vi.runAllTimers();
    expect(storageMock.setItem).toHaveBeenCalledTimes(2);
  });

  it('is a no-op when database is falsy', () => {
    expect(() => save('', { x: 1 })).not.toThrow();
    expect(() => clear(null)).not.toThrow();
    expect(load(undefined)).toBeNull();
  });

  it('gracefully ignores sessionStorage errors', () => {
    storageMock.setItem.mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    save('archamap', { large: 'data' });
    expect(() => vi.runAllTimers()).not.toThrow();
    // In-memory cache still works
    expect(load('archamap')).toEqual({ large: 'data' });
  });

  it('handles invalid JSON in sessionStorage gracefully', () => {
    storageMock.getItem.mockReturnValue('{ not valid json }}}');
    expect(() => load('archamap')).not.toThrow();
    expect(load('archamap')).toBeNull();
  });
});
