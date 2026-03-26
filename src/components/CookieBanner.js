import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Typography, Box } from '@mui/material';
import { getCookieConsent, setCookieConsent } from '../utils/cookieConsent';

// Replace with your actual Measurement ID
const GA_MEASUREMENT_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

const CookieBanner = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const consent = getCookieConsent();
        if (!consent) {
            setOpen(true);
        } else if (consent === 'rejected' && GA_MEASUREMENT_ID) {
            // Ensure GA remains disabled if they previously declined
            window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
        }
    }, []);

    const handleAccept = () => {
        setCookieConsent('accepted');
        setOpen(false);
        // Hard refresh to trigger the initAnalytics() in index.js
        window.location.reload();
    };

    const handleDecline = () => {
        setCookieConsent('rejected');
        if (GA_MEASUREMENT_ID) {
            window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
        }
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Box sx={{
                // Uses RGBA for transparency (0.75 = 75% opaque)
                // This allows the map/content to peak through slightly
                bgcolor: 'rgba(255, 255, 255, 0.75) !important',
                p: 3,
                border: '1px solid #ccc',
                borderRadius: 2,
                boxShadow: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                // Increased from 400 to 600 for a wider profile
                maxWidth: 600,
                // Ensures it doesn't overflow on mobile devices
                width: '90vw',
                // Backdrop filter adds a nice "frosted glass" effect if supported
                backdropFilter: 'blur(4px)',
            }}>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    CatMapper uses cookies to improve your mapping experience and analyze our traffic.
                    By clicking "Accept," you agree to our use of cookies.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button size="small" color="inherit" onClick={handleDecline}>
                        Decline
                    </Button>
                    <Button size="small" variant="contained" onClick={handleAccept}>
                        Accept
                    </Button>
                </Box>
            </Box>
        </Snackbar>
    );
};

export default CookieBanner;
