import React, { createContext, useState, useContext,useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [authLevel, setAuthLevel] = useState(() => {
        const storedAuthLevel = localStorage.getItem('authLevel');
        return storedAuthLevel ? parseInt(storedAuthLevel, 10) : 0;
    });; // 0: Unauthenticated, 1: Advanced, 2: Admin

    useEffect(() => {
        localStorage.setItem('authLevel', authLevel);
    }, [authLevel]);

    const login = async (username, password) => {
        // Replace with your actual API endpoint
        const response = await fetch('https://catmapper.org/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                database : "sociomap",
                user : username, 
                password : password}),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.role === "user")
                {
                    setAuthLevel(1)
                }
            if (data.role === "admin")
                {
                setAuthLevel(2)
                }
            // setAuthLevel(data.authLevel); // Assuming the API response contains authLevel
        } else {
            // Handle login error
            alert('Login failed');
        }
    };

    const logout = () => {
        setAuthLevel(0);
        localStorage.removeItem('authLevel');
    };

    return (
        <AuthContext.Provider value={{ authLevel, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
