import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Paper, Grid, CircularProgress, Alert } from "@mui/material";
import { useParams } from 'react-router-dom'
import { useAuth } from './AuthContext';

const DynamicPropertiesForm = () => {
    const { cmid } = useParams();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authLevel } = useAuth();

    useEffect(() => {
        if (authLevel !== 2) {
            // Set the error state so the user sees the message
            setError("Not authorized to edit metadata.");
            setLoading(false); // Stop the spinner
            return; // <--- STOP here. Don't return the string itself.
        }
        if (!cmid) return;

        setLoading(true);

        fetch(`${process.env.REACT_APP_API_URL}/metadata/node/${cmid}`)
            .then((res) => {
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                // 1. Ensure it's an array
                const rawArray = Array.isArray(data) ? data : (data.results || []);

                // 2. TRANSFORM THE DATA
                // The API returns: [ { SocioMap: { ...data } }, { ArchaMap: { ...data } } ]
                // We need: [ { database: "SocioMap", ...data }, { database: "ArchaMap", ...data } ]
                const processedData = rawArray.map(item => {
                    // Get the first key (e.g., "SocioMap")
                    const dbName = Object.keys(item)[0];
                    // Get the actual node data inside that key
                    const nodeData = item[dbName];

                    return {
                        database: dbName, // Save the key as a string for the title
                        ...nodeData       // Spread the rest of the data (id, properties, etc.)
                    };
                });

                console.log("Processed Form Data:", processedData); // Debugging check
                setFormData(processedData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading node data:", err);
                setLoading(false);
                setError(err.message);
            });
    }, [authLevel, cmid]);

    const handleChange = (itemIndex, key, value) => {
        const updatedData = [...formData];
        updatedData[itemIndex].properties = {
            ...updatedData[itemIndex].properties,
            [key]: value,
        };
        setFormData(updatedData);
    };

    const handleSave = async () => {
        // Optional: Prevent saving if data is missing
        if (!formData) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/saveMetadata`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            // Success feedback
            alert(result.message || "Changes saved successfully!");
            console.log("Save result:", result);

        } catch (err) {
            console.error("Failed to save metadata:", err);
            alert("Error saving changes. Please try again.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Error loading data: {error}</Alert>
            </Box>
        );
    }

    if (!formData || formData.length === 0) {
        return <Box sx={{ p: 3 }}>No data found for this Node ID.</Box>;
    }

    return (
        <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
            <Typography variant="h4" gutterBottom>
                Edit Node Properties
            </Typography>

            {formData.map((item, index) => (
                <Paper
                    key={item.id || index}
                    elevation={3}
                    sx={{ p: 3, mb: 4, borderRadius: 2 }}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", borderBottom: "1px solid #ddd", pb: 1, mb: 2, color: "#1976d2" }}
                    >
                        {item.database || "Unknown Database"}
                        <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
                            ({item.id})
                        </span>
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Safely map over properties */}
                        {item.properties && Object.entries(item.properties).map(([key, value]) => {
                            // Handle arrays (like 'log') safely
                            const displayValue = Array.isArray(value) ? JSON.stringify(value) : value;

                            return (
                                <Grid item xs={12} sm={6} md={4} key={key}>
                                    <TextField
                                        fullWidth
                                        label={key}
                                        value={displayValue || ""}
                                        onChange={(e) => handleChange(index, key, e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        multiline={String(displayValue).length > 50}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                </Paper>
            ))}

            <Button variant="contained" color="primary" size="large" onClick={handleSave} sx={{ mt: 2 }}>
                Save Changes
            </Button>
        </Box>
    );
};

export default DynamicPropertiesForm;
