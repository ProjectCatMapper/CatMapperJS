import React, { useState, useEffect } from 'react';
import { Box, Tooltip, Button, Select, MenuItem } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export default function DomainSelector({ database, orientation = 'vertical', domain, setdomain }) {
    const [domainsData, setDomainsData] = useState([]);
    const [domainOptions, setDomainOptions] = useState([]);
    const [subdomainOptions, setSubdomainOptions] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [selectedSubdomain, setSelectedSubdomain] = useState(domain || '');

    // Fetch domains once database is ready
    useEffect(() => {
        if (!database) return;

        const getDomains = async () => {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/getDomains/${database}`);
            const data = await response.json();
            setDomainsData(data);

            const uniqueDomains = [
                ...new Map(
                    data
                        .filter(item =>
                            item.display !== 'ALL NODES' &&
                            item.display !== 'ANY DOMAIN' &&
                            item.display !== 'DATASETS'
                        )
                        .sort((a, b) => a.order - b.order)
                        .map(item => [item.display, item])
                ).values()
            ].map(item => item.display);

            setDomainOptions(uniqueDomains);
        };
        getDomains();
    }, [database]);

    // Update subdomains when domain changes
    useEffect(() => {
        if (!selectedDomain) {
            setSubdomainOptions([]);
            return;
        }

        const relatedSubdomains = domainsData
            .filter(item => item.display === selectedDomain)
            .map(item => item.subdisplay);

        const uniqueSubdomains = [...new Set(relatedSubdomains)];
        setSubdomainOptions(uniqueSubdomains);

        // Auto-set when only one subdomain exists
        if (uniqueSubdomains.length === 1) {
            const onlySub = uniqueSubdomains[0];
            const match = domainsData.find(item => item.subdisplay === onlySub);
            if (match) {
                setdomain(match.subdomain);
                setSelectedSubdomain(onlySub);
            }
        }
    }, [selectedDomain, domainsData, setdomain]);

    // Handlers
    const handleDomainChange = (event) => {
        const value = event.target.value;
        setSelectedDomain(value);
        setSelectedSubdomain('');
    };

    const handleSubdomainChange = (event) => {
        const selectedDisplay = event.target.value;
        const match = domainsData.find(item => item.subdisplay === selectedDisplay);

        if (match) setdomain(match.subdomain);
        else setdomain(selectedDisplay);

        setSelectedSubdomain(selectedDisplay);
    };

    const tooltipDomain = (
        <div style={{ maxWidth: '400px' }}>
            <h3>From which category domain do you want to find matches?</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Domain</th>
                        <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {domainsData.map((category, index) => (
                        <tr key={index}>
                            <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.display}</td>
                            <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{category.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const tooltipSubdomain = (
        <div style={{ maxWidth: '400px' }}>
            <h3>From which category sub-domain do you want to find matches?</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Sub-domain</th>
                        <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {domainsData
                        .filter(item => item.display === selectedDomain)
                        .map((category, index) => (
                            <tr key={index}>
                                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                    {category.subdisplay}
                                </td>
                                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                    {category.description}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );


    // Render
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: orientation === 'horizontal' ? 'row' : 'column',
                alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
                gap: 2
            }}
        >
            {/* Domain selector */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ color: 'white', fontWeight: 'bold', marginLeft: 7, padding: '2px' }}>
                    Select category domain
                </p>
                <Tooltip title={tooltipDomain} arrow>
                    <Button
                        startIcon={
                            <InfoIcon sx={{ height: "28px", width: "28px" }} />
                        }
                    ></Button>
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

            {/* Show subdomain selector only if more than one option */}
            {subdomainOptions.length > 1 && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ color: 'white', fontWeight: 'bold', marginLeft: 7, padding: '2px' }}>
                            Select category sub-domain
                        </p>
                        <Tooltip title={tooltipSubdomain} arrow>
                            <Button
                                startIcon={
                                    <InfoIcon sx={{ height: "28px", width: "28px" }} />
                                }
                            ></Button>
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
