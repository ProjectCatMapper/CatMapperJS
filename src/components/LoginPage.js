import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useAuth } from './AuthContext';
import { ensureDatabase } from '../utils/database';

const LoginPage = ({ database }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const safeDatabase = ensureDatabase(database);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
                onClick={() => navigate(`/${safeDatabase}/forgot-password`)}
                sx={{ mt: 1 }}
            >
                Forgot Password?
            </Button>
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
