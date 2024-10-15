import React, { createContext, useState, useContext,useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        return localStorage.getItem('userId') || null;
    });

    const [authLevel, setAuthLevel] = useState(() => {
        const storedAuthLevel = localStorage.getItem('authLevel');
        return storedAuthLevel ? parseInt(storedAuthLevel, 10) : 0;
    });; // 0: Unauthenticated, 1: Advanced, 2: Admin


    useEffect(() => {
        if (user) {
            localStorage.setItem('userId', user); 
        } else {
            localStorage.removeItem('userId');
        }
        localStorage.setItem('authLevel', authLevel);
    }, [authLevel,user]);

    const login = async (username, password) => {
        const response = await fetch('https://catmapper.org/api/login', {
        //const response = await fetch("http://127.0.0.1:5001/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                database : "sociomap",
                user : username, 
                password : password}),
        });

        console.log(response)

        if (response.ok) {
            const data = await response.json();
            setUser(data.userid)
            if (data.role === "user")
                {
                    setAuthLevel(1)
                }
            if (data.role === "admin")
                {
                setAuthLevel(2)
                }
        } else {
            alert('Login failed');
        }
    };

    const logout = () => {
        setUser(null); 
        setAuthLevel(0);
        localStorage.removeItem('authLevel');
        localStorage.removeItem('userId');
    };

    return (
        <AuthContext.Provider value={{ authLevel,user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
