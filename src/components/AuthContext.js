import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        return localStorage.getItem('userId') || null;
    });

    const [cred, setCred] = useState(() => {
        const token = localStorage.getItem('authToken');
        if (token) return token;
        // Legacy fallback (older sessions stored JSON in `cred`).
        try {
            const legacy = JSON.parse(localStorage.getItem('cred'));
            if (typeof legacy === 'string') return legacy;
            if (legacy && typeof legacy === 'object' && legacy.token) return legacy.token;
        } catch (_err) {
            // ignore parse errors
        }
        return null;
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
        if (cred) {
            localStorage.setItem('authToken', cred);
        } else {
            localStorage.removeItem('authToken');
        }
        // Clear legacy credential storage.
        localStorage.removeItem('cred');
        localStorage.setItem('authLevel', authLevel);
    }, [authLevel, user, cred]);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: username,
                    password: password
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.userid)
                setCred(data.token || null)
                if (data.role === "user") {
                    setAuthLevel(1)
                }
                if (data.role === "admin") {
                    setAuthLevel(2)
                }
                return { ok: true };
            }

            const errorData = await response.json().catch(() => ({}));
            return { ok: false, message: errorData?.error || 'Login failed' };
        } catch (_error) {
            return { ok: false, message: 'Login failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setAuthLevel(0);
        localStorage.removeItem('authLevel');
        localStorage.removeItem('userId');
        localStorage.removeItem('cred');
        localStorage.removeItem('authToken');
    };

    return (
        <AuthContext.Provider value={{ authLevel, user, cred, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
