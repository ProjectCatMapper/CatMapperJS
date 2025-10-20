import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Radio,
  Modal,
  RadioGroup,
  Typography,
  Divider,
  Select,
  TextField,
  MenuItem,
  InputLabel,
  Dialog,
  DialogContent,
  ListSubheader,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { useAuth } from './AuthContext';
import { DataGrid } from '@mui/x-data-grid';
import image from '../assets/white.png'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import CircularProgress from "@mui/material/CircularProgress";

const Admin = () => {
  const [firstDropdownValue, setFirstDropdownValue] = useState(
    "add/edit/delete USES property"
  );
  const { user,cred,authLevel} = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [CMIDText, setCMIDText] = useState('');
  const [grouplabels, setgrouplabels] = useState(["NA"]);
  const [loading,setLoading] =  useState(false);
  const [open, setOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [ntableData, setnTableData] = useState([]);
  const [tableDropdownValues, setTableDropdownValues] = useState({});
  const [datasetID, setDatasetID] = useState('')

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  let database = "SocioMap"
  if (useLocation().pathname.includes("archamap")) {
        database = "ArchaMap"
      } 


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
        "create new domain",
        //"add foci",
      ],
    },
    {
      label: "User Options",
      keys: ["create new user", "change user password","approve new users"],
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
      console.log(ntableData)
      if (firstDropdownValue === "move USES tie"){
        handleClose();
      }
      setLoading(true);
      if (firstDropdownValue === "delete node") {
      const confirmed = window.confirm(
        `Are you sure you want to ${firstDropdownValue} of ${formData.s1_2}? This action cannot be undone.`
      );
      if (!confirmed) {
        return;
      }
    }

    if (firstDropdownValue === "delete USES relation") {
      const confirmed = window.confirm(
        `Are you sure you want to ${firstDropdownValue} of ${JSON.parse(formData.s1_7)[0].CMName} <- ${JSON.parse(formData.s1_7)[1].Key} - ${JSON.parse(formData.s1_7)[2].CMName}? This action cannot be undone.`
      );
      if (!confirmed) {
        return;
      }
    }

     const cleanedData = {
      ...formData,
      s1_2: formData.s1_2.trim(),
      s1_3: formData.s1_3.trim(),
    };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/edit`, {
      //const response = await fetch("http://127.0.0.1:5001/admin/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          database: database,
          cred: cred,
          fun: firstDropdownValue,
          input: cleanedData,
          tabledata: ntableData,
          datasetID: datasetID
        }),
      });

      const result = await response.text();
      if (!response.ok) {
        alert(result);
      } else {
        alert("Action completed");
      }

    } catch (error) {
      console.error("Error submitting form:", error);
    }
    finally {
      setLoading(false);
    };
  };

  const handleSubmitTable = async () => {
    try {
      handleClose();
      setLoading(true);

      const combinedData = tableData.map((row, idx) => {
      const optionA = tableDropdownValues[idx];

      // Throw error if any dropdown is empty
      if (optionA === "default") {
        alert(`Dropdown values missing for row ${idx + 1}`);
      }

      return {
        ...row,       // original table data columns
        optionA,      // first dropdown
      };
    });

    const cleanedData = {
      ...formData,
      s1_2: formData.s1_2.trim(),
      s1_3: formData.s1_3.trim(),
    };
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/edit`, {
      //const response = await fetch("http://127.0.0.1:5001/admin/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          database: database,
          cred: cred,
          fun: firstDropdownValue,
          input: cleanedData,
          tabledata: combinedData,
          datasetID: datasetID
        }),
      });

      const result = await response.text();
      alert("Action completed");

    } catch (error) {
      console.error("Error submitting form:", error);
    }
    finally {
      setLoading(false);
    };
  };

    const handleAmbiguousTies = async () => {
    try {
      setLoading(true);
      setTableData([])
    
      const response = await fetch(`${process.env.REACT_APP_API_URL}/check_ambiguous_usesties`, {
      //const response = await fetch("http://127.0.0.1:5001/check_ambiguous_usesties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          database: database,
          cred: cred,
          input: formData
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error);
      } else {
         setDatasetID(result.dataset)
      if (result.status === "False"){
        const updatedTableData = (result.child_USES_check || []).map(row => ({
          ...row,
          "optionA": "To"
        }));

        setnTableData(updatedTableData);
        handleOpen()
      }
      else{
        console.log("Ambiguity detected:", result)
        setTableData(result.child_USES_check)
        const initialDropdowns = {};
      (result.child_USES_check || []).forEach((row, idx) => {
        initialDropdowns[idx] = "default"; // default value
      });
      setTableDropdownValues(initialDropdowns);
      handleOpen();
      }
      }
    
    } catch (error) {
      console.error("Error submitting form:", error);
    }
    finally {
      setLoading(false);
    };
  };

  const handleCheck = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/updateNewUsers`,{
      //const response = await fetch("http://127.0.0.1:5001/updateNewUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid : "none",
          database : database,
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/updateNewUsers`,{
      //const response = await fetch("http://127.0.0.1:5001/updateNewUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid : selectedUserIds,
          database : database,
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
    s1_1: "edit",  // radio
    s1_2: "",          
    s1_3: "",          
    s1_4: "",          
    s1_5: "",          
    s1_6: "",          
    s1_7: "",           
    s1_8: ""            
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
  };

  const handleRadioChange = (event) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      s1_1: event.target.value
    }));
  };

   const handleDropdownChange = (idx, value) => {
    setTableDropdownValues((prev) => ({ ...prev, [idx]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleCancel = () => {
    handleClose();
  };

  const [add_edit_delete_Nodeprops_Options, setDropdownOptions] = useState([]);
  const [add_edit_delete_usesprops_Options, setDropdown1Options] = useState([]);
  const [add_edit_delete_usesprops_properties, setDropdown2Options] = useState([]);

  useEffect(() => {
  if (firstDropdownValue !== "add/edit/delete node property" && firstDropdownValue !== "delete node") {
    setDropdownOptions([]); // reset dropdown if not in this mode
    return;
  }

  const cmid = formData.s1_2.trim();
  const pattern = /^(AM|CP|CL|SM|AD|SD)\d+$/;

  if (pattern.test(cmid)) {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/admin_add_edit_delete_nodeproperties?CMID=`+cmid+"&database="+database,{
      //const res = await fetch("http://127.0.0.1:5001/admin_add_edit_delete_nodeproperties?CMID="+cmid+"&database="+database, {
      method: "GET",
        });
        const data = await res.json();

        if (data.error){
          alert("An error occurred: " + data.error);
          return;
        }

        if (firstDropdownValue === "delete node")
        {
          formData.s1_7 = data.r["CMName"]
          console.log(formData.s1_7)
          return;
        }

        if (formData.s1_1 === "add") {
          setDropdownOptions(data.r1);
        } else if (formData.s1_1 === "edit" || formData.s1_1 === "delete") {
          setDropdownOptions(data.r);
        }

        
      } catch (err) {
        setDropdownOptions([]); // reset on error
      }
    };
    fetchData();
  } else {
    setDropdownOptions([]); // reset dropdown if input does not match
  }
}, [formData.s1_1,formData.s1_2, firstDropdownValue]);

  useEffect(() => {
  if (firstDropdownValue !== "add/edit/delete USES property" && firstDropdownValue !== "delete USES relation" && firstDropdownValue !== "move USES tie") {
    setDropdown1Options([]); // reset dropdown if not in this mode
    return;
  }

  setDropdown1Options([])
  setFormData(prevFormData => ({
          ...prevFormData,
          s1_7: ""
        }));

  const cmid = formData.s1_2.trim();
  const pattern = /^(AM|SM|AD|SD)\d+$/;

  if (pattern.test(cmid)) {
    const fetchData = async () => {
      try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin_add_edit_delete_usesproperties?CMID=`+cmid+"&database="+database,{
      //const res = await fetch("http://127.0.0.1:5001/admin_add_edit_delete_usesproperties?CMID="+cmid+"&database="+database, {
      method: "GET",
        });
        const data = await res.json();

        if (data.error){
          alert("An error occurred: " + data.error);
          return;
        }
       
        setDropdown1Options(data.r);
        setFormData(prevFormData => ({
          ...prevFormData,
          s1_4: data.r
        }));
        setDropdown2Options(data.r1)
  
      } catch (err) {
        setDropdown1Options([]); // reset on error
      }
    };
    fetchData();
  } else {
    setDropdown1Options([]); // reset dropdown if input does not match
  }
}, [formData.s1_1,formData.s1_2, firstDropdownValue]);

useEffect(() => {
    const createLabel = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/create_label_helper?database=`+database,{
      //const res = await fetch("http://127.0.0.1:5001/create_label_helper?&database="+database, {
          method: 'GET',
                 
        });

        const data = await res.json();
        
        setgrouplabels(data.res)

      } catch (error) {
        console.error('Error creating label:', error);
      }
    };

    if (firstDropdownValue === 'create new domain') {
      createLabel();
    }
  }, [firstDropdownValue]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    <Box sx={{ p: 4,flex: 1, display: 'flex',flexDirection: 'column',bgcolor:"white"}}>
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
          Select option
        </p>
        <Select
          label="First Dropdown"
          value={firstDropdownValue}
          style={{ height: 40 }}
          sx={{ m: 1, width: 300 }}
          onChange={(event) => {
            setFirstDropdownValue(event.target.value);
            setFormData({
            s1_1: "edit",  
            s1_2: "",     
            s1_3: "",     
            s1_4: "",     
            s1_5: "",
            s1_6: "",      
            s1_7: "",     
            s1_8: ""     
          });}
          }
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
            row
            defaultValue="edit"
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
            sx={{ width: 300, height: 22 ,mt:0, mb : 5, fontSize: 12  }}
            variant="outlined"
            margin="normal"
            size="small"
          />
          {add_edit_delete_usesprops_Options !== "" &&
              <>
                <InputLabel id="api-results-label" style={{ color: "black" }}>
                  Choose USES tie to change
                </InputLabel>
                <Select
                  name="s1_7"
                  sx={{ width: 300, height: 40, mb: 3 }}
                  value={formData.s1_7 || ""}
                  onChange={handleChange}
                >
                  {add_edit_delete_usesprops_Options.map(([n, r, d], index) => (
                    <MenuItem key={index} value={index+1}>
                      {`${n.CMName} ---- USES Key: ${r.Key} --- ${d.CMName}`}
                    </MenuItem>
                  ))}
                </Select>
              </>
            }

            {formData.s1_7 !== "" && add_edit_delete_usesprops_Options.length !== 0 && (
                <>
                  {(() => {
                    const [n, r, d] = add_edit_delete_usesprops_Options[formData.s1_7-1];
                    let dropdown2Options = [];

                    if (formData.s1_1 === "edit" || formData.s1_1 === "delete") {
                      dropdown2Options = Object.keys(r);
                      if (formData.s1_1 === "edit") {
                        dropdown2Options = dropdown2Options.filter(key => key !== "logID" && key !== "log");
                      }

                      if (formData.s1_1 === "delete") {
                        dropdown2Options = dropdown2Options.filter(key => key !== "logID" && key !== "Key" && key !== "Name" && key !== "label" && key !== "log");
                      }
                    } else {
                      const rKeys = Object.keys(r);
                      dropdown2Options = add_edit_delete_usesprops_properties.filter(
                        (prop) => !rKeys.includes(prop)
                      );
                    }

                    return (
                      dropdown2Options.length !== 0 && (
                        <>
                          <InputLabel id="dropdown2-label" style={{ color: "black" }}>
                            Choose property to {formData.s1_1}
                          </InputLabel>
                          <Select
                            name="s1_8"
                            sx={{ width: 300, height: 40, mb: 3 }}
                            value={formData.s1_8 || ""}
                            onChange={handleChange}
                          >
                            {[...dropdown2Options].filter(option => option.toLowerCase() !== "id").sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
                              .map((option, index) => (
                              <MenuItem key={index} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>

                          <Typography variant="body1" sx={{ mb: 1 }}>
                            Selected:
                          {(() => {
                            const value = add_edit_delete_usesprops_Options?.[formData.s1_7 - 1]?.[1]?.[formData.s1_8];

                            if (Array.isArray(value)) {
                              return ' ' + value
                                .map(item => {
                                  if (typeof item === 'string') return item;
                                  else if (typeof item === 'object' && item !== null) {
                                    return item.label ?? JSON.stringify(item);
                                  }
                                  return String(item);
                                })
                                .join(' || ');
                            }

                            else if (typeof value === 'string') {
                              //return ' ' + value.replace(/,/g, '||');
                              return value;
                            }

                            return ' N/A';
                          })()}
                          </Typography>
                        </>
                      )
                    );
                  })()}
                </>
              )}
          {(formData.s1_1 === "add" || formData.s1_1 === "edit") &&  (
            <>
          <InputLabel id="domain-label" style={{ color: "black " }}>
            Property value ( use ' || ' to split values)
          </InputLabel>
          <TextField
            name="s1_3"
            value={formData.s1_3}
            onChange={handleChange}
            sx={{ width: 300, height: 25, mb: 4 ,mt:0}}
            variant="outlined"
            margin="normal"
            size="small"
          />
          </>
          )}

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-start',
              padding: 2 
            }}
          >
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
          </Box>
        </Box>
      )}

{firstDropdownValue === "add/edit/delete node property" && (
  <Box sx={{ ml: 1 }}>
  <h4 style={{ color: "black", padding: "2px" }}>
    choose to add a new property or edit <br /> or delete an existing
    property :
  </h4>
  <RadioGroup
    row
    defaultValue="edit"
    name="uploadOption"
    sx={{ mb: 2 }}
    value={formData.s1_1}
    onChange={handleRadioChange}
  >
    <FormControlLabel value="add" control={<Radio />} label="add" disabled={formData.s1_2.startsWith("CP") || formData.s1_2.startsWith("CL")} />
    <FormControlLabel value="edit" control={<Radio />} label="edit" />
    <FormControlLabel
      value="delete"
      control={<Radio />}
      label="delete"
      disabled={formData.s1_2.startsWith("CP") || formData.s1_2.startsWith("CL")}
    />
  </RadioGroup>
  <InputLabel id="domain-label" style={{ color: "black " }}>
    CMID of Node
  </InputLabel>
  <TextField
    name="s1_2"
    value={formData.s1_2}
    onChange={handleChange}
    sx={{ width: 300, height: 25, mb : 5,padding:"0 0",mt:0 }}
    variant="outlined"
    size="small"
    margin="normal"
  />

  {add_edit_delete_Nodeprops_Options.length !== 0 &&
     (Array.isArray(add_edit_delete_Nodeprops_Options) ? (
    // If it's an array
    <>
      <InputLabel id="api-results-label" style={{ color: "black" }}>
        Choose property to add
      </InputLabel>
      <Select
        name="s1_7"
        sx={{ width: 300, height: 25, mb: 3 }}
        value={formData.s1_7 || ""}
        onChange={handleChange}
      >
        {add_edit_delete_Nodeprops_Options.map((value, index) => (
          <MenuItem key={index} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </>
  ):(
    // If it's an object
    Object.keys(add_edit_delete_Nodeprops_Options).length !== 0 && (
      <>
        <InputLabel id="api-results-label" style={{ color: "black" }}>
          Choose property to change
        </InputLabel>
        <Select
          name="s1_7"
          sx={{ width: 300, height: 25, mb: 3 }}
          value={formData.s1_7 || ""}
          onChange={handleChange}
        >
          {Object.keys(add_edit_delete_Nodeprops_Options).map((key, index) => (
            <MenuItem key={index} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
        {formData.s1_7 && (
          <Typography variant="body1" sx={{mb: 1 }}>
            Current value is : {add_edit_delete_Nodeprops_Options[formData.s1_7]}
          </Typography>
        )}
      </>
    )
    ))}

  {(formData.s1_1 === "add" || formData.s1_1 === "edit") &&  (
  <>
  <InputLabel id="domain-label" style={{ color: "black " }}>
    Property value
  </InputLabel>
  <TextField
    name="s1_3"
    value={formData.s1_3}
    onChange={handleChange}
    sx={{ width: 300, height: 25, mb: 4,mt:0 }}
    variant="outlined"
    size="small"
    margin="normal"
  />
  </>
  )}
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start',
      padding: 2 
    }}
  >
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
  </Box>
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
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
     ID to discard
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb: 4,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start',
      padding: 2 
    }}
  >
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
  </Box>
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
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   {add_edit_delete_usesprops_Options !== "" &&
              <>
                <InputLabel id="api-results-label" style={{ color: "black" }}>
                  Choose USES tie to change
                </InputLabel>
                <Select
                  name="s1_7"
                  sx={{ width: 300, height: 40, mb: 3 }}
                  value={formData.s1_7 || ""}
                  onChange={handleChange}
                >
                  {add_edit_delete_usesprops_Options.map(([n, r, d], index) => (
                    <MenuItem key={index} value={JSON.stringify([n, r, d])}>
                      {`${n.CMName} ---- USES Key: ${r.Key} --- ${d.CMName}`}
                    </MenuItem>
                  ))}
                </Select>
              </>
            }
   <InputLabel id="domain-label" style={{ color: "black " }}>
     CMID moving to
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb: 4,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start',
      padding: 2 
    }}
  >
  <Button
    variant="contained"
    sx={{
      backgroundColor: "black",
      color: "white",
      "&:hover": {
        backgroundColor: "green",
      },
    }}
    onClick={handleAmbiguousTies}
  >
    Check for Ambiguous Ties{" "}
  </Button>
  </Box>
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
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Reason why this comment is necessary
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb: 4,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
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
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start',
      padding: 2 
    }}
  >
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
  </Box>
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
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   {add_edit_delete_usesprops_Options !== "" &&
              <>
                <InputLabel id="api-results-label" style={{ color: "black" }}>
                  Choose USES tie to change
                </InputLabel>
                <Select
                  name="s1_7"
                  sx={{ width: 300, height: 40, mb: 3 }}
                  value={formData.s1_7 || ""}
                  onChange={handleChange}
                >
                  {add_edit_delete_usesprops_Options.map(([n, r, d], index) => (
                    <MenuItem key={index} value={JSON.stringify([n, r, d])}>
                      {`${n.CMName} ---- USES Key: ${r.Key} --- ${d.CMName}`}
                    </MenuItem>
                  ))}
                </Select>
              </>
            }
   <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start',
      padding: 2 
    }}
  >
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
  </Box>
 </Box>
)
}

{firstDropdownValue === "create new domain" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
     Enter label name
   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <InputLabel id="domain-label" style={{color:"black "}}>Choose Group label (select 'NA' if it is a group label)</InputLabel>
          <br />
    <Select
            labelId="domain-label"
            id="domain"
            name="s1_7"
            value={formData.s1_7}
            onChange={handleChange}
            sx={{width: 300,height:40,mb:3 }}
            margin="normal"
          >
            <MenuItem value="NA">NA</MenuItem>
            {grouplabels.map((value) => (
        <MenuItem key={value} value={value}>
          {value}
        </MenuItem>
      ))}
    </Select>
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Enter contextual Relationship Name (usually 'LABEL_OF')
   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Enter label description
   </InputLabel>
   <TextField
     name="s1_4"
     value={formData.s1_4}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 12,mt:0 }}
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
     sx={{ width: 300, height: 40, mb : 3,mt: 0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
   Enter hex color for network display (leave blank for default color)
   </InputLabel>
   <TextField
     name="s1_6"
     value={formData.s1_6}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start',
      padding: 2 
    }}
  >
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
  </Box>
 </Box>
)
}

{/* {firstDropdownValue === "add foci" && (
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
} */}

{firstDropdownValue === "create new user" && (
   <Box sx={{ ml: 1 }}>
   <InputLabel id="domain-label" style={{ color: "black " }}>
username   </InputLabel>
   <TextField
     name="s1_2"
     value={formData.s1_2}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
first name   </InputLabel>
   <TextField
     name="s1_3"
     value={formData.s1_3}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
     variant="outlined"
     margin="normal"
     size="small"
   />
   <InputLabel id="domain-label" style={{ color: "black " }}>
last name   </InputLabel>
   <TextField
     name="s1_4"
     value={formData.s1_4}
     onChange={handleChange}
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}  
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
     size="small"
   />
   <InputLabel id="domain-label" style={{color:"black "}}>Select role:</InputLabel>
          <br />
    <Select
            labelId="domain-label"
            id="domain"
            name="s1_7"
            value={formData.s1_7}
            onChange={handleChange}
            sx={{width: 300,height:40,mb:3 }}
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
     sx={{ width: 300, height: 40, mb : 3,mt:0 }}
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
     size="small"
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
     size="small"
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
      {firstDropdownValue === "approve new users" && (
<div>
      <Typography variant="p">Check for new users and approve them:</Typography>
      
      <Box 
  sx={{ 
    display: 'flex', 
    justifyContent: 'flex-start',
    padding: 2 
  }}
>
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
      </Box>

      <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
  }}>
      {users.length > 0 && <DataGrid
      sx={{ flexGrow: 1, 
        maxHeight: '100%',
        overflow: 'auto'}}
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
      </Box>
      {
        selectedUserIds.length > 0 && 
        <Box 
  sx={{ 
    display: 'flex', 
    justifyContent: 'flex-start',
    padding: 2 
  }}
>
        <Button
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
      </Box>
      }
      <Dialog open={popen} onClose={handlePclose}>
        <DialogContent>
          <p>{CMIDText}</p>
        </DialogContent>
      </Dialog>
      </div>)}
      </Box>

      {loading && (
                  <div style={{
      position: "fixed",     
      top: "50%",            
      left: "50%",           
      transform: "translate(-50%, -50%)", 
      zIndex: 1300,         
    }}>
                    <CircularProgress />
                  </div>
                )}

       <Modal open={open} onClose={handleClose}>
        <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            minWidth: 300,
          }}>
          {tableData.length === 0 ? (
          <Box textAlign="center">
          <Typography variant="h6" mb={2}>
            There are no ambiguous parents. Press submit to continue moving the USES tie.
          </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Submit
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Wait for later
            </Button>
          </Box>
        </Box>)
        :(<Box>
              <Typography variant="h6" mb={2}>
                This node has multiple uses ties from dataset {datasetID}.  There are {tableData.length} USES ties to children with ambiguous parents. 
                For each USES tie please select whether the appropriate parent is the from node or to node
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>CMID</TableCell>
                      <TableCell>Key</TableCell>
                      <TableCell>Parent Node</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.CMID}</TableCell>
                        <TableCell>{row.Key}</TableCell>
                        <TableCell>
                          <Select
                            value={tableDropdownValues[idx] || "From"}
                            onChange={(e) => handleDropdownChange(idx, e.target.value)}
                            size= "small"
                          >
                            <MenuItem value="From">From</MenuItem>
                            <MenuItem value="To">To</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" justifyContent="center" mt={2} gap={2}>
                <Button variant="contained" color="success" onClick={handleSubmitTable}>
                  Submit
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleClose}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',padding: 2,
      backgroundColor: 'black', height:"15vh"
      }}>
              <img src={image} alt="CatMapper Logo" style={{ height: 80 }} />
              <Box>
                <Link  id="catmapperfooter" to="/people"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>People</Link>
                <Link to="/news" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>News</Link>
                <Link to="/funding" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Funding</Link>
                <Link to="/citation" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Citation</Link>
                <Link to="/terms" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Terms</Link>
                <Link to="/contact" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Contact</Link>
                <Link to="/download" id="catmapperfooter" underline="none" style={{ color: "white", textDecoration: "none", margin: "0 8px" }}> Download</Link>
              </Box>
            </Box>
            </div>
  );
};

export default Admin;
