import { describe, expect, test } from 'vitest';

import { buildDatasetDownloadDomainOptions } from './datasetDownloadDomains';

describe('buildDatasetDownloadDomainOptions', () => {
  test('keeps the group label when a dataset uses one of its subdomains', () => {
    const options = buildDatasetDownloadDomainOptions(
      {
        AREA: ['AREA', 'ADM0', 'ADM1'],
        LANGUAGE: ['LANGUAGE'],
      },
      ['ADM0', 'ADM1']
    );

    expect(options).toEqual({
      'ANY DOMAIN': ['ANY DOMAIN'],
      AREA: ['AREA', 'ADM0', 'ADM1'],
    });
  });

  test('does not add domains without matching dataset labels', () => {
    const options = buildDatasetDownloadDomainOptions(
      {
        AREA: ['AREA', 'ADM0', 'ADM1'],
        RELIGION: ['RELIGION'],
      },
      ['RELIGION']
    );

    expect(options).toEqual({
      'ANY DOMAIN': ['ANY DOMAIN'],
      RELIGION: ['RELIGION'],
    });
  });
});
