import { describe, expect, it } from 'vitest';

import {
  FALLBACK_TRANSLATE_PROPERTY_OPTIONS,
  getTranslatePropertyOptions,
} from './translatePropertyOptions';

describe('getTranslatePropertyOptions', () => {
  it.each(['LANGUOID', 'LANGUAGE', 'DIALECT', 'FAMILY'])(
    'offers language identifiers for %s',
    (domain) => {
      expect(getTranslatePropertyOptions(domain)).toEqual(expect.arrayContaining([
        'glottocode',
        'ISO3',
      ]));
    },
  );

  it('offers ISO3 for area searches', () => {
    expect(getTranslatePropertyOptions('AREA')).toContain('ISO3');
  });

  it('uses the restricted fallback for unknown domains', () => {
    expect(getTranslatePropertyOptions('UNKNOWN')).toEqual(
      FALLBACK_TRANSLATE_PROPERTY_OPTIONS,
    );
  });
});
