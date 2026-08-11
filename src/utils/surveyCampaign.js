const DEV_HOSTNAME = "dev.catmapper.org";
const STATUS_PREFIX = "catmapper:survey-campaign";

const asPercent = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, parsed));
};

const asDelay = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, parsed);
};

const asDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getSurveyCampaignConfig = ({
  env = process.env,
  hostname = window.location.hostname,
} = {}) => {
  const isDev = hostname === DEV_HOSTNAME;
  const campaignId = env.REACT_APP_SURVEY_CAMPAIGN_ID
    || env.VITE_SURVEY_CAMPAIGN_ID
    || (isDev ? "user-purpose-dev" : "");

  return {
    campaignId,
    startAt: asDate(env.REACT_APP_SURVEY_START_AT || env.VITE_SURVEY_START_AT),
    endAt: asDate(env.REACT_APP_SURVEY_END_AT || env.VITE_SURVEY_END_AT),
    fullSampleUntil: asDate(
      env.REACT_APP_SURVEY_FULL_SAMPLE_UNTIL || env.VITE_SURVEY_FULL_SAMPLE_UNTIL
    ),
    samplePercent: asPercent(
      env.REACT_APP_SURVEY_SAMPLE_PERCENT || env.VITE_SURVEY_SAMPLE_PERCENT,
      isDev ? 100 : 0
    ),
    delayMs: asDelay(
      env.REACT_APP_SURVEY_DELAY_MS || env.VITE_SURVEY_DELAY_MS,
      isDev ? 1000 : 20000
    ),
  };
};

export const surveyCampaignStatusKey = (campaignId) => `${STATUS_PREFIX}:${campaignId}:status`;
const surveyCampaignBucketKey = (campaignId) => `${STATUS_PREFIX}:${campaignId}:bucket`;

export const getSurveyCampaignStatus = (campaignId) => {
  if (!campaignId) return null;
  return localStorage.getItem(surveyCampaignStatusKey(campaignId));
};

export const setSurveyCampaignStatus = (campaignId, status) => {
  if (!campaignId || !status) return;
  localStorage.setItem(surveyCampaignStatusKey(campaignId), status);
};

export const getSurveyCampaignBucket = (campaignId) => {
  if (!campaignId) return 1;
  const key = surveyCampaignBucketKey(campaignId);
  const storedValue = localStorage.getItem(key);
  const stored = Number(storedValue);
  if (storedValue !== null && Number.isFinite(stored) && stored >= 0 && stored < 1) return stored;

  const randomValue = Math.random();
  localStorage.setItem(key, String(randomValue));
  return randomValue;
};

export const isSurveyCampaignEligible = ({
  config,
  now = new Date(),
  randomValue = Math.random(),
  status = getSurveyCampaignStatus(config?.campaignId),
}) => {
  if (!config?.campaignId || status) return false;
  if (config.startAt && now < config.startAt) return false;
  if (config.endAt && now >= config.endAt) return false;

  const samplePercent = config.fullSampleUntil && now < config.fullSampleUntil
    ? 100
    : config.samplePercent;
  return randomValue * 100 < samplePercent;
};
