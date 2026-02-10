import React from 'react';
import Navbar from '../components/NavbarApp';
import Video from '../components/Video';
import { useParams } from 'react-router-dom';
import AppBody from "../components/AppBody";

const AppHome = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
        }}>
            <Navbar {...useParams()} />
            <Video {...useParams()} />
            <AppBody {...useParams()} />
        </div>
    );
};

export default AppHome;