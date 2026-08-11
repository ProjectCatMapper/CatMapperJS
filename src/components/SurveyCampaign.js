import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import ReactGA from "react-ga4";
import { apiUrl } from "../api/endpoints";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  getCookieConsent,
  isCookieConsentAccepted,
} from "../utils/cookieConsent";
import {
  getSurveyCampaignConfig,
  getSurveyCampaignBucket,
  isSurveyCampaignEligible,
  setSurveyCampaignStatus,
} from "../utils/surveyCampaign";

export const SURVEY_COMMENT_MAX_LENGTH = 1000;

const OPTIONS = [
  { value: "information", label: "Information about something, like an ethnicity, language, or artifact type" },
  { value: "data_tools", label: "Tools for bringing data together" },
  { value: "gis", label: "GIS" },
  { value: "cats", label: "Cats" },
  { value: "other", label: "Something else" },
];

const trackSurveyEvent = (eventName, parameters) => {
  if (isCookieConsentAccepted()) {
    ReactGA.event(eventName, parameters);
  }
};

const SurveyCampaign = () => {
  const config = useMemo(() => getSurveyCampaignConfig(), []);
  const [consent, setConsent] = useState(() => getCookieConsent());
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const [otherText, setOtherText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleConsentChange = (event) => setConsent(event.detail);
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
  }, []);

  useEffect(() => {
    if (!consent || !isSurveyCampaignEligible({
      config,
      randomValue: getSurveyCampaignBucket(config.campaignId),
    })) return undefined;

    const timer = window.setTimeout(() => {
      setSurveyCampaignStatus(config.campaignId, "shown");
      setOpen(true);
      trackSurveyEvent("survey_impression", { campaign_id: config.campaignId });
    }, config.delayMs);

    return () => window.clearTimeout(timer);
  }, [config, consent]);

  const handleClose = useCallback(() => {
    setSurveyCampaignStatus(config.campaignId, "dismissed");
    trackSurveyEvent("survey_dismiss", { campaign_id: config.campaignId });
    setOpen(false);
  }, [config.campaignId]);

  const handleSubmit = async () => {
    const trimmedOtherText = otherText.trim();
    if (!choice) {
      setError("Please select one answer.");
      return;
    }
    if (choice === "other" && !trimmedOtherText) {
      setError("Please describe what brought you to CatMapper.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/survey-responses"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: config.campaignId,
          choice,
          ...(choice === "other" ? { otherText: trimmedOtherText } : {}),
        }),
      });
      if (!response.ok) {
        throw new Error("Survey submission failed");
      }

      setSurveyCampaignStatus(config.campaignId, "submitted");
      trackSurveyEvent("survey_submit", {
        campaign_id: config.campaignId,
        survey_choice: choice,
      });
      setOpen(false);
    } catch (submissionError) {
      setError("We could not submit your answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!config.campaignId) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="user-purpose-survey-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="user-purpose-survey-title">Help us learn about our users</DialogTitle>
      <DialogContent dividers>
        <Typography paragraph>
          Thanks! Did you come to this site for:
        </Typography>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Select one answer</FormLabel>
          <RadioGroup value={choice} onChange={(event) => {
            setChoice(event.target.value);
            setError("");
          }}>
            {OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {choice === "other" && (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            margin="normal"
            label="Please specify"
            value={otherText}
            onChange={(event) => setOtherText(event.target.value)}
            inputProps={{ maxLength: SURVEY_COMMENT_MAX_LENGTH }}
            helperText={`${otherText.length}/${SURVEY_COMMENT_MAX_LENGTH} characters`}
          />
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Further questions or comments? Email{" "}
            <Link href="mailto:admin@catmapper.org">admin@catmapper.org</Link>.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>Close</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyCampaign;
