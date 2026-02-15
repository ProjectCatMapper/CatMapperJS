import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useAuth } from './AuthContext';
import { ensureDatabase } from '../utils/database';
import { confirmForgotPassword, requestForgotPassword } from '../api/profileApi';

const LoginPage = ({ database }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const safeDatabase = ensureDatabase(database);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
    const [resetRequest, setResetRequest] = useState(null);
    const [resetVerificationCode, setResetVerificationCode] = useState('');

    const handleLogin = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        const result = await login(username, password);
        if (!result?.ok) {
            setErrorMessage(result?.message || 'Login failed');
            return;
        }

        const requestedPath = location.state?.from?.pathname;
        const targetPath = (typeof requestedPath === 'string' && requestedPath.startsWith(`/${safeDatabase}`))
            ? requestedPath
            : `/${safeDatabase}`;
        navigate(targetPath, { replace: true });
    };

    const handleNavigateToRegister = () => {
        navigate(`/${safeDatabase}/register`);
    };

    const handleRequestPasswordReset = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (!username.trim()) {
            setErrorMessage('Enter your username first.');
            return;
        }
        if (resetPassword.length < 6) {
            setErrorMessage('New password must be at least 6 characters.');
            return;
        }
        if (resetPassword !== resetPasswordConfirm) {
            setErrorMessage('New password and confirmation do not match.');
            return;
        }

        try {
            const data = await requestForgotPassword({
                user: username.trim(),
                newPassword: resetPassword,
            });
            setResetRequest(data);
            setSuccessMessage(`Verification email sent to ${data.maskedEmail}. Enter the code to finish resetting your password.`);
        } catch (requestError) {
            setErrorMessage(requestError.message || 'Unable to request password reset.');
            return;
        }
    };

    const handleConfirmPasswordReset = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (!resetRequest?.requestId || !resetVerificationCode.trim()) {
            setErrorMessage('Enter the verification code from your email.');
            return;
        }

        try {
            await confirmForgotPassword({
                user: username.trim(),
                requestId: resetRequest.requestId,
                verificationCode: resetVerificationCode.trim(),
            });
        } catch (confirmError) {
            setErrorMessage(confirmError.message || 'Unable to confirm password reset.');
            return;
        }

        setResetRequest(null);
        setResetVerificationCode('');
        setResetPassword('');
        setResetPasswordConfirm('');
        setSuccessMessage('Password reset successful. You can now log in with your new password.');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
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
            <Button variant="contained" sx={{
                backgroundColor: 'black',
                color: 'white',
                '&:hover': {
                    backgroundColor: 'green',
                },
            }} onClick={handleLogin}>Login</Button>
            <Button
                variant="text"
                onClick={handleRequestPasswordReset}
                sx={{ mt: 1 }}
            >
                Send Password Reset Code
            </Button>
            <TextField
                label="New Password"
                type="password"
                variant="outlined"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                sx={{ mt: 1, mb: 2 }}
            />
            <TextField
                label="Confirm New Password"
                type="password"
                variant="outlined"
                value={resetPasswordConfirm}
                onChange={(e) => setResetPasswordConfirm(e.target.value)}
                sx={{ mb: 2 }}
            />
            {resetRequest && (
                <>
                    <TextField
                        label="Verification Code"
                        variant="outlined"
                        value={resetVerificationCode}
                        onChange={(e) => setResetVerificationCode(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: 'black',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'green',
                            },
                            mb: 2
                        }}
                        onClick={handleConfirmPasswordReset}
                    >
                        Confirm Password Reset
                    </Button>
                </>
            )}
            {resetRequest?.debugVerificationCode && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Dummy endpoint mode: email code is <strong>{resetRequest.debugVerificationCode}</strong>
                </Alert>
            )}
            <Button variant="contained" sx={{
                backgroundColor: 'black',
                color: 'white',
                '&:hover': {
                    backgroundColor: 'green',
                }, mt: 2
            }} onClick={handleNavigateToRegister}>Register</Button>
        </Box>
    );
};

export default LoginPage;
