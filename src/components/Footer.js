import React from 'react';
import { useLocation } from 'react-router-dom';
import FooterSocioMap from '../components/HomeSocioMap';
import FooterArchaMap from "../components/HomeArchaMap";

const DynamicFooter = () => {
    const location = useLocation();

    // Determine the database based on the URL path
    const isArchaMap = location.pathname.includes("archamap");

    // Assign the correct component to a capitalized variable
    const Footer = isArchaMap ? FooterArchaMap : FooterSocioMap;

    return (
        <footer className="footer-container">
            <Footer />
        </footer>
    );
};

export default DynamicFooter;