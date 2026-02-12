import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from './AuthContext';
import {
  confirmPasswordChange,
  confirmProfileUpdate,
  getUserProfile,
  requestPasswordChange,
  requestProfileUpdate
} from '../api/profileApi';

const baseButtonStyle = {
  backgroundColor: 'black',
  color: 'white',
  '&:hover': {
    backgroundColor: 'green'
  }
};

const passwordMeetsPolicy = (value) => {
  const minLength = value.length >= 10;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  return minLength && hasUpper && hasLower && hasNumber && hasSymbol;
};

const ProfilePage = ({ database }) => {
  const { user, cred } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    database: database || '',
    intendedUse: ''
  });

  const [profileRequest, setProfileRequest] = useState(null);
  const [profileVerificationCode, setProfileVerificationCode] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordRequest, setPasswordRequest] = useState(null);
  const [passwordVerificationCode, setPasswordVerificationCode] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const profileData = await getUserProfile({ userId: user, database, cred });
        if (!mounted) return;

        setProfile(profileData);
        setFormData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          username: profileData.username,
          email: profileData.email,
          database: profileData.database,
          intendedUse: profileData.intendedUse
        });
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load profile.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [cred, database, user]);

  const hasProfileChanges = useMemo(() => {
    if (!profile) return false;
    return ['firstName', 'lastName', 'username', 'email', 'database', 'intendedUse'].some(
      (field) => (profile[field] || '') !== (formData[field] || '')
    );
  }, [formData, profile]);

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRequestProfileUpdate = async () => {
    if (!hasProfileChanges) {
      setError('No changes to submit.');
      setSuccess('');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.database) {
      setError('First name, last name, username, email, and database are required.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const request = await requestProfileUpdate({
        userId: user,
        updates: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          database: formData.database,
          intendedUse: formData.intendedUse
        }
      });

      setProfileRequest(request);
      setSuccess(`Verification email sent to ${request.maskedEmail}. Enter code to confirm profile changes.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to request profile update.');
      setSuccess('');
    }
  };

  const handleConfirmProfileUpdate = async () => {
    if (!profileRequest?.requestId || !profileVerificationCode) {
      setError('Enter the verification code from your email.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const updated = await confirmProfileUpdate({
        userId: user,
        requestId: profileRequest.requestId,
        verificationCode: profileVerificationCode.trim()
      });

      setProfile(updated);
      setFormData({
        firstName: updated.firstName,
        lastName: updated.lastName,
        username: updated.username,
        email: updated.email,
        database: updated.database,
        intendedUse: updated.intendedUse
      });
      setProfileRequest(null);
      setProfileVerificationCode('');
      setSuccess('Profile updated successfully after email verification.');
    } catch (confirmError) {
      setError(confirmError.message || 'Unable to confirm profile update.');
      setSuccess('');
    }
  };

  const handleRequestPasswordChange = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Fill in current password, new password, and confirmation.');
      setSuccess('');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      setSuccess('');
      return;
    }

    if (!passwordMeetsPolicy(newPassword)) {
      setError('Password must be at least 10 characters and include uppercase, lowercase, number, and symbol.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const request = await requestPasswordChange({
        userId: user,
        currentPassword,
        newPassword
      });

      setPasswordRequest(request);
      setSuccess(`Verification email sent to ${request.maskedEmail}. Enter code to confirm password change.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to request password change.');
      setSuccess('');
    }
  };

  const handleConfirmPasswordChange = async () => {
    if (!passwordRequest?.requestId || !passwordVerificationCode) {
      setError('Enter the verification code from your email to change password.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');

      await confirmPasswordChange({
        userId: user,
        requestId: passwordRequest.requestId,
        verificationCode: passwordVerificationCode.trim()
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setPasswordRequest(null);
      setPasswordVerificationCode('');
      setSuccess('Password changed successfully after email verification.');
    } catch (confirmError) {
      setError(confirmError.message || 'Unable to confirm password change.');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 980, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Update your profile details and password. Any change requires email verification before it is applied.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Profile Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="User ID" value={profile?.userId || ''} fullWidth disabled />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Username" value={formData.username} onChange={handleFieldChange('username')} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="First Name" value={formData.firstName} onChange={handleFieldChange('firstName')} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Last Name" value={formData.lastName} onChange={handleFieldChange('lastName')} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Email" type="email" value={formData.email} onChange={handleFieldChange('email')} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Database" value={formData.database} onChange={handleFieldChange('database')} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Intended Use"
                value={formData.intendedUse}
                onChange={handleFieldChange('intendedUse')}
                fullWidth
                multiline
                minRows={4}
              />
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="contained" sx={baseButtonStyle} onClick={handleRequestProfileUpdate}>
              Send Verification Email
            </Button>
            {profileRequest && (
              <>
                <TextField
                  label="Verification Code"
                  value={profileVerificationCode}
                  onChange={(event) => setProfileVerificationCode(event.target.value)}
                  size="small"
                />
                <Button variant="contained" sx={baseButtonStyle} onClick={handleConfirmProfileUpdate}>
                  Confirm Profile Changes
                </Button>
              </>
            )}
          </Stack>

          {profileRequest?.debugVerificationCode && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Dummy endpoint mode: email code is <strong>{profileRequest.debugVerificationCode}</strong>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Security</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Password changes require your current password and email verification.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmNewPassword: event.target.value }))}
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="contained" sx={baseButtonStyle} onClick={handleRequestPasswordChange}>
              Send Verification Email
            </Button>
            {passwordRequest && (
              <>
                <TextField
                  label="Verification Code"
                  value={passwordVerificationCode}
                  onChange={(event) => setPasswordVerificationCode(event.target.value)}
                  size="small"
                />
                <Button variant="contained" sx={baseButtonStyle} onClick={handleConfirmPasswordChange}>
                  Confirm Password Change
                </Button>
              </>
            )}
          </Stack>

          {passwordRequest?.debugVerificationCode && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Dummy endpoint mode: email code is <strong>{passwordRequest.debugVerificationCode}</strong>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
