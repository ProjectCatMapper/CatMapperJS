import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, CircularProgress, Alert } from '@mui/material';

const LogsViewer = () => {
    const { database, cmid } = useParams();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hardcoded based on your route path "/sociomap/..."
    const DATABASE_NAME = "sociomap";

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                // 3. Use the dynamic variable in the fetch string
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/logs/${database}/${cmid}`
                );

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Handle different response structures ( {logs: []} vs [] )
                const cleanLogs = data.logs || data;

                if (Array.isArray(cleanLogs)) {
                    setLogs(cleanLogs);
                } else {
                    setLogs([]); // Fallback if data is weird
                    console.error("API did not return an array", data);
                }

            } catch (err) {
                console.error("Failed to fetch logs:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (cmid) {
            fetchLogs();
        }
    }, [cmid]);

    // --- Helper: Format the "Action" text with colors ---
    const renderActionText = (text) => {
        if (!text) return "";
        // Split on "key:" or "str(...)" to color them
        const parts = text.split(/(str\([^)]+\)|[a-zA-Z0-9]+:)/g);
        return parts.map((part, i) => {
            if (part.match(/^[a-zA-Z0-9]+:$/)) {
                return <span key={i} style={{ color: '#e67e22', fontWeight: 'bold' }}>{part}</span>;
            } else if (part.startsWith('str(')) {
                return <span key={i} style={{ color: '#27ae60' }}>{part.replace('str(', '"').replace(')', '"')}</span>;
            }
            return part;
        });
    };

    // --- Helper: Download Raw JSON ---
    const handleDownloadRaw = () => {
        const jsonString = JSON.stringify({ logs: logs }, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `logs_${DATABASE_NAME}_${cmid}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 20 }}>
                <Alert severity="error">Failed to load logs: {error}</Alert>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f4f4f9', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{
                background: 'white', padding: '20px', borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: 0 }}>System Logs</h2>
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: 5 }}>
                        Database: <b>{DATABASE_NAME}</b> | ID: <b>{cmid}</b>
                    </div>
                </div>
                <Button variant="contained" onClick={handleDownloadRaw}>
                    Download JSON
                </Button>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#2c3e50', color: 'white' }}>
                        <tr>
                            <th style={styles.th}>Time</th>
                            <th style={styles.th}>User</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Action Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: 20, textAlign: 'center' }}>No logs found.</td></tr>
                        ) : (
                            logs.map((log, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #ddd', background: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                    <td style={{ ...styles.td, whiteSpace: 'nowrap', color: '#666', fontSize: '0.85em' }}>
                                        {new Date(log.timestamp).toLocaleDateString()} <br />
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold' }}>{log.user}</td>
                                    <td style={{ ...styles.td, color: '#2980b9', fontWeight: '600', fontSize: '0.9em' }}>
                                        {log.log_type ? log.log_type.split(':')[0] : 'Unknown'}
                                    </td>
                                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.9em' }}>
                                        {renderActionText(log.action)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    th: { padding: '12px 15px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '12px 15px', verticalAlign: 'top' }
};

export default LogsViewer;