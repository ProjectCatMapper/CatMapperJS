import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  addBookmark,
  confirmPasswordChange,
  confirmProfileUpdate,
  getBookmarks,
  getHistory,
  getUserActivity,
  getUserProfile,
  removeBookmarks,
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

const sidebarItems = [
  { key: 'activity', label: 'My Activity' },
  { key: 'profile', label: 'Profile Information' },
  { key: 'security', label: 'Security' },
  { key: 'library', label: 'Bookmarks & History' }
];
const validProfileTabs = new Set(sidebarItems.map((item) => item.key));

const ACTIVITY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const passwordMeetsPolicy = (value) => value.length >= 6;

const cmidType = (cmid) => {
  if ((cmid || '').startsWith('SD') || (cmid || '').startsWith('AD')) return 'DATASET';
  if ((cmid || '').startsWith('SM') || (cmid || '').startsWith('AM')) return 'CATEGORY';
  return 'UNKNOWN';
};

const cmidStyle = (cmid) => {
  const type = cmidType(cmid);
  if (type === 'DATASET') {
    return { backgroundColor: '#e3f2fd', color: '#0d47a1', border: '1px solid #90caf9' };
  }
  if (type === 'CATEGORY') {
    return { backgroundColor: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' };
  }
  return { backgroundColor: '#eeeeee', color: '#424242', border: '1px solid #bdbdbd' };
};

const ProfilePage = ({ database, tab }) => {
  const navigate = useNavigate();
  const { user, cred } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activePage, setActivePage] = useState('activity');

  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState({
    createdNodes: 0,
    createdRelationships: 0,
    updatedNodes: 0,
    updatedRelationships: 0,
    totalActions: 0
  });
  const [activityMeta, setActivityMeta] = useState({
    fromCache: false,
    lastUpdated: null,
    refreshing: false
  });
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState({});

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
    if (!database) return;
    const normalizedTab = (tab || '').toLowerCase();
    if (!normalizedTab || !validProfileTabs.has(normalizedTab)) {
      if (!tab && activePage === 'activity') return;
      setActivePage('activity');
      if (tab) {
        navigate(`/${database}/profile/activity`, { replace: true });
      }
      return;
    }
    if (normalizedTab !== activePage) {
      setActivePage(normalizedTab);
    }
  }, [database, tab, activePage, navigate]);

  const handleSidebarSelect = (pageKey) => {
    setActivePage(pageKey);
    if (database) {
      navigate(`/${database}/profile/${pageKey}`);
    }
  };

  const getActivityCacheKey = () => `catmapper_activity_${user || 'anon'}_${(database || '').toLowerCase()}`;

  const loadActivity = async ({ forceRefresh = false } = {}) => {
    if (!user || !cred || !database) return;

    setActivityMeta((prev) => ({ ...prev, refreshing: true }));
    const cacheKey = getActivityCacheKey();
    const now = Date.now();

    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.cachedAt && parsed?.data && now - parsed.cachedAt < ACTIVITY_CACHE_TTL_MS) {
            setActivity(parsed.data);
            setActivityMeta({
              fromCache: true,
              lastUpdated: parsed.cachedAt,
              refreshing: false
            });
            return;
          }
        }
      } catch (_cacheReadError) {
        // ignore cache read/parsing errors and fall through to API request
      }
    }

    const freshData = await getUserActivity({ userId: user, database, cred });
    setActivity(freshData || {});
    setActivityMeta({
      fromCache: false,
      lastUpdated: now,
      refreshing: false
    });
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ cachedAt: now, data: freshData || {} }));
    } catch (_cacheWriteError) {
      // ignore localStorage write failures
    }
  };

  const loadLibrary = async () => {
    const [bookmarkData, historyData] = await Promise.all([
      getBookmarks({ userId: user, cred }),
      getHistory({ userId: user, cred })
    ]);
    setBookmarks(bookmarkData.bookmarks || []);
    setHistory(historyData.history || []);
  };

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

        await loadActivity();
        await loadLibrary();
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
    return ['firstName', 'lastName', 'username', 'email', 'intendedUse'].some(
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

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username) {
      setError('First name, last name, username, and email are required.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const request = await requestProfileUpdate({
        userId: user,
        cred,
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
        verificationCode: profileVerificationCode.trim(),
        cred
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
      setError('Password must be at least 6 characters.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const request = await requestPasswordChange({
        userId: user,
        currentPassword,
        newPassword,
        cred
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
        verificationCode: passwordVerificationCode.trim(),
        cred
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPasswordRequest(null);
      setPasswordVerificationCode('');
      setSuccess('Password changed successfully after email verification.');
    } catch (confirmError) {
      setError(confirmError.message || 'Unable to confirm password change.');
      setSuccess('');
    }
  };

  const handleRemoveSelectedBookmarks = async () => {
    const items = Object.entries(selectedBookmarks)
      .filter(([, selected]) => selected)
      .map(([key]) => {
        const [cmid, db] = key.split('||');
        return { cmid, database: db };
      });

    if (items.length === 0) {
      setError('Select at least one bookmark to remove.');
      setSuccess('');
      return;
    }

    try {
      setError('');
      const response = await removeBookmarks({ userId: user, items, cred });
      setBookmarks(response.bookmarks || []);
      setSelectedBookmarks({});
      setSuccess('Selected bookmarks removed.');
    } catch (removeError) {
      setError(removeError.message || 'Unable to remove bookmarks.');
      setSuccess('');
    }
  };

  const handleBookmarkFromHistory = async (item) => {
    try {
      await addBookmark({
        userId: user,
        database: item.database || database,
        cmid: item.cmid,
        cmname: item.cmname,
        item,
        cred
      });
      await loadLibrary();
      setSuccess(`Bookmarked ${item.cmid}.`);
      setError('');
    } catch (bookmarkError) {
      setError(bookmarkError.message || 'Unable to bookmark this CMID.');
      setSuccess('');
    }
  };

  const toastMessage = error || success;
  const toastSeverity = error ? 'error' : 'success';

  const handleToastClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: '100%' }} variant="filled">
          {toastMessage}
        </Alert>
      </Snackbar>

      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ p: 1 }}>
              <List disablePadding>
                {sidebarItems.map((item) => (
                  <ListItemButton
                    key={item.key}
                    selected={activePage === item.key}
                    onClick={() => handleSidebarSelect(item.key)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          {activePage === 'activity' && (
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6">My Activity</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => loadActivity({ forceRefresh: true })}
                    disabled={activityMeta.refreshing}
                  >
                    {activityMeta.refreshing ? 'Refreshing...' : 'Refresh Activity'}
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Summary of logged database actions for your account.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  {activityMeta.lastUpdated
                    ? `Last updated: ${new Date(activityMeta.lastUpdated).toLocaleString()}${activityMeta.fromCache ? ' (cached)' : ''}`
                    : 'No activity cache yet.'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined"><CardContent><Typography variant="subtitle2">Nodes Created</Typography><Typography variant="h5">{activity.createdNodes || 0}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined"><CardContent><Typography variant="subtitle2">Relationships Created</Typography><Typography variant="h5">{activity.createdRelationships || 0}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined"><CardContent><Typography variant="subtitle2">Nodes Updated</Typography><Typography variant="h5">{activity.updatedNodes || 0}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined"><CardContent><Typography variant="subtitle2">Relationships Updated</Typography><Typography variant="h5">{activity.updatedRelationships || 0}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined"><CardContent><Typography variant="subtitle2">Total Logged Actions</Typography><Typography variant="h5">{activity.totalActions || 0}</Typography></CardContent></Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {activePage === 'profile' && (
            <Card>
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
                  <Grid item xs={12}>
                    <TextField label="Email" type="email" value={formData.email} onChange={handleFieldChange('email')} fullWidth />
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
          )}

          {activePage === 'security' && (
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
          )}

          {activePage === 'library' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Bookmarks & History</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Bookmarks</Typography>
                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, maxHeight: 320, overflowY: 'auto', p: 1 }}>
                      {bookmarks.length === 0 && <Typography variant="body2" color="text.secondary">No bookmarks yet.</Typography>}
                      {bookmarks.map((item) => {
                        const key = `${item.cmid}||${item.database}`;
                        return (
                          <Box key={key} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                            <Checkbox
                              size="small"
                              checked={Boolean(selectedBookmarks[key])}
                              onChange={(event) => {
                                setSelectedBookmarks((prev) => ({ ...prev, [key]: event.target.checked }));
                              }}
                            />
                            <Button
                              size="small"
                              onClick={() => navigate(`/${item.database}/${item.cmid}`)}
                              sx={{ ...cmidStyle(item.cmid), mr: 1, textTransform: 'none', minWidth: 86 }}
                            >
                              {item.cmid}
                            </Button>
                            <Typography variant="body2" sx={{ flex: 1, mr: 1 }}>{item.cmname || '(No CMName)'}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                    <Button
                      variant="outlined"
                      sx={{ mt: 1 }}
                      onClick={handleRemoveSelectedBookmarks}
                    >
                      Remove Selected
                    </Button>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>History (last 50)</Typography>
                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, maxHeight: 320, overflowY: 'auto', p: 1 }}>
                      {history.length === 0 && <Typography variant="body2" color="text.secondary">No history yet.</Typography>}
                      {history.map((item, idx) => (
                        <Box key={`${item.cmid}-${item.database}-${idx}`} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                          <Button
                            size="small"
                            onClick={() => navigate(`/${item.database}/${item.cmid}`)}
                            sx={{ ...cmidStyle(item.cmid), mr: 1, textTransform: 'none', minWidth: 86 }}
                          >
                            {item.cmid}
                          </Button>
                          <Typography variant="body2" sx={{ flex: 1, mr: 1 }}>{item.cmname || '(No CMName)'}</Typography>
                          <Button size="small" onClick={() => handleBookmarkFromHistory(item)}>Bookmark</Button>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
