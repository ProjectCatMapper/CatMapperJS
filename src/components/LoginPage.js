import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useAuth } from './AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const history = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const currentPath = window.location.pathname;
    console.log(currentPath)

    const handleLogin = async () => {
        await login(username, password);
        history('/');
    };

    const handleNavigateToRegister = () => {
        history('/register');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
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
            <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        }, mt:2
      }} onClick={handleNavigateToRegister}>Register</Button>
        </Box>
    );
};

export default LoginPage;
