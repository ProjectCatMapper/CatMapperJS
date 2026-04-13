/**
 * translateSessionStore
 *
 * Provides in-memory + sessionStorage persistence for the Translate page
 * state.  The in-memory cache survives client-side navigation (React Router
 * unmounts/remounts the component) within the same tab.  sessionStorage is
 * used as a backup so soft reloads within the same browser tab also restore
 * the state; it is cleared automatically when the tab (session) is closed.
 *
 * Writes to sessionStorage are debounced to avoid excessive serialisation of
 * potentially-large row datasets on every key-stroke.
 */

const STORAGE_KEY_PREFIX = 'translate_state_';
const DEBOUNCE_MS = 500;

/** @type {Record<string, object>} */
const inMemoryCache = {};

/** @type {Record<string, ReturnType<typeof setTimeout>>} */
const debounceTimers = {};

/**
 * Load persisted translate state for the given database.
 * Returns `null` when no state has been saved yet.
 *
 * @param {string} database
 * @returns {object|null}
 */
export function loadTranslateState(database) {
  if (!database) return null;
  const key = STORAGE_KEY_PREFIX + database;

  if (inMemoryCache[key] !== undefined) {
    return inMemoryCache[key];
  }

  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      inMemoryCache[key] = parsed;
      return parsed;
    }
  } catch (_e) {
    // sessionStorage unavailable or JSON invalid – ignore
  }

  return null;
}

/**
 * Persist translate state for the given database.
 * The in-memory cache is updated synchronously; the sessionStorage write is
 * debounced.
 *
 * @param {string} database
 * @param {object} state
 */
export function saveTranslateState(database, state) {
  if (!database) return;
  const key = STORAGE_KEY_PREFIX + database;

  inMemoryCache[key] = state;

  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }

  debounceTimers[key] = setTimeout(() => {
    delete debounceTimers[key];
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (_e) {
      // Quota exceeded or storage unavailable – in-memory store is sufficient
    }
  }, DEBOUNCE_MS);
}

/**
 * Clear all persisted state for the given database (in-memory and
 * sessionStorage).  Call this when the user explicitly resets the translate
 * form.
 *
 * @param {string} database
 */
export function clearTranslateState(database) {
  if (!database) return;
  const key = STORAGE_KEY_PREFIX + database;

  delete inMemoryCache[key];

  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
    delete debounceTimers[key];
  }

  try {
    sessionStorage.removeItem(key);
  } catch (_e) {
    // ignore
  }
}
