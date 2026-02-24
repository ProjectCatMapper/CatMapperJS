import React from 'react';
import { Box, Divider, Link, Typography } from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';
import image from "../assets/catmapperWhite_small.webp";
import packageJson from '../../package.json';
import './FooterLinks.css';

const FooterLinks = () => {
    const navLinks = [
        { name: "About", path: "/about" },
        { name: "People", path: "/people" },
        { name: "News", path: "/news" },
        { name: "Funding", path: "/funding" },
        { name: "Citation", path: "/citation" },
        { name: "Terms", path: "/terms" },
        { name: "Privacy", path: "/privacy" },
        { name: "Contact", path: "/contact" },
        { name: "Download", path: "/download" },
    ];

    return (
        <>
            <Divider className="footer-links-divider" />

            <Box className="footer-links-wrap">
                <Box>
                    <img src={image} alt="CatMapper Logo" className="footer-links-logo" />
                    <Typography variant="caption" className="footer-links-version">
                        CatMapper v{packageJson.version}
                    </Typography>
                </Box>
                <Box className="footer-links-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            component={RouterLink}
                            to={link.path}
                            className="footer-links-nav-item"
                        >
                            {link.name}
                        </Link>
                    ))}
                </Box>
            </Box>
        </>
    );
};

export default FooterLinks;
