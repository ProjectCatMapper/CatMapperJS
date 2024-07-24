import React, { useState } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider,TextField,Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadTranslat = () => {

    const [open, setOpen] = useState(false);
    const [CMIDText, setCMIDText] = useState('The new dataset CMID is pending');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFormSubmit = (text) => {
    setCMIDText(text);
  };

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

    return ( <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button variant="contained" color="primary" fullWidth onClick={handleOpen}>
            CREATE NEW DATASET
          </Button>
          <Typography variant="body2" color="textSecondary">
            {CMIDText}
          </Typography>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6">
          Use translated file or import file to upload
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ mt: 2, mb: 1 }}
        >
          BROWSE...
          <input type="file" accept=".xls,.xlsx" hidden />
        </Button>
        <FormControlLabel
          control={<Checkbox name="viewUploadedData" />}
          label="View uploaded data?"
          sx={{ my: 2 }}
        />
        <RadioGroup defaultValue="standard" name="uploadOption" sx={{ mb: 2 }}>
          <FormControlLabel value="standard" control={<Radio />} label="Standard" />
          <FormControlLabel value="advanced" control={<Radio />} label="Advanced" />
        </RadioGroup>
        <Button variant="contained" color="primary" fullWidth>
          UPLOAD
        </Button>
  
        <DatasetForm open={open} handleClose={handleClose} onFormSubmit={handleFormSubmit} />
      </Box>   )
}

export default UploadTranslat;