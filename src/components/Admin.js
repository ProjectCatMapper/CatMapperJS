import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  Modal,
  RadioGroup,
  Typography,
  Select,
  TextField,
  MenuItem,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import CircularProgress from "@mui/material/CircularProgress";
import FooterLinks from "./FooterLinks";
import CardContent from '@mui/material/CardContent';
import SavedCmidInsertPopover from './SavedCmidInsertPopover';
import { Link } from "react-router-dom";

const INITIAL_FORM_STATE = {
  s1_1: "edit",
  s1_2: "",
  s1_3: "",
  s1_4: "",
  s1_5: "",
  s1_6: "",
  s1_7: "",
  s1_8: ""
};

const ROUTINE_OPTIONS = [
  { key: "is_valid_json", label: "is_valid_json" },
  { key: "validateJSON", label: "validateJSON" },
  { key: "checkDomains", label: "checkDomains" },
  { key: "backup2CSV", label: "backup2CSV" },
  { key: "getBadCMID", label: "getBadCMID" },
  { key: "getMultipleLabels", label: "getMultipleLabels" },
  { key: "getBadComplexProperties", label: "getBadComplexProperties" },
  { key: "getBadDomains", label: "getBadDomains" },
  { key: "getBadRelations", label: "getBadRelations" },
  { key: "CMNameNotInName", label: "CMNameNotInName" },
  { key: "fixMetaTypes", label: "fixMetaTypes" },
  { key: "noUSES", label: "noUSES" },
  { key: "checkUSES", label: "checkUSES" },
  { key: "updateUSES", label: "updateUSES" },
  { key: "reportChanges", label: "reportChanges" },
  { key: "missingCMName", label: "missingCMName" },
  { key: "getBadContextual", label: "getBadContextual" },
  { key: "get_duplicate_empty_USES", label: "get_duplicate_empty_USES" },
  { key: "get_empty_nodeprops", label: "get_empty_nodeprops" },
  { key: "get_duplicate_triplets", label: "get_duplicate_triplets" },
  { key: "getInappropriateprops_Nodes_Rels", label: "getInappropriateprops_Nodes_Rels" },
  { key: "get_label_check", label: "get_label_check" },
  { key: "getNumeric_Checks", label: "getNumeric_Checks" },
  { key: "runRoutinesStream", label: "runRoutinesStream" },
];

const Admin = ({ database }) => {
  const { cred, user } = useAuth();
  const [firstDropdownValue, setFirstDropdownValue] = useState(
    "add/edit/delete USES property"
  );
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [CMIDText, setCMIDText] = useState('');
  const [grouplabels, setgrouplabels] = useState(["NA"]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [ntableData, setnTableData] = useState([]);
  const [tableDropdownValues, setTableDropdownValues] = useState({});
  const [datasetID, setDatasetID] = useState('')
  const [mergeConfirmOpen, setMergeConfirmOpen] = useState(false);
  const [mergePreview, setMergePreview] = useState({ keep: null, discard: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState({
    "Edit Options": true,
    "User Options": true,
    "Database Checks": true,
  });
  const [routineParams, setRoutineParams] = useState({
    return_type: "info",
    save: "true",
    cmid: "",
    dateStart: "",
    dateEnd: "",
    action: "default",
    user: "",
    property: "parentContext",
    value: "",
  });
  const [routineOutput, setRoutineOutput] = useState("");

  const openAmbiguousTiesModal = () => setOpen(true);
  const closeAmbiguousTiesModal = () => setOpen(false);

  const sections = [
    {
      label: "Edit Options",
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
      keys: ["create new user", "change user password", "approve new users"],
    },
    {
      label: "Database Checks",
      keys: ROUTINE_OPTIONS.map((option) => option.key),
    },
  ];
  const routineOptionByKey = Object.fromEntries(
    ROUTINE_OPTIONS.map((option) => [option.key, option])
  );
  const routineKeys = ROUTINE_OPTIONS.map((option) => option.key);
  const isDatabaseRoutineSelected = routineKeys.includes(firstDropdownValue);

  const toggleSectionCollapse = (sectionLabel) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionLabel]: !prev[sectionLabel],
    }));
  };

  const submitAdminAction = async () => {
    try {
      if (firstDropdownValue === "move USES tie") {
        closeAmbiguousTiesModal();
      }
      setLoading(true);
      if (firstDropdownValue === "delete node") {
        const nodeCmid = (formData.s1_2 || "").trim();
        const nodeName = (formData.s1_7 || "").trim();
        const nodeLabel = nodeName
          ? `${nodeCmid} (${nodeName})`
          : nodeCmid;
        const confirmed = window.confirm(
          `Are you sure you want to ${firstDropdownValue} of ${nodeLabel}? This action cannot be undone.`
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
          ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
        },
        body: JSON.stringify({
          database: database,
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

  const submitAmbiguousTieResolutions = async () => {
    try {
      closeAmbiguousTiesModal();
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

      await fetch(`${process.env.REACT_APP_API_URL}/admin/edit`, {
        //const response = await fetch("http://127.0.0.1:5001/admin/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
        },
        body: JSON.stringify({
          database: database,
          fun: firstDropdownValue,
          input: cleanedData,
          tabledata: combinedData,
          datasetID: datasetID
        }),
      });

      alert("Action completed");

    } catch (error) {
      console.error("Error submitting form:", error);
    }
    finally {
      setLoading(false);
    };
  };

  const checkForAmbiguousUsesTies = async () => {
    try {
      setLoading(true);
      setTableData([])

      const cleanedData = {
        ...formData,
        s1_2: formData.s1_2.trim(),
        s1_3: formData.s1_3.trim(),
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/check_ambiguous_usesties`, {
        //const response = await fetch("http://127.0.0.1:5001/check_ambiguous_usesties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
        },
        body: JSON.stringify({
          database: database,
          input: cleanedData
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error);
      } else {
        setDatasetID(result.dataset)
        if (result.status === "False") {
          const updatedTableData = (result.child_USES_check || []).map(row => ({
            ...row,
            "optionA": "To"
          }));

          setnTableData(updatedTableData);
          openAmbiguousTiesModal()
        }
        else {
          console.log("Ambiguity detected:", result)
          setTableData(result.child_USES_check)
          const initialDropdowns = {};
          (result.child_USES_check || []).forEach((row, idx) => {
            initialDropdowns[idx] = "default"; // default value
          });
          setTableDropdownValues(initialDropdowns);
          openAmbiguousTiesModal();
        }
      }

    } catch (error) {
      console.error("Error submitting form:", error);
    }
    finally {
      setLoading(false);
    };
  };

  const loadPendingUsersForApproval = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/updateNewUsers`, {
        //const response = await fetch("http://127.0.0.1:5001/updateNewUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
        },
        body: JSON.stringify({
          userid: "none",
          database: database,
          process: "None",
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = typeof result === "string"
          ? result
          : (result && result.error) || "Unable to load pending users.";
        throw new Error(message);
      }

      const pendingUsers = Array.isArray(result) ? result : [];
      setUsers(pendingUsers);
      setSelectedUserIds([]);
      if (pendingUsers.length === 0) {
        alert("No pending users found.");
      }
    } catch (error) {
      const message = error?.message || "Unable to load pending users.";
      alert(message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveSelectedUsers = async () => {
    try {
      if (selectedUserIds.length === 0) {
        alert("Select at least one user to approve.");
        return;
      }

      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/updateNewUsers`, {
        //const response = await fetch("http://127.0.0.1:5001/updateNewUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
        },
        body: JSON.stringify({
          userid: selectedUserIds,
          database: database,
          process: "approve",
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = typeof result === "string"
          ? result
          : (result && result.error) || "Unable to approve selected users.";
        throw new Error(message);
      }

      if (result) {
        const selectedIds = new Set(selectedUserIds.map((id) => String(id)));
        setUsers((prevUsers) => prevUsers.filter((row) => !selectedIds.has(String(row.userid))));
        setSelectedUserIds([]);
        setCMIDText("Selected users approved.");
        setPopen(true);
      }
    } catch (error) {
      const message = error?.message || "Unable to approve selected users.";
      alert(message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const [popen, setPopen] = useState(false);

  const closeApprovalDialog = () => {
    setPopen(false);
  };

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const resetAdminForm = () => {
    setMergeConfirmOpen(false);
    setMergePreview({ keep: null, discard: null });
    setFormData(INITIAL_FORM_STATE);
    setRoutineOutput("");
  };

  const selectAdminOption = (optionKey) => {
    setFirstDropdownValue(optionKey);
    resetAdminForm();
  };

  const insertSavedIntoForm = (selectedSavedCmid, targetField = "s1_2") => {
    if (!selectedSavedCmid) return;
    setFormData((prev) => {
      const current = (prev[targetField] || '').trim();
      const value = current ? `${current},${selectedSavedCmid}` : selectedSavedCmid;
      return { ...prev, [targetField]: value };
    });
  };

  const renderCmidInput = ({
    label,
    name = "s1_2",
    textFieldSx = {},
    size = "small",
    margin = "none",
  }) => (
    <>
      <InputLabel id={`label-${name}`} style={{ color: "black " }}>
        {label}
      </InputLabel>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <TextField
          name={name}
          value={formData[name]}
          onChange={updateFormFieldValue}
          sx={{ width: 300, mt: 0, mb: 0, ...textFieldSx }}
          variant="outlined"
          margin={margin}
          size={size}
        />
        <SavedCmidInsertPopover
          user={user}
          cred={cred}
          database={database}
          title="Insert"
          onInsert={(selectedSavedCmid) => insertSavedIntoForm(selectedSavedCmid, name)}
        />
      </Box>
    </>
  );

  const columns = [
    { field: 'userid', headerName: 'User ID', width: 150 },
    { field: 'first', headerName: 'First Name', width: 150 },
    { field: 'last', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'intendedUse', headerName: 'Intended Use', width: 200 },
  ];

  const updateSelectedUserIds = (newSelectionModel) => {
    setSelectedUserIds(newSelectionModel);
  };

  const updateActionType = (event) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      s1_1: event.target.value
    }));
  };

  const updateAmbiguousTieParentChoice = (idx, value) => {
    setTableDropdownValues((prev) => ({ ...prev, [idx]: value }));
  };

  // trims strings immediately for textboxes and leaves objects coming from Select intact, do not change this !!!
  const updateFormFieldValue = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const updateRoutineParam = (event) => {
    const { name, value } = event.target;
    setRoutineParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const runDatabaseRoutine = async () => {
    try {
      if (firstDropdownValue === "is_valid_json" && !routineParams.value.trim()) {
        alert("Enter a JSON value to validate.");
        return;
      }
      if (firstDropdownValue === "updateUSES") {
        const cmidValue = routineParams.cmid.trim().toUpperCase();
        if (cmidValue && !/^(AM|SM|AD|SD)\d+$/.test(cmidValue)) {
          alert("CMID must start with AM, SM, AD, or SD and be followed by digits.");
          return;
        }
      }

      setLoading(true);

      const params = new URLSearchParams();
      if (routineParams.return_type) {
        params.set("return_type", routineParams.return_type);
      }
      if (firstDropdownValue === "reportChanges") {
        if (routineParams.dateStart.trim()) {
          params.set("dateStart", routineParams.dateStart.trim());
        }
        if (routineParams.dateEnd.trim()) {
          params.set("dateEnd", routineParams.dateEnd.trim());
        }
        if (routineParams.action.trim()) {
          params.set("action", routineParams.action.trim());
        }
        if (routineParams.user.trim()) {
          params.set("user", routineParams.user.trim());
        }
      }
      if (firstDropdownValue === "noUSES" || firstDropdownValue === "checkUSES") {
        params.set("save", routineParams.save);
      }
      if (firstDropdownValue === "validateJSON") {
        params.set("property", routineParams.property);
      }
      if (firstDropdownValue === "is_valid_json") {
        params.set("value", routineParams.value.trim());
      }
      if (firstDropdownValue === "updateUSES") {
        const cmidValue = routineParams.cmid.trim().toUpperCase();
        if (cmidValue) {
          params.set("CMID", cmidValue);
        }
      }

      const queryString = params.toString();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/routines/${encodeURIComponent(firstDropdownValue)}/${encodeURIComponent(database)}${queryString ? `?${queryString}` : ""}`,
        {
          method: "GET",
          headers: {
            ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
          },
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? JSON.stringify(await response.json(), null, 2)
        : await response.text();

      if (!response.ok) {
        throw new Error(result || `Routine failed (${response.status})`);
      }

      setRoutineOutput(result || "Routine completed with no output.");
    } catch (error) {
      const message = error?.message || "Unable to run routine.";
      setRoutineOutput(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const postponeAmbiguousTieUpdate = () => {
    closeAmbiguousTiesModal();
  };

  const fetchMergeNodeSummary = async (cmid) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/admin/nodeSummary?CMID=${encodeURIComponent(cmid)}&database=${encodeURIComponent(database)}`,
      {
        method: "GET",
        headers: {
          ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
        },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to fetch node summary.");
    }
    return data;
  };

  const previewMergeNodes = async () => {
    try {
      const keepCmid = (formData.s1_2 || "").trim();
      const discardCmid = (formData.s1_3 || "").trim();

      if (!keepCmid || !discardCmid) {
        alert("Both CMIDs are required.");
        return;
      }
      if (keepCmid === discardCmid) {
        alert("CMIDs to keep and discard cannot be the same.");
        return;
      }

      setLoading(true);
      const [keepSummary, discardSummary] = await Promise.all([
        fetchMergeNodeSummary(keepCmid),
        fetchMergeNodeSummary(discardCmid),
      ]);

      if (keepSummary.primaryDomain !== discardSummary.primaryDomain) {
        alert(
          `Primary domain mismatch. ` +
          `${keepSummary.CMID} (${keepSummary.CMName || "Unknown"}) is ${keepSummary.primaryDomain}, ` +
          `but ${discardSummary.CMID} (${discardSummary.CMName || "Unknown"}) is ${discardSummary.primaryDomain}.`
        );
        return;
      }

      setMergePreview({ keep: keepSummary, discard: discardSummary });
      setMergeConfirmOpen(true);
    } catch (error) {
      alert(error.message || "Unable to validate merge nodes.");
    } finally {
      setLoading(false);
    }
  };

  const [add_edit_delete_Nodeprops_Options, setDropdownOptions] = useState([]);
  const [add_edit_delete_usesprops_Options, setDropdown1Options] = useState([]);
  const [add_edit_delete_usesprops_properties, setDropdown2Options] = useState([]);

  useEffect(() => {
    if (firstDropdownValue !== "add/edit/delete node property" && firstDropdownValue !== "delete node") {
      setDropdownOptions([]); // reset dropdown if not in this mode
      return;
    }

    const option = formData.s1_1
    const cmid = formData.s1_2.trim();
    const pattern = /^(AM|CP|CL|SM|AD|SD)\d+$/;

    if (firstDropdownValue === "delete node") {
      setFormData((prevFormData) => (
        prevFormData.s1_7 === "" ? prevFormData : { ...prevFormData, s1_7: "" }
      ));
    }

    if (pattern.test(cmid)) {
      const fetchData = async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/admin_add_edit_delete_nodeproperties?CMID=` + cmid + "&database=" + database + "&option=" + option, {
            //const res = await fetch("http://127.0.0.1:5001/admin_add_edit_delete_nodeproperties?CMID="+cmid+"&database="+database, {
            method: "GET",
          });
          const data = await res.json();

          if (data.error) {
            alert("An error occurred: " + data.error);
            return;
          }

          if (firstDropdownValue === "delete node") {
            const cmName = data?.r?.CMName || "";
            setFormData((prevFormData) => (
              prevFormData.s1_7 === cmName
                ? prevFormData
                : { ...prevFormData, s1_7: cmName }
            ));
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
  }, [database, formData.s1_1, formData.s1_2, firstDropdownValue]);

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
          const res = await fetch(`${process.env.REACT_APP_API_URL}/admin_add_edit_delete_usesproperties?CMID=` + cmid + "&database=" + database, {
            //const res = await fetch("http://127.0.0.1:5001/admin_add_edit_delete_usesproperties?CMID="+cmid+"&database="+database, {
            method: "GET",
          });
          const data = await res.json();

          if (data.error) {
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
  }, [database, formData.s1_1, formData.s1_2, firstDropdownValue]);

  useEffect(() => {
    const createLabel = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/create_label_helper?database=` + database, {
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
  }, [database, firstDropdownValue]);

  useEffect(() => {
    setRoutineParams((prev) => ({
      ...prev,
      user: user || "",
    }));
  }, [user]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, bgcolor: "white", minHeight: 0 }}>
        <Box
          sx={{
            width: { xs: isSidebarOpen ? "100%" : 44, md: isSidebarOpen ? 320 : 44 },
            minWidth: { xs: isSidebarOpen ? "100%" : 44, md: isSidebarOpen ? 320 : 44 },
            border: "1px solid #d9d9d9",
            borderRadius: 1,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "width 0.2s ease, min-width 0.2s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: isSidebarOpen ? "space-between" : "center", p: 1.5, borderBottom: "1px solid #ececec" }}>
            {isSidebarOpen && (
              <Typography sx={{ fontWeight: 700 }}>
                Admin Options
              </Typography>
            )}
            <Button
              size="small"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              sx={{ minWidth: 28, px: 0.5 }}
            >
              {isSidebarOpen ? ">" : "<"}
            </Button>
          </Box>

          {isSidebarOpen && (
            <>
              <Typography sx={{ px: 1.5, py: 1.25, fontSize: "0.85rem", color: "text.secondary", borderBottom: "1px solid #ececec" }}>
                Admin panel: these functions are intended for admin users to identify and fix problems in the database, add and modify users, and to initiate database integrity checks
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                <List disablePadding>
                  {sections.map((section) => (
                    <Box key={section.label}>
                      <ListItemButton
                        onClick={() => toggleSectionCollapse(section.label)}
                        sx={{ borderRadius: 1, mx: 0.5, my: 0.5 }}
                      >
                        <ListItemText
                          primary={section.label}
                          primaryTypographyProps={{ fontWeight: 700 }}
                        />
                        <Typography variant="body2">
                          {collapsedSections[section.label] ? "−" : "+"}
                        </Typography>
                      </ListItemButton>
                      <Collapse in={collapsedSections[section.label]} timeout="auto" unmountOnExit>
                        <List dense disablePadding>
                          {section.keys.map((key) => (
                            <ListItemButton
                              key={key}
                              selected={firstDropdownValue === key}
                              onClick={() => selectAdminOption(key)}
                              sx={{ borderRadius: 1, mx: 1, mb: 0.5, pl: 3 }}
                            >
                              <ListItemText
                                primary={routineOptionByKey[key]?.label || key}
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  ))}
                </List>
              </Box>
              <Box sx={{ p: 1.5, borderTop: "1px solid #ececec" }}>
                <Button component={Link} to="/admin/metadata" variant="outlined" fullWidth>
                  Open Metadata Manager
                </Button>
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto", pr: { md: 1 } }}>
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ mt: 1, fontWeight: 600 }}>
              Selected option: {routineOptionByKey[firstDropdownValue]?.label || firstDropdownValue}
            </Typography>
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
              onChange={updateActionType}
            >
              <FormControlLabel value="add" control={<Radio />} label="add" />
              <FormControlLabel value="edit" control={<Radio />} label="edit" />
              <FormControlLabel
                value="delete"
                control={<Radio />}
                label="delete"
              />
            </RadioGroup>
            {renderCmidInput({
              label: "CMID of Category",
              name: "s1_2",
              textFieldSx: { height: 36, fontSize: 12 },
            })}
            {add_edit_delete_usesprops_Options !== "" &&
              <>
                <InputLabel id="api-results-label" style={{ color: "black" }}>
                  Choose USES tie to change
                </InputLabel>
                <Select
                  name="s1_7"
                  sx={{ width: 300, height: 40, mb: 2 }}
                  value={formData.s1_7 || ""}
                  onChange={updateFormFieldValue}
                >
                  {add_edit_delete_usesprops_Options.map(([n, r, d], index) => (
                    <MenuItem key={index} value={index + 1}>
                      {`${n.CMName} ---- USES Key: ${r.Key} --- ${d.CMName}`}
                    </MenuItem>
                  ))}
                </Select>
              </>
            }

            {formData.s1_7 !== "" && add_edit_delete_usesprops_Options.length !== 0 && (
              <>
                {(() => {
                  const [, r] = add_edit_delete_usesprops_Options[formData.s1_7 - 1];
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
                          sx={{ width: 300, height: 40, mb: 2 }}
                          value={formData.s1_8 || ""}
                          onChange={updateFormFieldValue}
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
            {(formData.s1_1 === "add" || formData.s1_1 === "edit") && (
              <>
                <InputLabel id="domain-label" style={{ color: "black " }}>
                  Property value ( use ' || ' to split values)
                </InputLabel>
                <TextField
                  name="s1_3"
                  value={formData.s1_3}
                  onChange={updateFormFieldValue}
                  sx={{ width: 300, height: 25, mb: 2, mt: 0 }}
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
                pt: 1,
                pb: 1
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
                onClick={submitAdminAction}
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
              onChange={updateActionType}
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
            {renderCmidInput({
              label: "CMID of Node",
              name: "s1_2",
              textFieldSx: { height: 25, padding: "0 0" },
            })}

            {add_edit_delete_Nodeprops_Options.length !== 0 &&
              (Array.isArray(add_edit_delete_Nodeprops_Options) ? (
                // If it's an array
                <>
                  <InputLabel id="api-results-label" style={{ color: "black" }}>
                    Choose property to add
                  </InputLabel>
                  <Select
                    name="s1_7"
                    sx={{ width: 300, height: 25, mb: 2 }}
                    value={formData.s1_7 || ""}
                    onChange={updateFormFieldValue}
                  >
                    {add_edit_delete_Nodeprops_Options.map((value, index) => (
                      <MenuItem key={index} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              ) : (
                // If it's an object
                Object.keys(add_edit_delete_Nodeprops_Options).length !== 0 && (
                  <>
                    <InputLabel id="api-results-label" style={{ color: "black" }}>
                      Choose property to change
                    </InputLabel>
                    <Select
                      name="s1_7"
                      sx={{ width: 300, height: 25, mb: 2 }}
                      value={formData.s1_7 || ""}
                      onChange={updateFormFieldValue}
                    >
                      {Object.keys(add_edit_delete_Nodeprops_Options).map((key, index) => (
                        <MenuItem key={index} value={key}>
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                    {formData.s1_7 && (
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        Current value is : {add_edit_delete_Nodeprops_Options[formData.s1_7]}
                      </Typography>
                    )}
                  </>
                )
              ))}

            {(formData.s1_1 === "add" || formData.s1_1 === "edit") && (
              <>
                <InputLabel id="domain-label" style={{ color: "black " }}>
                  Property value
                </InputLabel>
                <TextField
                  name="s1_3"
                  value={formData.s1_3}
                  onChange={updateFormFieldValue}
                  sx={{ width: 300, height: 25, mb: 2, mt: 0 }}
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
                pt: 1,
                pb: 1
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
                onClick={submitAdminAction}
              >
                Submit{" "}
              </Button>
            </Box>
          </Box>
        )
        }

        {firstDropdownValue === "merge nodes" && (
          <Box sx={{ ml: 1 }}>
            {renderCmidInput({
              label: "ID to keep",
              name: "s1_2",
              textFieldSx: { height: 40 },
            })}
            {renderCmidInput({
              label: "ID to discard",
              name: "s1_3",
              textFieldSx: { height: 40 },
            })}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                pt: 1,
                pb: 1
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
                onClick={previewMergeNodes}
              >
                Submit{" "}
              </Button>
            </Box>
          </Box>
        )
        }

        {firstDropdownValue === "move USES tie" && (
          <Box sx={{ ml: 1 }}>
            {renderCmidInput({
              label: "CMID moving from",
              name: "s1_2",
              textFieldSx: { height: 40 },
            })}
            {add_edit_delete_usesprops_Options !== "" &&
              <>
                <InputLabel id="api-results-label" style={{ color: "black" }}>
                  Choose USES tie to change
                </InputLabel>
                <Select
                  name="s1_7"
                  sx={{ width: 300, height: 40, mb: 2 }}
                  value={formData.s1_7 || ""}
                  onChange={updateFormFieldValue}
                >
                  {add_edit_delete_usesprops_Options.map(([n, r, d], index) => (
                    <MenuItem key={index} value={JSON.stringify([n, r, d])}>
                      {`${n.CMName} ---- USES Key: ${r.Key} --- ${d.CMName}`}
                    </MenuItem>
                  ))}
                </Select>
              </>
            }
            {renderCmidInput({
              label: "CMID moving to",
              name: "s1_3",
              textFieldSx: { height: 40 },
            })}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                pt: 1,
                pb: 1
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
                onClick={checkForAmbiguousUsesTies}
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
              onChange={updateActionType}
            >
              <FormControlLabel value="TRUE" control={<Radio />} label="TRUE" />
              <FormControlLabel value="FALSE" control={<Radio />} label="FALSE" />
            </RadioGroup>
            {renderCmidInput({
              label: "ID of node connected to relationship",
              name: "s1_2",
              textFieldSx: { height: 40 },
            })}
            <InputLabel id="domain-label" style={{ color: "black " }}>
              Reason why this comment is necessary
            </InputLabel>
            <TextField
              name="s1_3"
              value={formData.s1_3}
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 2, mt: 0 }}
              variant="outlined"
              margin="normal"
              size="small"
            />
          </Box>
        )
        }

        {firstDropdownValue === "delete node" && (
          <Box sx={{ ml: 1 }}>
            {renderCmidInput({
              label: "CMID of node to delete",
              name: "s1_2",
              textFieldSx: { height: 40 },
            })}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                pt: 1,
                pb: 1
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
                onClick={submitAdminAction}
              >
                Submit{" "}
              </Button>
            </Box>
          </Box>
        )
        }

        {firstDropdownValue === "delete USES relation" && (
          <Box sx={{ ml: 1 }}>
            {renderCmidInput({
              label: "CMID of category",
              name: "s1_2",
              textFieldSx: { height: 40 },
            })}
            {add_edit_delete_usesprops_Options !== "" &&
              <>
                <InputLabel id="api-results-label" style={{ color: "black" }}>
                  Choose USES tie to change
                </InputLabel>
                <Select
                  name="s1_7"
                  sx={{ width: 300, height: 40, mb: 2 }}
                  value={formData.s1_7 || ""}
                  onChange={updateFormFieldValue}
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
                pt: 1,
                pb: 1
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
                onClick={submitAdminAction}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 0 }}
              variant="outlined"
              margin="normal"
              size="small"
            />
            <InputLabel id="domain-label" style={{ color: "black " }}>Choose Group label (select 'NA' if it is a group label)</InputLabel>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="s1_7"
              value={formData.s1_7}
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3 }}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 0 }}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 2, mt: 0 }}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 0 }}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 0 }}
              variant="outlined"
              margin="normal"
              size="small"
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                pt: 1,
                pb: 1
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
                onClick={submitAdminAction}
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
     onChange={updateFormFieldValue}
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
     onChange={updateFormFieldValue}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 0 }}
              variant="outlined"
              margin="normal"
              size="small"
            />
            <InputLabel id="domain-label" style={{ color: "black " }}>
              first name   </InputLabel>
            <TextField
              name="s1_3"
              value={formData.s1_3}
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 0 }}
              variant="outlined"
              margin="normal"
              size="small"
            />
            <InputLabel id="domain-label" style={{ color: "black " }}>
              last name   </InputLabel>
            <TextField
              name="s1_4"
              value={formData.s1_4}
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 0 }}
              variant="outlined"
              margin="normal"
            />
            <InputLabel id="domain-label" style={{ color: "black " }}>
              email   </InputLabel>
            <TextField
              name="s1_5"
              value={formData.s1_5}
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 1 }}
              variant="outlined"
              margin="normal"
              size="small"
            />
            <InputLabel id="domain-label" style={{ color: "black " }}>Select role:</InputLabel>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="s1_7"
              value={formData.s1_7}
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3 }}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3, mt: 0 }}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 3 }}
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
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40, mb: 2 }}
              variant="outlined"
              margin="normal"
              size="small"
            />
          </Box>
        )
        }

        {firstDropdownValue === "CSV database backup" && (
          <Box sx={{ ml: 1 }}>
            <InputLabel id="domain-label" style={{ color: "black " }}>Choose label</InputLabel>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="s1_7"
              value={formData.s1_7}
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40 }}
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
          <Box sx={{ ml: 1, mb: 1 }}>
            <InputLabel id="domain-label" style={{ color: "black " }}>Choose label</InputLabel>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="s1_7"
              value={formData.s1_7}
              onChange={updateFormFieldValue}
              sx={{ width: 300, height: 40 }}
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
        {isDatabaseRoutineSelected && (
          <Box sx={{ ml: 1, maxWidth: 900 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Routine Runner: {routineOptionByKey[firstDropdownValue]?.label || firstDropdownValue}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Runs routine endpoint `/routines/{firstDropdownValue}/{database}`.
            </Typography>

            <InputLabel sx={{ color: "black" }}>Return type</InputLabel>
            <Select
              name="return_type"
              value={routineParams.return_type}
              onChange={updateRoutineParam}
              sx={{ width: 300, height: 40, mb: 2 }}
            >
              <MenuItem value="info">info</MenuItem>
              <MenuItem value="data">data</MenuItem>
            </Select>

            {(firstDropdownValue === "noUSES" || firstDropdownValue === "checkUSES") && (
              <>
                <InputLabel sx={{ color: "black" }}>Save results to DB</InputLabel>
                <Select
                  name="save"
                  value={routineParams.save}
                  onChange={updateRoutineParam}
                  sx={{ width: 300, height: 40, mb: 2 }}
                >
                  <MenuItem value="true">true</MenuItem>
                  <MenuItem value="false">false</MenuItem>
                </Select>
              </>
            )}

            {firstDropdownValue === "updateUSES" && (
              <>
                <InputLabel sx={{ color: "black" }}>CMID (optional)</InputLabel>
                <TextField
                  name="cmid"
                  value={routineParams.cmid}
                  onChange={updateRoutineParam}
                  sx={{ width: 300, mb: 1 }}
                  size="small"
                  placeholder="Leave blank to run for entire database"
                />
                <Typography variant="caption" sx={{ display: "block", mb: 2 }}>
                  Uses the current admin page database (`{database}`). Provide one CMID to scope the run.
                </Typography>
              </>
            )}

            {firstDropdownValue === "validateJSON" && (
              <>
                <InputLabel sx={{ color: "black" }}>JSON property</InputLabel>
                <Select
                  name="property"
                  value={routineParams.property}
                  onChange={updateRoutineParam}
                  sx={{ width: 300, height: 40, mb: 2 }}
                >
                  <MenuItem value="parentContext">parentContext</MenuItem>
                  <MenuItem value="geoCoords">geoCoords</MenuItem>
                </Select>
              </>
            )}

            {firstDropdownValue === "reportChanges" && (
              <>
                <InputLabel sx={{ color: "black" }}>Start date (YYYY-MM-DD)</InputLabel>
                <TextField
                  name="dateStart"
                  value={routineParams.dateStart}
                  onChange={updateRoutineParam}
                  sx={{ width: 300, mb: 2 }}
                  size="small"
                />
                <InputLabel sx={{ color: "black" }}>End date (YYYY-MM-DD)</InputLabel>
                <TextField
                  name="dateEnd"
                  value={routineParams.dateEnd}
                  onChange={updateRoutineParam}
                  sx={{ width: 300, mb: 2 }}
                  size="small"
                />
                <InputLabel sx={{ color: "black" }}>Action</InputLabel>
                <TextField
                  name="action"
                  value={routineParams.action}
                  onChange={updateRoutineParam}
                  sx={{ width: 300, mb: 2 }}
                  size="small"
                />
                <InputLabel sx={{ color: "black" }}>User</InputLabel>
                <TextField
                  name="user"
                  value={routineParams.user}
                  onChange={updateRoutineParam}
                  sx={{ width: 300, mb: 2 }}
                  size="small"
                />
              </>
            )}

            {firstDropdownValue === "is_valid_json" && (
              <>
                <InputLabel sx={{ color: "black" }}>Value to validate</InputLabel>
                <TextField
                  name="value"
                  value={routineParams.value}
                  onChange={updateRoutineParam}
                  sx={{ width: "100%", maxWidth: 700, mb: 2 }}
                  size="small"
                  multiline
                  minRows={3}
                />
              </>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-start", pb: 2 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "green",
                  },
                }}
                onClick={runDatabaseRoutine}
              >
                Run Routine
              </Button>
            </Box>

            <InputLabel sx={{ color: "black" }}>Output</InputLabel>
            <TextField
              value={routineOutput}
              placeholder="Routine output will appear here."
              sx={{ width: "100%", maxWidth: 900, mb: 2 }}
              multiline
              minRows={8}
              InputProps={{ readOnly: true }}
            />
          </Box>
        )}
        {firstDropdownValue === "approve new users" && (
          <div>
            <Typography variant="p">Check for new users and approve them:</Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                pt: 1,
                pb: 1
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
                onClick={loadPendingUsersForApproval}
              >
                Check for new users{" "}
              </Button>
            </Box>

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
            }}>
              {users.length > 0 && <DataGrid
                sx={{
                  flexGrow: 1,
                  maxHeight: '100%',
                  overflow: 'auto'
                }}
                rows={users}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                checkboxSelection
                onRowSelectionModelChange={(newSelectionModel) => {
                  updateSelectedUserIds(newSelectionModel);
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
                  pt: 1,
                  pb: 1
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
                  onClick={approveSelectedUsers}
                >
                  Approve users{" "}
                </Button>
              </Box>
            }
            <Dialog open={popen} onClose={closeApprovalDialog}>
              <DialogContent>
                <p>{CMIDText}</p>
              </DialogContent>
            </Dialog>
          </div>)}
        </Box>
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

      <Dialog open={mergeConfirmOpen} onClose={() => setMergeConfirmOpen(false)}>
        <DialogTitle>Confirm Merge Nodes</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please confirm you want to merge these nodes:
          </Typography>
          <Typography><strong>Keep:</strong> {mergePreview.keep?.CMID} - {mergePreview.keep?.CMName}</Typography>
          <Typography><strong>Discard:</strong> {mergePreview.discard?.CMID} - {mergePreview.discard?.CMName}</Typography>
          <Typography sx={{ mt: 2 }}><strong>Primary domain:</strong> {mergePreview.keep?.primaryDomain}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeConfirmOpen(false)}>Cancel</Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => {
              setMergeConfirmOpen(false);
              submitAdminAction();
            }}
          >
            Confirm Merge
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={open} onClose={closeAmbiguousTiesModal}>
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
                <Button variant="contained" color="success" onClick={submitAdminAction}>
                  Submit
                </Button>
                <Button variant="outlined" color="secondary" onClick={postponeAmbiguousTieUpdate}>
                  Wait for later
                </Button>
              </Box>
            </Box>)
            : (<Box>
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
                            onChange={(e) => updateAmbiguousTieParentChoice(idx, e.target.value)}
                            size="small"
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
                <Button variant="contained" color="success" onClick={submitAmbiguousTieResolutions}>
                  Submit
                </Button>
                <Button variant="outlined" color="secondary" onClick={closeAmbiguousTiesModal}>
                  Cancel
                </Button>
              </Box>
            </Box>
            )}
        </Box>
      </Modal>
      <CardContent>
        <FooterLinks />
      </CardContent>

    </div>
  );
};

export default Admin;
