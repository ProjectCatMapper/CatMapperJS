import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';

const DownloadDatasetButton = ({ databaseName = "sociomap", fileName = "dataset_list.xlsx" }) => {
    const [loading, setLoading] = useState(false);

    const handleButtonClick = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/allDatasets?database=${databaseName}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            const { downloadJsonAsXlsx } = await import('../utils/excelExport');
            await downloadJsonAsXlsx(data, {
                fileName,
                sheetName: 'Sheet1',
            });
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="contained"
            size="small"
            disabled={loading} // Prevent double-clicks
            sx={{
                backgroundColor: "blue",
                color: "white",
                "&:hover": { backgroundColor: "green" },
                fontSize: "1rem",
                lineHeight: 1,
                px: 1,
                py: 0.5,
                textTransform: 'none',
                minWidth: '135px' // Keeps button width stable when spinner appears
            }}
            onClick={handleButtonClick}
            startIcon={loading ? <CircularProgress size={12} color="inherit" /> : null}
        >
            {loading ? "Downloading..." : "Download datasets list"}
        </Button>
    );
};

export default DownloadDatasetButton;
