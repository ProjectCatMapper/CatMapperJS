import { createContext, useState, useContext, useEffect, useRef } from 'react';
import {
    AUTH_INVALID_EVENT,
    SESSION_EXPIRED_MESSAGE,
    looksLikeAuthFailure,
    setAuthInvalidNotice,
    signalAuthInvalid,
} from '../utils/authSession';

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
    }); // 0: Unauthenticated, 1: Advanced, 2: Admin
    const authStateRef = useRef({ user: null, cred: null, authLevel: 0 });
    const sessionInvalidHandledRef = useRef(false);

    const clearAuthState = () => {
        setUser(null);
        setCred(null);
        setAuthLevel(0);
        localStorage.removeItem('authLevel');
        localStorage.removeItem('userId');
        localStorage.removeItem('cred');
        localStorage.removeItem('authToken');
    };


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

    useEffect(() => {
        const handleAuthInvalid = (event) => {
            if (sessionInvalidHandledRef.current) return;
            sessionInvalidHandledRef.current = true;
            const message = event?.detail?.message || SESSION_EXPIRED_MESSAGE;
            setAuthInvalidNotice(message);
            clearAuthState();
        };
        window.addEventListener(AUTH_INVALID_EVENT, handleAuthInvalid);
        return () => {
            window.removeEventListener(AUTH_INVALID_EVENT, handleAuthInvalid);
        };
    }, []);

    useEffect(() => {
        authStateRef.current = { user, cred, authLevel };
    }, [user, cred, authLevel]);

    useEffect(() => {
        if (authLevel > 0 && (!user || !cred)) {
            if (sessionInvalidHandledRef.current) return;
            sessionInvalidHandledRef.current = true;
            setAuthInvalidNotice(SESSION_EXPIRED_MESSAGE);
            clearAuthState();
        }
    }, [authLevel, user, cred]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;

        const apiBase = String(process.env.REACT_APP_API_URL || '');
        const originalFetch = window.fetch.bind(window);

        const resolveUrl = (input) => {
            if (typeof input === 'string') return input;
            if (input && typeof input.url === 'string') return input.url;
            return '';
        };

        const shouldInspect = (url) => {
            if (!url) return false;
            if (!apiBase) return true;
            return url.startsWith(apiBase);
        };

        const readErrorMessage = async (response) => {
            const clone = response.clone();
            try {
                const payload = await clone.json();
                return payload?.error || payload?.message || '';
            } catch (_jsonError) {
                try {
                    return await clone.text();
                } catch (_textError) {
                    return '';
                }
            }
        };

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            const { user: currentUser, authLevel: currentAuthLevel } = authStateRef.current;
            const isLoggedIn = Boolean(currentUser) && Number(currentAuthLevel) > 0;
            const requestUrl = resolveUrl(args[0]);

            if (!isLoggedIn || !shouldInspect(requestUrl)) {
                return response;
            }

            if (response.status === 401 || response.status === 403) {
                signalAuthInvalid(SESSION_EXPIRED_MESSAGE);
                return new Response(
                    JSON.stringify({ error: SESSION_EXPIRED_MESSAGE }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            if (!response.ok) {
                const errorMessage = await readErrorMessage(response);
                if (looksLikeAuthFailure(errorMessage)) {
                    signalAuthInvalid(SESSION_EXPIRED_MESSAGE);
                    return new Response(
                        JSON.stringify({ error: SESSION_EXPIRED_MESSAGE }),
                        { status: 401, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            }

            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

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
                sessionInvalidHandledRef.current = false;
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
        sessionInvalidHandledRef.current = false;
        clearAuthState();
    };

    return (
        <AuthContext.Provider value={{ authLevel, user, cred, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
