import React, { useState } from 'react'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider,Select,TextField,MenuItem,InputLabel} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DatasetForm from './uploadtranslateform';

const UploadTranslat = () => {

  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    datasetCMID: '',
    cmNameColumn: '',
    categoryNamesColumn: '',
    alternateCategoryNamesColumn: '',
    cmidColumn: '',
    keyColumn: '',
  });
  const [CMIDText, setCMIDText] = useState('The new dataset CMID is pending.');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setShowFields(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setCMIDText("The new and created CMID is 007. Save it for further reference.");
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3 }} style={{marginBottom:"50px"}}>
        <Button variant="contained" color="primary"  onClick={handleOpen}>
          CREATE NEW DATASET
        </Button>
        <Typography variant="body2" color="textSecondary" sx={{backgroundColor: 'lightblue', padding: '1em',borderRadius: '4px',display: 'inline-block',marginLeft:"10px"}}>
          {CMIDText}
        </Typography>
      </Box>
      <Typography variant="h6" style={{fontWeight:"bolder"}}>
        Use translated file or import file to upload
        </Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ mb: 2 }}>

      <Button
        variant="outlined"
        component="label"
        startIcon={<CloudUploadIcon />}
        
        sx={{ mt: 2, mb: 1 }}
      >
        BROWSE...
        <input type="file" accept=".xls,.xlsx" hidden onChange={handleFileChange} />
      </Button>
      </Box>
      {showFields && <Typography variant="body2">Number of nodes to import:</Typography>}
      <FormControlLabel
        control={<Checkbox name="viewUploadedData" />}
        label="View uploaded data?"
        sx={{ my: 2 }}
      />
      <RadioGroup defaultValue="standard" name="uploadOption" sx={{ mb: 2 }}>
        <FormControlLabel value="standard" control={<Radio />} label="Standard" />
        <FormControlLabel value="advanced" control={<Radio />} label="Advanced" />
      </RadioGroup>

      {showFields && (
        <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 2 }}>
          <InputLabel id="domain-label">Please select the domain of categories to be uploaded</InputLabel>
          <Select
            labelId="domain-label"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            
            margin="normal"
          >
            <MenuItem value="ADM4">ADM4</MenuItem>
            {/* Add more options as needed */}
          </Select>
          </Box>
          <Box sx={{ mb: 2 }}>
          <TextField
            label="Enter the Dataset CMID"
            name="datasetCMID"
            value={formData.datasetCMID}
            onChange={handleChange}
            variant="outlined"
            
            margin="normal"
          />
          </Box>
          <Box sx={{ mb: 2 }}>
          <TextField
            label="Choose which column is the CMName of the new or existing node/category"
            name="cmNameColumn"
            value={formData.cmNameColumn}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
          />
           </Box>
           <Box sx={{ mb: 2 }}>
          <TextField
            label="Choose which column(s) contain the category names from the dataset"
            name="categoryNamesColumn"
            value={formData.categoryNamesColumn}
            onChange={handleChange}
            variant="outlined"
          
            margin="normal"
          />
           </Box>
           <Box sx={{ mb: 2 }}>
          <TextField
            label="Choose which column(s) contain the alternate category names from the dataset"
            name="alternateCategoryNamesColumn"
            value={formData.alternateCategoryNamesColumn}
            onChange={handleChange}
            variant="outlined"
            
            margin="normal"
          />
            </Box>
            <Box sx={{ mb: 2 }}>
          <TextField
            label="Choose which column is the CMID of the node/category"
            name="cmidColumn"
            value={formData.cmidColumn}
            onChange={handleChange}
            variant="outlined"
            
            margin="normal"
          />
           </Box>
           <Box sx={{ mb: 2 }}>
          <TextField
            label="Choose which column is the key (unique ID) of the node/category"
            name="keyColumn"
            value={formData.keyColumn}
            onChange={handleChange}
            variant="outlined"
            
            margin="normal"
          />
        </Box>
        </Box>
      )}
      <Button variant="contained" color="primary"  onClick={handleSubmit}>
        UPLOAD
      </Button>
      <DatasetForm open={open} handleClose={handleClose} />
    </Box>
  );
}

export default UploadTranslat;