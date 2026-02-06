import React from 'react';
import SocioMapHome from './HomeSocioMap';
import ArchaMapHome from "./HomeArchaMap";

const DynamicBody = ({ database }) => {

    // Assign the correct component to a capitalized variable
    const Body = database.toLowerCase() === "archamap" ? ArchaMapHome : SocioMapHome;

    return (
        <body className="body-container">
            <Body />
        </body>
    );
};

export default DynamicBody;