import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const analytics = vi.hoisted(() => ({ event: vi.fn() }));

vi.mock('react-ga4', () => ({ default: analytics }));

import SurveyCampaign, { SURVEY_COMMENT_MAX_LENGTH } from './SurveyCampaign';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('SurveyCampaign', () => {
  let container;
  let root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
    process.env.REACT_APP_SURVEY_CAMPAIGN_ID = 'test-campaign';
    process.env.REACT_APP_SURVEY_SAMPLE_PERCENT = '100';
    process.env.REACT_APP_SURVEY_DELAY_MS = '0';
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await flushPromises();
    });
    container.remove();
    document.querySelectorAll('[role="presentation"]').forEach((element) => element.remove());
    delete process.env.REACT_APP_SURVEY_CAMPAIGN_ID;
    delete process.env.REACT_APP_SURVEY_SAMPLE_PERCENT;
    delete process.env.REACT_APP_SURVEY_DELAY_MS;
    vi.useRealTimers();
  });

  const renderSurvey = async (consent) => {
    localStorage.setItem('cookieConsent', consent);
    await act(async () => {
      root.render(<SurveyCampaign />);
      await flushPromises();
    });
    await act(async () => {
      vi.advanceTimersByTime(1);
      await flushPromises();
    });
  };

  it('shows the requested choices, contact email, and 1000-character limit', async () => {
    await renderSurvey('rejected');

    expect(document.body.textContent).toContain('Help us learn about our users');
    expect(document.body.textContent).toContain('Tools for bringing data together');
    expect(document.querySelector('a[href="mailto:admin@catmapper.org"]')).toBeTruthy();

    await act(async () => {
      document.querySelector('input[value="other"]').click();
      await flushPromises();
    });

    expect(document.querySelector('textarea').maxLength).toBe(SURVEY_COMMENT_MAX_LENGTH);
    expect(analytics.event).not.toHaveBeenCalled();
  });

  it('submits an answer without analytics when consent was declined', async () => {
    await renderSurvey('rejected');

    await act(async () => {
      document.querySelector('input[value="gis"]').click();
      await flushPromises();
    });
    const submitButton = [...document.querySelectorAll('button')]
      .find((button) => button.textContent === 'Submit');
    await act(async () => {
      submitButton.click();
      await flushPromises();
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/survey-responses'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(analytics.event).not.toHaveBeenCalled();
  });

  it('records controlled survey events when analytics consent was accepted', async () => {
    await renderSurvey('accepted');

    expect(analytics.event).toHaveBeenCalledWith('survey_impression', {
      campaign_id: 'test-campaign',
    });
  });
});
