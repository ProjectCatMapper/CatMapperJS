import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { ensureDatabase } from '../utils/database';
import { confirmForgotPassword, requestForgotPassword } from '../api/profileApi';

const ForgotPasswordPage = ({ database }) => {
  const navigate = useNavigate();
  const safeDatabase = ensureDatabase(database);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetRequest, setResetRequest] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestPasswordReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() && !username.trim()) {
      setErrorMessage('Enter your email address or username.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    try {
      const data = await requestForgotPassword({
        user: username.trim(),
        email: email.trim(),
        newPassword,
      });
      setResetRequest(data);
      if (data?.requestId) {
        const target = data.maskedEmail ? ` to ${data.maskedEmail}` : '';
        setSuccessMessage(`Verification email sent${target}. Enter the code to finish resetting your password.`);
      } else {
        setSuccessMessage(data?.message || 'If an account exists for the provided username/email, a verification code has been sent.');
      }
    } catch (requestError) {
      setErrorMessage(requestError.message || 'Unable to request password reset.');
    }
  };

  const handleConfirmPasswordReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetRequest?.requestId || !verificationCode.trim()) {
      setErrorMessage('Enter the verification code from your email.');
      return;
    }

    try {
      await confirmForgotPassword({
        user: username.trim(),
        email: email.trim(),
        requestId: resetRequest.requestId,
        verificationCode: verificationCode.trim(),
      });
      setResetRequest(null);
      setVerificationCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSuccessMessage('Password reset successful. You can now log in with your new password.');
    } catch (confirmError) {
      setErrorMessage(confirmError.message || 'Unable to confirm password reset.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <TextField
        label="Email Address"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Username (Optional)"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="New Password"
        type="password"
        variant="outlined"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Confirm New Password"
        type="password"
        variant="outlined"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
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
        onClick={handleRequestPasswordReset}
      >
        Send Password Reset Code
      </Button>

      {resetRequest && (
        <>
          <TextField
            label="Verification Code"
            variant="outlined"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
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

      <Button
        variant="text"
        onClick={() => navigate(`/${safeDatabase}/login`)}
      >
        Back to Login
      </Button>
    </Box>
  );
};

export default ForgotPasswordPage;
