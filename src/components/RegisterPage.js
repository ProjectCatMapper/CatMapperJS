// RegisterPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, MenuItem, Select, TextField, Typography, Alert } from '@mui/material';
import Button from '@mui/material/Button';
import { ensureDatabase } from '../utils/database';
import { parseRegisterVerificationParams } from '../utils/registerVerificationLink';

const RegisterPage = ({ database }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const safeDatabase = ensureDatabase(database);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [databaseOption, setDatabase] = useState(safeDatabase);
    const [intendedUse, setintendedUse] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [verificationRequest, setVerificationRequest] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationPayload, setRegistrationPayload] = useState(null);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const linkParams = parseRegisterVerificationParams(location.search);
        if (!linkParams.email && !linkParams.username && !linkParams.requestId && !linkParams.verificationCode) {
            return;
        }
        if (linkParams.email) {
            setEmail((current) => current || linkParams.email);
        }
        if (linkParams.username) {
            setUsername((current) => current || linkParams.username);
        }
        if (linkParams.verificationCode) {
            setVerificationCode((current) => current || linkParams.verificationCode);
        }
        if (linkParams.requestId || linkParams.verificationCode) {
            setVerificationRequest({
                requestId: linkParams.requestId,
                maskedEmail: linkParams.email || 'your email',
            });
            setSuccessMessage('Registration verification link recognized. Review the details below and confirm your email.');
        }
    }, [location.search]);

    const buildRegistrationPayload = () => ({
        database: databaseOption,
        firstName,
        lastName,
        email,
        username,
        password,
        intendedUse,
    });

    const handleRegister = async () => {
        try {
            setSuccessMessage('');
            if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !databaseOption || !intendedUse) {
                setErrorMessage('Please fill in all the fields.');
                return;
            }

            if (password !== confirmPassword) {
                setErrorMessage('Passwords do not match.');
                return;
            }

            setErrorMessage('');
            setIsSubmitting(true);
            const payload = buildRegistrationPayload();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/newuser`, {
                //const response = await fetch("http://127.0.0.1:5001/newuser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                setRegistrationPayload(payload);
                setVerificationRequest(data);
                setVerificationCode('');
                setSuccessMessage(`Verification email sent to ${data.maskedEmail || email}. Enter the code to continue registration.`);
            } else {
                setErrorMessage(data?.error || 'Registration failed.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage('Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmEmail = async () => {
        try {
            setErrorMessage('');
            setSuccessMessage('');
            if (!verificationRequest?.requestId || !verificationCode.trim()) {
                setErrorMessage('Enter the verification code from your email.');
                return;
            }
            if (!email.trim() && !username.trim()) {
                setErrorMessage('Enter your email address or username.');
                return;
            }

            setIsSubmitting(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/newuser/confirm-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    username: username.trim(),
                    requestId: verificationRequest.requestId,
                    verificationCode: verificationCode.trim(),
                }),
            });
            const data = await response.json();

            if (response.ok) {
                setIsVerified(true);
                setSuccessMessage(data?.message || 'Email verified. Your registration is now awaiting admin approval.');
            } else {
                setErrorMessage(data?.error || 'Unable to verify email.');
            }
        } catch (error) {
            console.error('Error during registration email confirmation:', error);
            setErrorMessage('Unable to verify email.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendVerification = async () => {
        if (registrationPayload) {
            setFirstName(registrationPayload.firstName);
            setLastName(registrationPayload.lastName);
            setEmail(registrationPayload.email);
            setUsername(registrationPayload.username);
            setPassword(registrationPayload.password);
            setConfirmPassword(registrationPayload.password);
            setDatabase(registrationPayload.database);
            setintendedUse(registrationPayload.intendedUse);
        }
        await handleRegister();
    };

    if (isVerified) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                <Typography variant="body1" sx={{ mb: 2, maxWidth: 520, textAlign: 'center' }}>
                    Please wait while we review your registration. You will receive an email when your account has been enabled.
                    Contact support@catmapper.org for any questions.
                </Typography>
                <Button variant="contained" onClick={() => navigate(`/${ensureDatabase(databaseOption, safeDatabase)}/login`)}>
                    Back to Login
                </Button>
            </Box>
        );
    }

    if (verificationRequest) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                <Typography variant="h6" sx={{ mb: 1 }}>Verify your email</Typography>
                <Typography variant="body1" sx={{ mb: 2, maxWidth: 520, textAlign: 'center' }}>
                    Enter the verification code sent to {verificationRequest.maskedEmail || email || 'your email'}.
                </Typography>
                <TextField
                    label="Verification Code"
                    variant="outlined"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button variant="contained" disabled={isSubmitting} onClick={handleConfirmEmail}>
                    Confirm Email
                </Button>
                <Button variant="text" disabled={isSubmitting} onClick={handleResendVerification} sx={{ mt: 1 }}>
                    Resend Verification Email
                </Button>
                {verificationRequest?.debugVerificationCode && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Dummy endpoint mode: email code <strong>{verificationRequest.debugVerificationCode}</strong>
                    </Alert>
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            <TextField
                label="First Name"
                variant="outlined"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Last Name"
                variant="outlined"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" style={{ fontWeight: "bolder" }}>
                Select database
            </Typography>
            <Select
                value={databaseOption}
                onChange={(event) => {
                    setDatabase(event.target.value);
                }}
                displayEmpty
                sx={{ mb: 2 }}
            >
                <MenuItem value="" disabled>Select an option</MenuItem>
                <MenuItem value="sociomap">SocioMap</MenuItem>
                <MenuItem value="archamap">Archamap</MenuItem>
            </Select>
            <Typography variant="body1" style={{ fontWeight: "bolder" }}>
                Intended use for CatMapper applications (Please write one or more sentences for timely approval):
            </Typography>
            <TextField
                multiline
                rows={5}
                value={intendedUse}
                onChange={(event) => {
                    setintendedUse(event.target.value);
                }}
                variant="outlined"
                sx={{ mt: 2, mb: 2, resize: "horizontal", overflow: 'auto', width: "24vw" }}
            />
            <Button variant="contained" disabled={isSubmitting} onClick={handleRegister}>Register</Button>
        </Box>
    );
};

export default RegisterPage;
