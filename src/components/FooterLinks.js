import React from 'react';
import { Box, Divider, Link } from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';
import image from "../assets/white.png";

const FooterLinks = () => {
    const linkStyle = {
        color: "white",
        textDecoration: "none",
        margin: "0 8px"
    };

    const navLinks = [
        { name: "People", path: "/people" },
        { name: "News", path: "/news" },
        { name: "Funding", path: "/funding" },
        { name: "Citation", path: "/citation" },
        { name: "Terms", path: "/terms" },
        { name: "Contact", path: "/contact" },
        { name: "Download", path: "/download" },
    ];

    return (
        <>
            <Divider
                sx={{
                    marginTop: 3,
                    marginBottom: 7,
                    marginLeft: 1,
                    marginRight: 1,
                    backgroundColor: "white",
                }}
            />

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 2,
                    mb: 0,
                    position: "relative", // Ensures it stays in the flow
                    zIndex: 10,           // Brings links to the front
                    pointerEvents: "auto", // Explicitly allows clicks
                }}
            >
                <img src={image} alt="CatMapper Logo" style={{ height: "7vh" }} />

                <Box>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            component={RouterLink}
                            to={link.path}
                            id="catmapperfooter"
                            sx={linkStyle}
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