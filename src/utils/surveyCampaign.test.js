import { beforeEach, describe, expect, it } from 'vitest';
import {
  getSurveyCampaignConfig,
  getSurveyCampaignBucket,
  isSurveyCampaignEligible,
  setSurveyCampaignStatus,
  surveyCampaignStatusKey,
} from './surveyCampaign';

describe('survey campaign eligibility', () => {
  beforeEach(() => localStorage.clear());

  it('enables the dev campaign at a 100 percent sample', () => {
    const config = getSurveyCampaignConfig({ env: {}, hostname: 'dev.catmapper.org' });

    expect(config.campaignId).toBe('user-purpose-dev');
    expect(config.samplePercent).toBe(100);
    expect(config.delayMs).toBe(20000);
    expect(isSurveyCampaignEligible({ config, randomValue: 0.999 })).toBe(true);
  });

  it('uses a full sample before the configured first-week cutoff', () => {
    const config = getSurveyCampaignConfig({
      hostname: 'catmapper.org',
      env: {
        REACT_APP_SURVEY_CAMPAIGN_ID: 'launch-week',
        REACT_APP_SURVEY_START_AT: '2026-08-11T00:00:00Z',
        REACT_APP_SURVEY_FULL_SAMPLE_UNTIL: '2026-08-18T00:00:00Z',
        REACT_APP_SURVEY_SAMPLE_PERCENT: '10',
      },
    });

    expect(isSurveyCampaignEligible({
      config,
      now: new Date('2026-08-15T00:00:00Z'),
      randomValue: 0.99,
    })).toBe(true);
    expect(isSurveyCampaignEligible({
      config,
      now: new Date('2026-08-19T00:00:00Z'),
      randomValue: 0.11,
    })).toBe(false);
  });

  it('does not show a campaign again after it has been shown', () => {
    const config = getSurveyCampaignConfig({
      hostname: 'catmapper.org',
      env: {
        REACT_APP_SURVEY_CAMPAIGN_ID: 'one-time',
        REACT_APP_SURVEY_SAMPLE_PERCENT: '100',
      },
    });
    setSurveyCampaignStatus(config.campaignId, 'shown');

    expect(localStorage.getItem(surveyCampaignStatusKey(config.campaignId))).toBe('shown');
    expect(isSurveyCampaignEligible({ config, randomValue: 0 })).toBe(false);
  });

  it('keeps the same sampling bucket across visits', () => {
    const firstBucket = getSurveyCampaignBucket('stable-sample');
    const secondBucket = getSurveyCampaignBucket('stable-sample');

    expect(secondBucket).toBe(firstBucket);
    expect(firstBucket).toBeGreaterThanOrEqual(0);
    expect(firstBucket).toBeLessThan(1);
  });
});
