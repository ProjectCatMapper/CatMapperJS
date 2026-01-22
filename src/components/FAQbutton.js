import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const FAQButton = ({ title = "Description" }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography
                sx={{ fontSize: 20, mr: 2, fontWeight: 'bold' }}
                color="#fff !important"
            >
                {title}
            </Typography>

            <Button
                component={RouterLink}
                to="/FAQ"
                variant="contained"
                size="small"
                startIcon={<HelpOutlineIcon />}
                sx={{
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    padding: '4px 12px',
                    borderRadius: '20px', // Pill shape for a professional look
                    '&:hover': {
                        backgroundColor: '#115293',
                        color: '#fff !important',
                    },
                }}
            >
                FAQ
            </Button>
        </Box>
    );
};

export default FAQButton;