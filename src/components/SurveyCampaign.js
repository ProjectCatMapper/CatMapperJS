import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
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
  IconButton,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const initialPathRef = useRef(location.pathname);
  const [consent, setConsent] = useState(() => getCookieConsent());
  const [open, setOpen] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [routeChanged, setRouteChanged] = useState(false);
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
    if (location.pathname !== initialPathRef.current) {
      setRouteChanged(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!consent) return undefined;
    const handleInteraction = () => setUserInteracted(true);
    document.addEventListener("pointerdown", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    return () => {
      document.removeEventListener("pointerdown", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [consent]);

  const showSurvey = useCallback(() => {
    setSurveyCampaignStatus(config.campaignId, "shown");
    setOpen(true);
    trackSurveyEvent("survey_impression", { campaign_id: config.campaignId });
  }, [config.campaignId]);

  useEffect(() => {
    if (!consent || !isSurveyCampaignEligible({
      config,
      randomValue: getSurveyCampaignBucket(config.campaignId),
    })) return undefined;

    if (userInteracted || routeChanged) {
      showSurvey();
      return undefined;
    }

    const timer = window.setTimeout(showSurvey, config.delayMs);

    return () => window.clearTimeout(timer);
  }, [config, consent, routeChanged, showSurvey, userInteracted]);

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
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { m: 2 } }}
    >
      <DialogTitle
        id="user-purpose-survey-title"
        sx={{ position: "relative", px: 2, py: 1.25, pr: 7, fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.25 }}
      >
        Help us learn about our users. Thanks!
        <IconButton
          aria-label="Close survey"
          onClick={handleClose}
          disabled={submitting}
          sx={{ position: "absolute", right: 6, top: 4, width: 44, height: 44 }}
        >
          <CloseIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 2, py: 1.25 }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Did you come to this site for:
        </Typography>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup aria-label="Select one answer" value={choice} onChange={(event) => {
            setChoice(event.target.value);
            setError("");
          }}>
            {OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" sx={{ p: 0.5 }} />}
                label={option.label}
                componentsProps={{ typography: { variant: "body2" } }}
                sx={{ m: 0, minHeight: 30 }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {choice === "other" && (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            margin="dense"
            label="Please specify"
            value={otherText}
            onChange={(event) => setOtherText(event.target.value)}
            inputProps={{ maxLength: SURVEY_COMMENT_MAX_LENGTH }}
            helperText={`${otherText.length}/${SURVEY_COMMENT_MAX_LENGTH} characters`}
          />
        )}

        {error && <Alert severity="error" sx={{ mt: 1, py: 0 }}>{error}</Alert>}

        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Further comments/questions? Email{" "}
            <Link href="mailto:admin@catmapper.org">admin@catmapper.org</Link>.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button size="small" onClick={handleClose} disabled={submitting}>Close</Button>
        <Button size="small" onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyCampaign;
