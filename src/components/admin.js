import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Radio,
  RadioGroup,
  Checkbox,
  Typography,
  Divider,
  Select,
  TextField,
  MenuItem,
  InputLabel,
  Paper,
  Dialog,
  DialogContent,
  ListSubheader,
  FormControlLabel,
} from "@mui/material";
import { useAuth } from './AuthContext';
import { DataGrid } from '@mui/x-data-grid';


const Admin = () => {
  const [firstDropdownValue, setFirstDropdownValue] = useState(
    "add/edit/delete USES property"
  );
  const { user,cred,authLevel} = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [CMIDText, setCMIDText] = useState('');


  const sections = [
    {
      label: "Database Options",
      keys: [
        "add/edit/delete USES property",
        "add/edit/delete node property",
        "merge nodes",
        "move USES tie",
        "add credible comment",
        "delete node",
        "delete USES relation",
        "create new label",
        "add foci",
      ],
    },
    {
      label: "User Options",
      keys: ["create new user", "change user password"],
    },
    {
      label: "Database Checks",
      keys: [
        "CSV database backup",
        "duplicate relations",
        "duplicate keys",
        "get database schema",
        "find numeric names",
        "fix USES defined relationships",
        "missing names",
      ],
    },
  ];

  const menuItems = sections
    .flatMap((section, index) => [
      index > 0 ? <Divider key={`divider-${section.label}`} /> : null,
      <ListSubheader
        key={`header-${section.label}`}
        disableGutters
        sx={{
          fontWeight: "bold",
          color: "text.primary",
          fontSize: "medium",
          marginLeft: "10px",
        }}
      >
        {section.label}
      </ListSubheader>,
      ...section.keys.map((key, idx) => (
        <MenuItem key={key} value={key}>
          {key}
        </MenuItem>
      )),
    ])
    .filter(Boolean);

  const handleSubmit = async () => {
    try {
      const response = await fetch("YOUR_API_ENDPOINT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(firstDropdownValue),
      });

      const result = await response.json();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleCheck = async () => {
    try {
      console.log(cred)
      const response = await fetch("https://catmapper.org/api/updateNewUsers",{
      //const response = await fetch("http://127.0.0.1:5001/updateNewUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid : "none",
          database : "sociomap",
          credentials: cred,
          process : "None",
        }),
      });

      const result = await response.json();
      setUsers(result)
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch("https://catmapper.org/api/updateNewUsers",{
      //const response = await fetch("http://127.0.0.1:5001/updateNewUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid : selectedUserIds,
          database : "sociomap",
          credentials: cred,
          process : "approve",
        }),
      });

      const result = await response.json();
      if (result)
      {
      setCMIDText("Approved");
      setPopen(true);
      }      
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [popen, setPopen] = useState(false);

  const handlePclose = () => {
    setPopen(false);
  };

  const [formData, setFormData] = useState({
    s1_1: "standard",  // radio
    s1_2: "",          // textfield
    s1_3: "",          //textfield
    s1_4: "",          //textfield
    s1_5: "",          //textfield
    s1_6: "",          //textfield
    s1_7: ""           //dropdown
  });

  const columns = [
    { field: 'userid', headerName: 'User ID', width: 150 },
    { field: 'first', headerName: 'First Name', width: 150 },
    { field: 'last', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'intendedUse', headerName: 'Intended Use', width: 200 },
  ];

  const handleSelectionChange = (newSelectionModel) => {
    setSelectedUserIds(newSelectionModel);
    console.log(selectedUserIds)
  };

  const handleRadioChange = (event) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      s1_1: event.target.value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 1 }}>
        <h4 style={{ color: "black", padding: "2px", fontSize: "larger" }}>
          Admin panel: these functions are intended for admin users to identify
          and fix problems in the database, add and modify users, and to
          initiate database integrity checks
        </h4>
        <br />
        <p
          style={{
            color: "White",
            fontWeight: "bold",
            marginLeft: 7,
            padding: "2px",
          }}
        >
          Select category domain
        </p>
        <Select
          label="First Dropdown"
          value={firstDropdownValue}
          style={{ height: 40 }}
          sx={{ m: 1, width: 300 }}
          onChange={(event) => setFirstDropdownValue(event.target.value)}
        >
          {menuItems}
        </Select>
      </Box>

      {firstDropdownValue === "add/edit/delete USES property" && (
        <Box sx={{ ml: 1 }}>
          <h4 style={{ color: "black", padding: "2px" }}>
            choose to add a new property or edit <br /> or delete an existing
            property :
          </h4>
          <RadioGroup
            defaultValue="add"
            name="uploadOption"
            sx={{ mb: 2 }}
            value={formData.s1_1}
            onChange={handleRadioChange}
          >
            <FormControlLabel value="add" control={<Radio />} label="add" />
            <FormControlLabel value="edit" control={<Radio />} label="edit" />
            <FormControlLabel
              value="delete"
              control={<Radio />}
              label="delete"
            />
          </RadioGroup>
          <InputLabel id="domain-label" style={{ color: "black " }}>
            CMID of Category
          </InputLabel>
          <TextField
            name="s1_2"
            value={formData.s1_2}
            onChange={handleChange}
            sx={{ width: 300, height: 40, mb : 3 }}
            variant="outlined"
            margin="normal"
          />
          <InputLabel id="domain-label" style={{ color: "black " }}>
            Property value ( use ' || ' to split values)
          </InputLabel>
          <TextField
            name="s1_3"
            value={formData.s1_3}
            onChange={handleChange}
            sx={{ width: 300, height: 40, mb: 4 }}
            variant="outlined"
            margin="normal"
          />
        </Box>
      )}

{firstDropdownValue === "add/edit/delete node property" && (
  <Box sx={{ ml: 1 }}>
  <h4 style={{ color: "black", padding: "2px" }}>
    choose to add a new property or edit <br /> or delete an existing
    property :
  </h4>
  <RadioGroup
    defaultValue="add"
    name="uploadOption"
    sx={{ mb: 2 }}
    value={formData.s1_1}
    onChange={handleRadioChange}
  >
    <FormControlLabel value="add" control={<Radio />} label="add" />
    <FormControlLabel value="edit" control={<Radio />} label="edit" />
    <FormControlLabel
      value="delete"
      control={<Radio />}
      label="delete"
    />
  </RadioGroup>
  <InputLabel id="domain-label" style={{ color: "black " }}>
    CMID of Node
  </InputLabel>
  <TextField
    name="s1_2"
    value={formData.s1_2}
    onChange={handleChange}
    sx={{ width: 300, height: 40, mb : 3 }}
    variant="outlined"
    margin="normal"
  />
  <InputLabel id="domain-label" style={{ color: "black " }}>
    Property value
  </InputLabel>
  <TextField
    name="s1_3"
    value={formData.s1_3}
    onChange={handleChange}
    sx={{ width: 300, height: 40, mb: 4 }}
    variant="outlined"
    margin="normal"
  />
</Box>
)
}

{firstDropdownValue === "merge nodes" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
     ID to keep
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
     ID to discard
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb: 4 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "move USES tie" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
     CMID moving from
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
     CMID moving to
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb: 4 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "add credible comment" && (
   <Box sx={{ ml: 1 }}>
    <h4 style={{ color: "black", padding: "2px" }}>
    Is the value credible?
  </h4>
  <RadioGroup
    defaultValue="TRUE"
    name="uploadOption"
    sx={{ mb: 2 }}
    value={formData.s1_1}
    onChange={handleRadioChange}
  >
    <FormControlLabel value="TRUE" control={<Radio />} label="TRUE" />
    <FormControlLabel value="FALSE" control={<Radio />} label="FALSE" />
  </RadioGroup>
   <InputLabel id="domain-label" style={{ color: "black " }}>
   ID of node connected to relationship
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Reason why this comment is necessary
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb: 4 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "delete node" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
     CMID of node to delete
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "delete USES relation" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
     CMID of category
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "create new label" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
     Enter label name
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{color:"black "}}>Choose Group label (select 'NA' if it is a group label)</InputLabel>
          <br />
    <Select
            labelId="domain-label"
            id="domain"
            name="s1_7"
            value={formData.s1_7}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
          <MenuItem value={"NA"}>NA</MenuItem>
        <MenuItem value={"ANY DOMAIN"}>ANY DOMAIN</MenuItem>
        <MenuItem value={"DATASET"}>DATASET</MenuItem>
        <MenuItem value={"AREA"}>AREA</MenuItem>
        <MenuItem value={"ETHNICITY"}>ETHNICITY</MenuItem>
        <MenuItem value={"GENERIC"}>GENERIC</MenuItem>
        <MenuItem value={"LANGUOID"}>LANGUOID</MenuItem>
        <MenuItem value={"RELIGION"}>RELIGION</MenuItem>
        <MenuItem value={"USER"}>USER</MenuItem>
        <MenuItem value={"VARIABLE"}>VARIABLE</MenuItem>
    </Select>
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Enter contextual Relationship Name (usually 'LABEL_OF')
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Enter label description
   </InputLabel>
   <TextField
     name="s1_4"
     value={formData.s1_4}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 12 }}
     multiline 
    rows={4}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Enter display name
   </InputLabel>
   <TextField
     name="s1_5"
     value={formData.s1_5}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3,mt: 1 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Enter hex color for network display (leave blank for default color)
   </InputLabel>
   <TextField
     name="s1_6"
     value={formData.s1_6}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "add foci" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
   CMID of DATASET to add foci to
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   CMID of foci to add
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb: 4 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "create new user" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
username   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
first name   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
last name   </InputLabel>
   <TextField
     name="s1_4"
     value={formData.s1_4}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 12 }}
     multiline 
    rows={4}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
email   </InputLabel>
   <TextField
     name="s1_5"
     value={formData.s1_5}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3,mt: 1 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{color:"black "}}>Select role:</InputLabel>
          <br />
    <Select
            labelId="domain-label"
            id="domain"
            name="s1_7"
            value={formData.s1_7}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
          <MenuItem value={"user"}>user</MenuItem>
        <MenuItem value={"admin"}>admin</MenuItem>
    </Select>
   <InputLabel id="domain-label" style={{ color: "black " }}>
password   </InputLabel>
   <TextField
     name="s1_6"
     value={formData.s1_6}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "change user password" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
   username
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3 }}
     variant="outlined"
     margin="normal"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   new password
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb: 4 }}
     variant="outlined"
     margin="normal"
   />
 </Box>
)
}

{firstDropdownValue === "CSV database backup" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{color:"black "}}>Choose label</InputLabel>
          <br />
    <Select
            labelId="domain-label"
            id="domain"
            name="s1_7"
            value={formData.s1_7}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
        <MenuItem value={"ANY DOMAIN"}>ANY DOMAIN</MenuItem>
        <MenuItem value={"DATASET"}>DATASET</MenuItem>
        <MenuItem value={"AREA"}>AREA</MenuItem>
        <MenuItem value={"ETHNICITY"}>ETHNICITY</MenuItem>
        <MenuItem value={"GENERIC"}>GENERIC</MenuItem>
        <MenuItem value={"LANGUOID"}>LANGUOID</MenuItem>
        <MenuItem value={"RELIGION"}>RELIGION</MenuItem>
        <MenuItem value={"USER"}>USER</MenuItem>
        <MenuItem value={"VARIABLE"}>VARIABLE</MenuItem>
    </Select>
 </Box>
)
}

{firstDropdownValue === "fix USES defined relationships" && (
   <Box sx={{ ml: 1, mb : 1 }}>
   <InputLabel id="domain-label" style={{color:"black "}}>Choose label</InputLabel>
          <br />
    <Select
            labelId="domain-label"
            id="domain"
            name="s1_7"
            value={formData.s1_7}
            onChange={handleChange}
            sx={{width: 300,height:40 }}
            margin="normal"
          >
        <MenuItem value={"CONTAINS"}>CONTAINS</MenuItem>
        <MenuItem value={"DISTRICT_OF"}>DISTRICT_OF</MenuItem>
        <MenuItem value={"LANGUOID_OF"}>LANGUOID_OF</MenuItem>
        <MenuItem value={"RELIGION_OF"}>RELIGION_OF</MenuItem>

    </Select>
 </Box>
)
}

      <Button
        variant="contained"
        sx={{
          backgroundColor: "black",
          color: "white",
          "&:hover": {
            backgroundColor: "green",
          },
        }}
        onClick={handleSubmit}
      >
        Submit{" "}
      </Button>
      <Divider sx={{ my: 1 }} />
      <Typography variant="p">Check for new users and approve them:</Typography>
      <br/>
      <br/>
      <Button
        variant="contained"
        sx={{
          backgroundColor: "black",
          color: "white",
          "&:hover": {
            backgroundColor: "green",
          },
        }}
        onClick={handleCheck}
      >
        Check for new users{" "}
      </Button>
      {users.length > 0 && <DataGrid
        rows={users}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
        onRowSelectionModelChange={(newSelectionModel) => {
          handleSelectionChange(newSelectionModel);
        }}
        getRowId={(row) => row.userid}
      />
      }
      {
        selectedUserIds.length > 0 && <Button
        variant="contained"
        sx={{
          backgroundColor: "black",
          color: "white",
          "&:hover": {
            backgroundColor: "green",
          },
        }}
        onClick={handleApprove}
      >
        Approve users{" "}
      </Button>
      }
      <Dialog open={popen} onClose={handlePclose}>
        <DialogContent>
          <p>{CMIDText}</p>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Admin;
