import React, { useState, useEffect } from 'react';
import { Box, Tooltip, Button, Select, MenuItem } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export default function DomainSelector({ database, orientation = 'vertical', domain, setdomain }) {
    console.log("database in DomainSelector:", database);
    const [domainsData, setDomainsData] = useState([]);          // raw API response
    const [domainOptions, setDomainOptions] = useState([]);      // unique domains
    const [subdomainOptions, setSubdomainOptions] = useState([]); // dynamic subdomains
    const [selectedDomain, setSelectedDomain] = useState('');    // local selected domain
    const [selectedSubdomain, setSelectedSubdomain] = useState(domain || '');

    // --- Fetch domains on mount ---
    useEffect(() => {
        if (!database) return;
        const getDomains = async () => {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/getDomains/${database}`);
            const data = await response.json();
            setDomainsData(data);

            // Extract unique domain names
            const uniqueDomains = [
                ...new Map(
                    data
                        .filter(item => item.display !== 'ALL NODES' && item.display !== 'ANY DOMAIN' && item.display !== 'DATASETS') // remove unwanted
                        .sort((a, b) => a.order - b.order) // sort numerically
                        .map(item => [item.display, item]) // deduplicate by display
                ).values()
            ].map(item => item.display);

            setDomainOptions(uniqueDomains);

        };
        getDomains();
    }, [database]);

    // --- Update subdomains when a domain is selected ---
    useEffect(() => {
        if (!selectedDomain) {
            setSubdomainOptions([]);
            return;
        }

        const relatedSubdomains = domainsData
            .filter(item => item.display === selectedDomain)
            .map(item => item.subdisplay);

        // Deduplicate subdomains
        const uniqueSubdomains = [...new Set(relatedSubdomains)];
        setSubdomainOptions(uniqueSubdomains);
    }, [selectedDomain, domainsData]);

    // --- Handlers ---
    const handleDomainChange = (event) => {
        setSelectedDomain(event.target.value);
        setSelectedSubdomain(event.target.value);
    };

    const handleSubdomainChange = (event) => {
        const selectedDisplay = event.target.value;

        // Find matching object in domainsData
        const match = domainsData.find(
            (item) => item.subdisplay === selectedDisplay
        );


        // If found, set the true subdomain key; otherwise use the display value
        if (match) {
            setdomain(match.subdomain);
        } else {
            setdomain(selectedDisplay);
        }
        setSelectedSubdomain(selectedDisplay);
    };

    // --- Render ---
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: orientation === 'horizontal' ? 'row' : 'column',
                alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
                gap: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ color: 'white', fontWeight: 'bold', marginLeft: 7, padding: '2px' }}>
                    Select category domain
                </p>
                <Tooltip title="Select the main category domain" arrow>
                    <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                </Tooltip>
            </Box>

            <Select
                label="Category Domain"
                value={selectedDomain}
                style={{ height: 40 }}
                sx={{ m: 1, width: '12vw' }}
                onChange={handleDomainChange}
            >
                {domainOptions.map((domain, index) => (
                    <MenuItem key={index} value={domain}>
                        {domain}
                    </MenuItem>
                ))}
            </Select>

            {subdomainOptions.length > 0 && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ color: 'white', fontWeight: 'bold', marginLeft: 7, padding: '2px' }}>
                            Select category sub-domain
                        </p>
                        <Tooltip title="Select a sub-domain within the chosen category" arrow>
                            <Button startIcon={<InfoIcon sx={{ height: '28px', width: '28px' }} />} />
                        </Tooltip>
                    </Box>

                    <Select
                        label="Category Subdomain"
                        value={selectedSubdomain}
                        style={{ height: 40 }}
                        sx={{ m: 1, width: '12vw' }}
                        onChange={handleSubdomainChange}
                    >
                        {subdomainOptions.map((subdomain, index) => (
                            <MenuItem key={index} value={subdomain}>
                                {subdomain}
                            </MenuItem>
                        ))}
                    </Select>
                </>
            )}
        </Box>
    );
}