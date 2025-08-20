import { createContext, useState, useContext,useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {

//     const location = useLocation();
// const database = location.pathname.includes("archamap") ? "ArchaMap" : "SocioMap";
const currentPath = window.location.pathname;
console.log(currentPath)

    const [user, setUser] = useState(() => {
        return localStorage.getItem('userId') || null;
    });

    const [cred, setCred] = useState(() => {
        return JSON.parse(localStorage.getItem('cred')) || null;
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
            localStorage.setItem('cred',JSON.stringify(cred));
        } else {
            localStorage.removeItem('cred');
        }
        localStorage.setItem('authLevel', authLevel);
    }, [authLevel,user,cred]);

    const login = async (username, password) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        //const response = await fetch("http://127.0.0.1:5001/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user : username, 
                password : password}),
        });

        if (response.ok) {
            const data = await response.json();
            setUser(data.userid)
            setCred(data)
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
        localStorage.removeItem('cred');
    };

    return (
        <AuthContext.Provider value={{ authLevel,user,cred, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
