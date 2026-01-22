import React, { useState } from 'react';
import { Box, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const DatasetForm = ({ open, handleClose, onFormSubmit }) => {
  const [formData, setFormData] = useState({
    CMName: '',
    shortName: '',
    project: '',
    parent: '',
    ApplicableYears: '',
    DatasetCitation: '',
    District: '',
    Subnational: '',
    Unit: '',
    DatasetLocation: '',
    DatasetVersion: '',
    Note: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      onFormSubmit(result.text); // assuming the API returns the text in a "text" field
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Dataset</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.keys(formData).map((key) => (
            <TextField
              key={key}
              label={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatasetForm;
