// RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, MenuItem, Select, TextField, Typography, Alert } from '@mui/material';
import Button from '@mui/material/Button';

const RegisterPage = ({ database }) => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [databaseOption, setDatabase] = useState(database || '');
    const [intendedUse, setintendedUse] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleRegister = async () => {
        try {
            if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !databaseOption || !intendedUse) {
                setErrorMessage('Please fill in all the fields.');
                return;
            }

            if (password !== confirmPassword) {
                setErrorMessage('Passwords do not match.');
                return;
            }

            setErrorMessage('');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/newuser`, {
                //const response = await fetch("http://127.0.0.1:5001/newuser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    database: databaseOption,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    username: username,
                    password: password,
                    intendedUse: intendedUse
                }),
            });

            if (response.ok) {
                alert('Please wait while we verify your registration. You will receive an email when your account has been enabled. Contact support@catmapper.org for any questions.');
                navigate('/login');
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
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
            <Typography variant="9" style={{ fontWeight: "bolder" }}>
                Select database
            </Typography>
            <Select
                value={database}
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
            <Typography variant="p" style={{ fontWeight: "bolder" }}>
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
            <Button variant="contained" onClick={handleRegister}>Register</Button>
        </Box>
    );
};

export default RegisterPage;
