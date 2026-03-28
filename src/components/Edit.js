/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react'
import { Box, Button, IconButton, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Divider, Select, TextField, MenuItem, InputLabel, FormControl, FormGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Snackbar, Alert, LinearProgress } from '@mui/material';
import DatasetForm from './DatasetCreate';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from './AuthContext';
import { Dialog, DialogContent, DialogActions, DialogContentText, DialogTitle } from '@mui/material';
import domainFieldOptions from "./dropdown.json";
import { parseTabularFile } from '../utils/tabularUpload';
import SavedCmidInsertPopover from './SavedCmidInsertPopover';
import { downloadJsonAsXlsx, downloadSheetsAsXlsx } from '../utils/excelExport';
import {
  uploadInputNodes,
  getWaitingUSESStatus,
  getUploadInputNodesStatus,
  cancelUploadInputNodes,
  getUploadProperties,
} from '../api/editUploadApi';


const TEMPLATE_FILES = {
  dataset: { label: "New Dataset Nodes", file: "upload_new_datasets_template.xlsx" },
  nodes: { label: "New Category Nodes", file: "upload_new_categories_template.xlsx" },
  uses: { label: "New Uses Ties", file: "upload_new_uses_template.xlsx" },
  update_uses: { label: "Update Uses Ties", file: "update_uses_template.xlsx" },
};

const getInitialFormData = () => ({
  domain: '',
  subdomain: '',
  datasetID: '',
  cmNameColumn: '',
  categoryNamesColumn: '',
  alternateCategoryNamesColumns: [],
  cmidColumn: '',
  keyColumn: '',
});



const Edit = ({ database }) => {

  const { user, cred, authLevel } = useAuth();
  const [open, setOpen] = useState(false);
  const [node_open, setNodeOpen] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [IsDataset, setIsDataset] = useState(false);
  const [nodecount, setNodeCount] = useState(null);
  const [columns, setColumns] = useState(['dummy']);
  const [rows, setRows] = useState([]);
  const [viewUploadedData, setViewUploadedData] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [jsonData, setJsondata] = useState([]);
  const [, setLinkContext] = useState([]);
  const [download, setDownload] = useState(null);
  const [error, setError] = useState(null);
  const [fileDownload, setFileDownload] = useState('');
  const [loading, setLoading] = useState(false);
  const [missingCount, setMissingCount] = useState(0);
  const [missingCol, setMissingCol] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState('standard');
  const [advselectedOption, setadvSelectedOption] = useState('add_node');
  const [formData, setFormData] = useState(getInitialFormData);
  const [simpleDomainOptions, setSimpleDomainOptions] = useState([]);
  const [simpleSubdomainOptions, setSimpleSubdomainOptions] = useState([]);
  const [simpleDomainsData, setSimpleDomainsData] = useState([]);
  const [CMIDText, setCMIDText] = useState('The new dataset CMID is pending.');
  const [mergingType, setMergingType] = useState("0");
  const editStorageKey = `catmapper.edit.uploadState.${database || 'unknown'}`;
  let required = [];
  const foundColumns = [];
  const notFoundColumns = [];

  const handleClose = () => {
    setOpen(false);
  };

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [waitingUsesOpen, setWaitingUsesOpen] = useState(false);
  const [waitingUsesNotice, setWaitingUsesNotice] = useState('');
  const [waitingUsesSeverity, setWaitingUsesSeverity] = useState('info');
  const waitingUsesPollTimeoutRef = useRef(null);
  const uploadPollTimeoutRef = useRef(null);
  const [uploadTaskState, setUploadTaskState] = useState(null);
  const [uploadTaskId, setUploadTaskId] = useState('');
  const [uploadLogLines, setUploadLogLines] = useState([]);
  const [uploadCursor, setUploadCursor] = useState(0);
  const [cancelUploadPending, setCancelUploadPending] = useState(false);
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState('');
  const [availableNodeProperties, setAvailableNodeProperties] = useState([]);
  const [availableUsesProperties, setAvailableUsesProperties] = useState([]);
  const handleClose1 = () => {
    setOpenSnackbar(false); // Close the snackbar after user interaction
  };
  const handleWaitingUsesClose = () => {
    setWaitingUsesOpen(false);
  };

  const clearWaitingUsesPoll = () => {
    if (waitingUsesPollTimeoutRef.current) {
      clearTimeout(waitingUsesPollTimeoutRef.current);
      waitingUsesPollTimeoutRef.current = null;
    }
  };

  const clearUploadPoll = () => {
    if (uploadPollTimeoutRef.current) {
      clearTimeout(uploadPollTimeoutRef.current);
      uploadPollTimeoutRef.current = null;
    }
  };

  const showWaitingUsesNotice = (message, severity = 'info') => {
    setWaitingUsesNotice(message);
    setWaitingUsesSeverity(severity);
    setWaitingUsesOpen(true);
  };

  const appendUploadLogs = (events = []) => {
    if (!Array.isArray(events) || events.length === 0) return;
    setUploadLogLines((previous) => {
      const next = [...previous, ...events];
      return next.slice(-1000);
    });
  };

  const normalizeUploadResponseRows = (payload) => {
    if (!Array.isArray(payload?.file)) return null;
    if (!Array.isArray(payload?.order) || payload.order.length === 0) {
      return payload.file;
    }

    return payload.file.map((row) => {
      const orderedRow = {};
      payload.order.forEach((columnName) => {
        if (columnName in row) {
          orderedRow[columnName] = row[columnName];
        }
      });
      return orderedRow;
    });
  };

  const pollUploadTaskStatus = (taskId, cursor = 0) => {
    const pollDelayMs = 1500;
    clearUploadPoll();

    uploadPollTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await getUploadInputNodesStatus({
          cred,
          taskId,
          user,
          cursor,
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          setLoading(false);
          const message = payload?.error || 'Unable to read upload status.';
          setError(message);
          return;
        }

        const events = Array.isArray(payload?.events) ? payload.events : [];
        appendUploadLogs(events);
        const nextCursor = Number.isInteger(payload?.nextCursor)
          ? payload.nextCursor
          : cursor + events.length;
        setUploadCursor(nextCursor);
        setUploadTaskState(payload);

        const status = String(payload?.status || '').toLowerCase();
        if (status === 'queued' || status === 'running') {
          pollUploadTaskStatus(taskId, nextCursor);
          return;
        }

        setLoading(false);
        clearUploadPoll();

        if (status === 'completed') {
          const orderedData = normalizeUploadResponseRows(payload);
          if (orderedData) {
            setDownload(orderedData);
          }
          setCMIDText(payload?.message || 'Upload completed.');
          setPopen(true);
          if (payload?.waitingUsesTask) {
            showWaitingUsesNotice('Upload completed. Processing USES updates in the background.', 'info');
            pollWaitingUsesStatus(payload.waitingUsesTask);
          }
          return;
        }

        if (status === 'canceled') {
          setCMIDText(payload?.message || 'Upload canceled.');
          setPopen(true);
          return;
        }

        setError(payload?.error || 'Upload failed.');
      } catch (_error) {
        setLoading(false);
        setError('Unable to read upload status.');
      }
    }, pollDelayMs);
  };

  const handleCancelUpload = async () => {
    if (!uploadTaskId || cancelUploadPending) return;

    setCancelUploadPending(true);
    try {
      const response = await cancelUploadInputNodes({
        cred,
        taskId: uploadTaskId,
        user,
        cursor: uploadCursor,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || 'Unable to cancel upload.');
        return;
      }

      const events = Array.isArray(payload?.events) ? payload.events : [];
      appendUploadLogs(events);
      if (Number.isInteger(payload?.nextCursor)) {
        setUploadCursor(payload.nextCursor);
      }
      setUploadTaskState(payload);
    } catch (_error) {
      setError('Unable to cancel upload.');
    } finally {
      setCancelUploadPending(false);
    }
  };

  const pollWaitingUsesStatus = (taskId, attempt = 0) => {
    const maxAttempts = 240;
    const pollDelayMs = 5000;

    clearWaitingUsesPoll();
    waitingUsesPollTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await getWaitingUSESStatus({
          cred,
          taskId,
          user,
        });
        const statusPayload = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 404 && attempt < maxAttempts) {
            pollWaitingUsesStatus(taskId, attempt + 1);
            return;
          }

          const errorMessage = statusPayload?.error || 'Unable to read USES update status.';
          showWaitingUsesNotice(errorMessage, 'error');
          return;
        }

        const status = String(statusPayload?.status || '').toLowerCase();
        if (status === 'completed') {
          showWaitingUsesNotice(
            statusPayload?.message || 'USES update completed for this upload.',
            'success',
          );
          return;
        }

        if (status === 'failed') {
          showWaitingUsesNotice(
            statusPayload?.error || 'USES update failed after upload.',
            'error',
          );
          return;
        }

        if (attempt < maxAttempts) {
          pollWaitingUsesStatus(taskId, attempt + 1);
          return;
        }

        showWaitingUsesNotice(
          'Upload completed, but USES update is still running. Check again shortly.',
          'info',
        );
      } catch (_error) {
        if (attempt < maxAttempts) {
          pollWaitingUsesStatus(taskId, attempt + 1);
          return;
        }
        showWaitingUsesNotice('Unable to confirm USES update completion.', 'error');
      }
    }, pollDelayMs);
  };


  const handleFileDownload = (event) => {
    const key = event.target.value;
    setFileDownload(key);

    // 2. AUTOMATIC LOGIC: Look up the filename and download
    const selectedTemplate = TEMPLATE_FILES[key];
    if (selectedTemplate) {
      // Constructs the URL dynamically using the configured filename
      window.open(`/templates/${selectedTemplate.file}`, '_blank');
    }
    setTimeout(() => {
      setFileDownload("");
    }, 100);
  };

  const clearUploadState = () => {
    clearWaitingUsesPoll();
    clearUploadPoll();
    try {
      sessionStorage.removeItem(editStorageKey);
    } catch (_err) {
      // ignore storage errors
    }

    setShowFields(false);
    setIsDataset(false);
    setNodeCount(null);
    setColumns(['dummy']);
    setRows([]);
    setViewUploadedData(false);
    setPage(0);
    setRowsPerPage(10);
    setJsondata([]);
    setDownload(null);
    setError('');
    setFormData(getInitialFormData());
    setSelectedOption('standard');
    setadvSelectedOption('add_node');
    setSelectedColumns({});
    setMissingColumns([]);
    setExtraColumns([]);
    setSelectedExtraColumns([]);
    setSelectedExtraColumn('');
    setAllRequiredColumnsFound(false);
    setMissingCount(0);
    setMissingCol(0);
    setMergingType("0");
    setCMIDText('The new dataset CMID is pending.');
    setLoading(false);
    setCancelUploadPending(false);
    setUploadTaskState(null);
    setUploadTaskId('');
    setUploadLogLines([]);
    setUploadCursor(0);

    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  const closeUploadStatusModal = () => {
    clearUploadPoll();
    setCancelUploadPending(false);
    setUploadTaskState(null);
    setUploadTaskId('');
    setUploadLogLines([]);
    setUploadCursor(0);
  };


  const handleFileChange = async (e) => {
    setError("")
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert(`File size exceeds 50MB limit.`);
      return;
    }

    try {
      const parsed = await parseTabularFile(file, {
        checkMergedCells: true,
        stripWrappingQuotes: true,
        dropDuplicateHeaders: true,
      });
      if (Array.isArray(parsed.warnings) && parsed.warnings.length > 0) {
        alert(`Warning: ${parsed.warnings.join(' ')}`);
      }

      setColumns(parsed.headers);
      setRows(parsed.rows2d);

      const table = parsed.records.map((rowData, index) => ({
        ...rowData,
        key: index + 1,
      }));

      setNodeCount(table.length);

      await new Promise((resolve) => {
        setJsondata(table);
        setViewUploadedData(true);
        setShowFields(true);
        resolve();
      });
    } catch (error) {
      const msg = error?.message || 'Error processing file.';
      alert(msg);
      e.target.value = null;
    }
  };

  const handleChange = (e) => {
    console.log(e.target)
    const { name, value } = e.target;
    console.log(name)
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const getSimpleSubdomainsForDomain = (domainValue, domainsData) => {
    return domainsData.filter((item) => item.display === domainValue);
  };

  const handleSimpleDomainChange = (event) => {
    const nextDomain = event.target.value;
    const subdomains = getSimpleSubdomainsForDomain(nextDomain, simpleDomainsData);
    setSimpleSubdomainOptions(subdomains);
    setFormData((prev) => ({
      ...prev,
      domain: nextDomain,
      subdomain: subdomains[0]?.subdomain || '',
    }));
  };

  const handleSimpleSubdomainChange = (event) => {
    const nextSubdomain = event.target.value;
    setFormData((prev) => ({
      ...prev,
      subdomain: nextSubdomain,
    }));
  };

  const handleSimpleAltNamesColumnsChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      alternateCategoryNamesColumns: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  // Checks for:
  // - Duplicate column name values
  // - Missing values for datasetID,Key,label,CMID(except for function 1),mergingID,variableID,varName,categoryID
  // - Missing values for complex properties

  const validateColumns = () => {

    const seen = new Set();
    const duplicates = new Set();
    const emptyColumnCheck = ['datasetID', 'label', 'Key', 'mergingID', 'variableID', 'varName', 'categoryID']

    for (const col of emptyColumnCheck) {
      if (columns.includes(col)) {
        const colIndex = columns.indexOf(col);
        const hasMissing = rows.some(row => !row[colIndex]);

        console.log(col)
        console.log(colIndex)
        console.log(hasMissing)

        if (hasMissing) {
          setError(`${col} column contains missing values.`);
          return false;
        }
      }
    }

    columns.forEach((item) => {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    });

    if (duplicates.size > 0) {
      setError(`Duplicate column values found: ${[...duplicates].join(", ")}`);
      return false
    }



    if (["add_node", 'add_uses', 'update_add'].includes(advselectedOption)) {
      if (selectedExtraColumns.includes('longitude') && !selectedExtraColumns.includes('latitude')) {
        setError('Longitude requires Latitude to be present.');
        return false;
      }
      if (selectedExtraColumns.includes('latitude') && !selectedExtraColumns.includes('longitude')) {
        setError('Latitude requires Longitude to be present.');
        return false;
      }
      if (selectedExtraColumns.includes('eventType') && !selectedExtraColumns.includes('parent')) {
        setError('eventType requires parent to be present.');
        return false;
      }
      if (selectedExtraColumns.includes('eventDate')) {
        if (!selectedExtraColumns.includes('parent') || !selectedExtraColumns.includes('eventType')) {
          setError('eventDate requires both parent and eventType to be present.');
          return false;
        }
      }
    }

    if (advselectedOption === 'update_replace') {
      if (selectedExtraColumn === 'longitude' && !columns.includes('latitude')) {
        setError('Longitude requires Latitude to be present.');
        return false;
      }
      if (selectedExtraColumn === 'latitude' && !columns.includes('longitude')) {
        setError('Latitude requires Longitude to be present.');
        return false;
      }
      if (selectedExtraColumn === 'eventType' && !columns.includes('parent')) {
        setError('eventType requires parent to be present.');
        return false;
      }
      if (selectedExtraColumn === 'eventDate') {
        if (!columns.includes('parent') || !columns.includes('eventType')) {
          setError('eventDate requires both parent and eventType to be present.');
          return false;
        }
      }
    }

    if (advselectedOption !== "add_node") {

      if (columns.includes('CMID')) {
        const CMIDIndex = columns.indexOf('CMID');
        const count = rows.filter(row => !row[CMIDIndex]).length;

        if (advselectedOption === "add_uses") {
          setMissingCol("CMID")
          return count;
        }

        if (count > 0) {
          setError('CMID column contains missing values.');
          return false;
        }
      }

    }

    if (advselectedOption === "add_merging" && mergingType === "merging_ties_to_datasets") {

      if (columns.includes('stackID')) {
        const stackIDIndex = columns.indexOf('stackID');
        const count = rows.filter(row => !row[stackIDIndex]).length;
        setMissingCol("stackID")
        return count;
      }

    }

    setError('');
    return true;
  };

  const handleConfirm = (proceed) => {
    setOpenDialog(false);
    if (proceed) {
      continueWithSubmit();
    }
  };

  useEffect(() => {
    if (!database) return;

    const excluded = new Set([
      'DATASET',
      'DATASETS',
      'CATEGORY',
      'CATEGORIES',
      'ANY NODES',
      'ANY NODE',
      'ANY DOMAIN',
      'ALL DOMAINS',
      'ALL DOMAIN',
      'ALL NODES',
      'ALL NODE',
    ]);

    const loadSimpleDomains = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getDomains/${database}`);
        const data = await response.json();

        const normalized = (Array.isArray(data) ? data : [])
          .map((item) => ({
            display: String(item?.display || '').trim(),
            subdisplay: String(item?.subdisplay || '').trim(),
            subdomain: String(item?.subdomain || '').trim(),
            order: Number(item?.order ?? 9999),
            suborder: Number(item?.suborder ?? 9999),
          }))
          .filter((item) => item.display)
          .filter((item) => !excluded.has(item.display.toUpperCase()))
          .sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            if (a.suborder !== b.suborder) return a.suborder - b.suborder;
            return a.subdisplay.localeCompare(b.subdisplay);
          });

        const domains = [...new Set(normalized.map((item) => item.display))];
        setSimpleDomainsData(normalized);
        setSimpleDomainOptions(domains);

        setFormData((prev) => {
          const nextDomain = prev.domain && domains.includes(prev.domain) ? prev.domain : (domains[0] || '');
          const subdomains = getSimpleSubdomainsForDomain(nextDomain, normalized);
          const nextSubdomain = subdomains.some((item) => item.subdomain === prev.subdomain)
            ? prev.subdomain
            : (subdomains[0]?.subdomain || '');
          setSimpleSubdomainOptions(subdomains);
          return { ...prev, domain: nextDomain, subdomain: nextSubdomain };
        });
      } catch (err) {
        const staticDomains = Object.keys(domainFieldOptions).filter((value) => !excluded.has(String(value).toUpperCase()));
        const staticDomainRows = staticDomains.map((value) => ({
          display: value,
          subdisplay: value,
          subdomain: value,
          order: 9999,
          suborder: 9999,
        }));
        setSimpleDomainsData(staticDomainRows);
        setSimpleDomainOptions(staticDomains);

        setFormData((prev) => {
          const nextDomain = prev.domain && staticDomains.includes(prev.domain) ? prev.domain : (staticDomains[0] || '');
          const subdomains = getSimpleSubdomainsForDomain(nextDomain, staticDomainRows);
          const nextSubdomain = subdomains.some((item) => item.subdomain === prev.subdomain)
            ? prev.subdomain
            : (subdomains[0]?.subdomain || '');
          setSimpleSubdomainOptions(subdomains);
          return { ...prev, domain: nextDomain, subdomain: nextSubdomain };
        });
      }
    };

    loadSimpleDomains();
  }, [database]);

  useEffect(() => {
    if (!database) return;
    try {
      const raw = sessionStorage.getItem(editStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);

      if (Array.isArray(saved.columns) && Array.isArray(saved.rows) && Array.isArray(saved.jsonData)) {
        setColumns(saved.columns);
        setRows(saved.rows);
        setJsondata(saved.jsonData);
        setNodeCount(Number(saved.nodecount || saved.jsonData.length || 0));
        setShowFields(Boolean(saved.showFields));
        setViewUploadedData(Boolean(saved.viewUploadedData));
        setPage(Number(saved.page || 0));
        setRowsPerPage(Number(saved.rowsPerPage || 10));
      }

      if (saved.formData && typeof saved.formData === 'object') {
        setFormData((prev) => ({
          ...prev,
          ...saved.formData,
          alternateCategoryNamesColumns: Array.isArray(saved.formData.alternateCategoryNamesColumns)
            ? saved.formData.alternateCategoryNamesColumns
            : [],
        }));
      }

      if (saved.selectedOption) setSelectedOption(saved.selectedOption);
      if (saved.advselectedOption) setadvSelectedOption(saved.advselectedOption);
    } catch (_err) {
      // ignore invalid persisted data
    }
  }, [database]);

  useEffect(() => {
    if (!database || !showFields) return;
    try {
      const payload = {
        showFields,
        viewUploadedData,
        nodecount,
        columns,
        rows,
        jsonData,
        page,
        rowsPerPage,
        formData,
        selectedOption,
        advselectedOption,
      };
      sessionStorage.setItem(editStorageKey, JSON.stringify(payload));
    } catch (_err) {
      // storage quota exceeded or unavailable
    }
  }, [database, showFields, viewUploadedData, nodecount, columns, rows, jsonData, page, rowsPerPage, formData, selectedOption, advselectedOption]);

  useEffect(() => {
    return () => {
      clearWaitingUsesPoll();
      clearUploadPoll();
    };
  }, []);

  const validateSimpleWorkflow = () => {
    if (selectedOption !== "simple") return true;

    if (!formData.domain) {
      setError("Please select a domain.");
      return false;
    }
    if (!formData.subdomain) {
      setError("Please select a subdomain.");
      return false;
    }
    if (!formData.datasetID?.trim()) {
      setError("Please enter a Dataset CMID.");
      return false;
    }
    if (!/^(SD|AD)\d+$/i.test(formData.datasetID.trim())) {
      setError("Dataset CMID must be a DATASET ID (SD/AD).");
      return false;
    }
    if (!formData.cmNameColumn) {
      setError("Please select a CMName column.");
      return false;
    }
    if (!formData.keyColumn) {
      setError("Please select a Key column.");
      return false;
    }

    const requiredColumns = [formData.cmNameColumn, formData.keyColumn];
    if (formData.categoryNamesColumn) requiredColumns.push(formData.categoryNamesColumn);
    if (Array.isArray(formData.alternateCategoryNamesColumns) && formData.alternateCategoryNamesColumns.length > 0) {
      requiredColumns.push(...formData.alternateCategoryNamesColumns);
    }
    if (formData.cmidColumn) requiredColumns.push(formData.cmidColumn);

    const missingColumns = requiredColumns.filter((col) => !columns.includes(col));
    if (missingColumns.length > 0) {
      setError(`Selected columns not found in uploaded file: ${missingColumns.join(", ")}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSimpleWorkflow()) {
      return;
    }

    const validationResult = validateColumns();

    if (validationResult === false) {
      return;
    }

    if (typeof validationResult === 'number' && validationResult > 0) {
      setMissingCount(validationResult);
      setOpenDialog(true);
      return;
    }

    continueWithSubmit();
  }

  const continueWithSubmit = async () => {
    setLoading(true);
    setError('');
    setDownload(null);
    clearWaitingUsesPoll();
    clearUploadPoll();
    setCancelUploadPending(false);
    setUploadTaskState(null);
    setUploadTaskId('');
    setUploadLogLines([]);
    setUploadCursor(0);

    try {

      const columnsToUse = advselectedOption === 'update_replace' || advselectedOption === 'node_replace' ? [selectedExtraColumn] : selectedExtraColumns;

      if (advselectedOption === 'update_replace') {
        if (columnsToUse[0] === "longitude") {
          columnsToUse.push('latitude')
        }
        if (columnsToUse[0] === "latitude") {
          columnsToUse.push('longitude')
        }
      }

      const allowedColumns = new Set([
        ...Object.keys(selectedColumns).filter(col => selectedColumns[col]),
        ...columnsToUse,
      ]);

      if (advselectedOption === "add_uses" && missingCount > 0) {
        allowedColumns.add("CMName");
      }

      const finalProduct = selectedOption === "standard"
        ? jsonData.map(item => {
          const filteredItem = {};

          allowedColumns.forEach(col => {
            //if (item[col] !== undefined) {
            filteredItem[col] = item[col];
            //}
          });

          return filteredItem;
        }) : jsonData;

      console.log(`${process.env.REACT_APP_API_URL}`)

      const response = await uploadInputNodes({
        cred,
        payload: {
          formData: formData,
          database: database,
          df: finalProduct,
          so: selectedOption,
          ao: advselectedOption,
          addoptions: addiColumns,
          user: user,
          allContext: columnsToUse,
          mergingType: mergingType
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setLoading(false);
        setError(result?.error || 'Error submitting upload request.');
        return;
      }

      if (result?.taskId) {
        setUploadTaskId(result.taskId);
        setUploadTaskState(result);
        pollUploadTaskStatus(result.taskId, 0);
        return;
      }

      setLoading(false);
      setError('Upload task did not start.');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error submitting upload request.');
      setLoading(false);
    }
  };

  const [popen, setPopen] = useState(false);

  const handlePclose = () => {
    setPopen(false);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleadvOptionChange = (event) => {
    setadvSelectedOption(event.target.value);
  };

  const standardOptionHelpText = {
    add_node: 'Create a new node for each row. Use when each row represents a distinct new node.',
    node_add: 'Update existing node properties by adding values without replacing current values.',
    node_replace: 'Update one existing node property by replacing its value. Replace mode supports one property column.',
    add_uses: 'Create USES ties for rows and include new or existing nodes. Rows can be aggregated by datasetID, CMID, and Key.',
    update_add: 'Update existing USES ties by adding values without removing current values.',
    update_replace: 'Replace one property on existing USES ties. Replace mode supports one property column.',
    add_merging: 'Create merging ties for rows in the upload file.',
    merging_add: 'Update existing merging tie properties by adding values without replacing current values.',
    merging_replace: 'Replace one property on an existing merging tie. Replace mode supports one property column.',
  };

  const fetchAvailableUploadProperties = async () => {
    if (!database) {
      setPropertiesError('Database is not selected.');
      return;
    }

    setPropertiesLoading(true);
    setPropertiesError('');
    try {
      const response = await getUploadProperties({
        cred,
        database: String(database).toLowerCase(),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPropertiesError(payload?.error || 'Unable to load available properties.');
        return;
      }

      setAvailableNodeProperties(Array.isArray(payload?.nodeProperties) ? payload.nodeProperties : []);
      setAvailableUsesProperties(Array.isArray(payload?.usesProperties) ? payload.usesProperties : []);
    } catch (_error) {
      setPropertiesError('Unable to load available properties.');
    } finally {
      setPropertiesLoading(false);
    }
  };

  const openPropertiesModal = async () => {
    setPropertiesModalOpen(true);
    await fetchAvailableUploadProperties();
  };

  const closePropertiesModal = () => {
    setPropertiesModalOpen(false);
  };

  const downloadAvailableProperties = async () => {
    const normalizedNodeRows = (availableNodeProperties || []).map((item) => ({
      property: item?.property || '',
      description: item?.description || '',
    }));
    const normalizedUsesRows = (availableUsesProperties || []).map((item) => ({
      property: item?.property || '',
      description: item?.description || '',
    }));

    const dbName = String(database || 'database').toLowerCase();
    await downloadSheetsAsXlsx(
      [
        {
          sheetName: 'Node Properties',
          headers: ['property', 'description'],
          rows: normalizedNodeRows.length > 0 ? normalizedNodeRows : [],
        },
        {
          sheetName: 'USES Properties',
          headers: ['property', 'description'],
          rows: normalizedUsesRows.length > 0 ? normalizedUsesRows : [],
        },
      ],
      { fileName: `${dbName}_upload_properties.xlsx` }
    );
  };

  const SimpleFieldInfoButton = ({ helpText }) => (
    <Tooltip title={helpText} arrow>
      <IconButton
        size="small"
        aria-label="Field help"
        sx={{ ml: 0.5, p: 0.25 }}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <InfoIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  );

  const StandardOptionLabel = ({ label, helpText }) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <span>{label}</span>
      <SimpleFieldInfoButton helpText={helpText} />
    </Box>
  );

  useEffect(() => {
    setAvailableNodeProperties([]);
    setAvailableUsesProperties([]);
    setPropertiesError('');
  }, [database]);

  const [selectedColumns, setSelectedColumns] = useState({});
  const [missingColumns, setMissingColumns] = useState([]);
  const [extraColumns, setExtraColumns] = useState([]);
  const [selectedExtraColumns, setSelectedExtraColumns] = useState([]);
  const [selectedExtraColumn, setSelectedExtraColumn] = useState('');
  const [allRequiredColumnsFound, setAllRequiredColumnsFound] = useState(false);

  let allowedExtraColumns = ["descriptor", "Dataset", "log", "country", "dateEnd", "dateStart", "district", "eventDate", "eventType",
    "geoCoords", "Key", "NewKey", "label", "latitude", "longitude", "ignoreNames", "Name", "parent", "period", "parentContext", "propertyValues",
    "rawDate", "Rfunction", "Rtransform", "recordEnd", "recordStart", "sampleSize", "transform", "categoryType", "url", "variableDescription", "variable",
    "yearEnd", "yearStart", "language", "populationEstimate", "religion", "geoPolygon", "glottocode", "FIPS", "ISO2", "ISO3", "ISONumeric", "comment",
    "polity", "occupation", "culture", "yearPublished", "stackID", "stackTransform", "summaryStatistic", "datasetTransform"]
  let allowedDatasetColumns = []

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (columns.length === 0 || rows.length === 0) return;

    const cmidColumn = columns.indexOf('CMID');
    if (cmidColumn !== -1) {
      const firstRowCMID = rows[0][cmidColumn];
      setIsDataset(firstRowCMID?.startsWith("SD") || firstRowCMID?.startsWith("AD"));
    }

    setSelectedColumns({});
    setMissingColumns([]);
    setExtraColumns([]);
    setAllRequiredColumnsFound(false);

    switch (advselectedOption) {
      case 'add_node':
        required = ['CMName', 'Name', 'Key', 'label', 'datasetID'];
        const labelIndex = columns.indexOf('label');
        if (labelIndex !== -1) {
          const allowedDatasetLabels = ['DATASET', 'MERGING', 'STACK'];
          const datasetValueFound = rows.some(row => allowedDatasetLabels.includes(row[labelIndex]));
          if (datasetValueFound) {
            required = ['CMName', 'label', 'shortName', 'DatasetCitation'];
            allowedDatasetColumns = ["CMID", "CMName", "DatasetCitation", "DatasetLocation", "DatasetScope", "DatasetVersion",
              "District", "log", "names", "Note", "parent", "project", "recordStart", "recordEnd", "shortName", "Subdistrict", "Subnational", "Unit", "yearPublished"]

          }
        }

        break;
      case 'add_uses':
        required = ['CMID', 'Name', 'Key', 'label', 'datasetID'];
        break;
      case 'update_add':
      case 'update_replace':
        required = ['CMID', 'Key', 'datasetID'];
        break;
      case 'node_add':
        required = ['CMID'];
        if (IsDataset) {
          allowedDatasetColumns = ["CMName", "parent", "District", "shortName", "DatasetCitation", "DatasetLocation", "DatasetVersion", "DatasetScope", "project", "recordStart", "recordEnd", "yearPublished", "names"]
        }
        else {
          allowedExtraColumns = ["CMName", "glottocode", "FIPS", "ISO2", "ISO3", "ISONumeric"]
        }
        break;
      case 'node_replace':
        required = ['CMID'];
        if (IsDataset) {
          allowedDatasetColumns = ["CMName", "parent", "District", "shortName", "DatasetCitation", "DatasetLocation", "DatasetVersion", "DatasetScope", "project", "recordStart", "recordEnd", "yearPublished"]
        }
        else {
          allowedExtraColumns = ["CMName", "glottocode", "FIPS", "ISO2", "ISO3", "ISONumeric"]
        }
        break;
      case 'add_merging':
        {

          const cols = columns.map(c => c.trim());

          // if variableID is present, then uploading merging ties to variables
          if (cols.includes("variableID")) {
            setMergingType("merging_ties_to_variables")
            required = ["mergingID", "datasetID", "variableID", "varName"];
          }

          // if categoryID is present, but no variableID then assume equivalence ties
          else if (cols.includes("categoryID")) {
            setMergingType("equivalence_ties")

            const keyColumns = cols.filter(c => c.startsWith("Key_"));

            if (keyColumns.length === 2) {
              const [key1, key2] = keyColumns;
              required = ["mergingID", "categoryID", key1, key2];
            } else if (cols.includes("datasetID")) {
              required = ["mergingID", "categoryID", "Key", "datasetID"];
            }
            else {
              setError("Not all required columns are present.");
              return false;
            }
          }

          // if neither variableID or categoryID are present, then uploading merging ties to datasets
          else {
            setMergingType("merging_ties_to_datasets")
            required = ["mergingID", "datasetID"];
          }
          break;
        }
      case 'merging_add':
      case 'merging_replace':
        {

          const cols = columns.map(c => c.trim());

          if (cols.includes("variableID")) {

            setMergingType("merging_ties_to_variables");
            required = ["variableID", "stackID"]

            if (cols.includes("datasetTransform")) {
              required = ["datasetID", "variableID", "stackID"];
            }
          }

          else if (cols.includes("categoryID1") && cols.includes("categoryID2")) {
            setError("Adding or replacing proeprties for existing equivalence ties is not permitted for now.");
            return false;
          }
          else {
            if (advselectedOption !== 'add_merging') {
              setError("Nothing to update for this type of merging tie.");
              return false;
            }
          }
          break;
        }

      default:
        required = [];
    }

    //  Checks that all required columns are present
    required.forEach((column) => {
      if (columns.includes(column)) {
        foundColumns.push(column);
      } else {
        notFoundColumns.push(column);
      }
    });

    // when uploading categories, if CMName is absent, use Name column and vice versa.
    // Name and CMName columns are added in the backend
    if (advselectedOption === "add_node") {
      const hasName = columns.includes("Name");
      const hasCMName = columns.includes("CMName");

      // If it has one but not the other, push whichever exists
      if (hasName !== hasCMName) {
        if (hasName) {
          foundColumns.push("CMName");
          const index = notFoundColumns.indexOf("CMName");
          if (index > -1) {
            notFoundColumns.splice(index, 1);
          }
        };
        if (hasCMName) {
          foundColumns.push("Name");
          const index = notFoundColumns.indexOf("Name");
          if (index > -1) {
            notFoundColumns.splice(index, 1);
          }
        };
      };
    }

    setMissingColumns(notFoundColumns);
    setAllRequiredColumnsFound(notFoundColumns.length === 0);

    if (['add_node', 'add_uses', 'update_add', 'update_replace', 'node_add', 'node_replace', 'add_merging', 'merging_add', 'merging_replace'].includes(advselectedOption)) {
      let extraCols = columns.filter((col) => {
        return !required.includes(col)
      });

      if (allowedDatasetColumns.length > 0) {
        extraCols = extraCols.filter((col) => allowedDatasetColumns.includes(col));
      } else {
        extraCols = extraCols.filter((col) => allowedExtraColumns.includes(col));
      }

      if (advselectedOption === 'update_add') {
        extraCols = extraCols.filter((col) => col !== 'label');
      }

      setExtraColumns(extraCols);
      setSelectedExtraColumns(extraCols)
      setLinkContext(extraCols)
    } else {
      setExtraColumns([]);
    }

    const selectedColumns = required.reduce((acc, column) => {
      acc[column] = foundColumns.includes(column);
      return acc;
    }, {});

    setSelectedColumns(selectedColumns);
  }, [columns, rows, advselectedOption]);

  const [addiColumns, setaddiColumns] = useState({
    district: false,
    recordyear: false,
  });

  const handleCheckboxChange = (event) => {
    setaddiColumns({
      ...addiColumns,
      [event.target.name]: event.target.checked,
    });
  };

  const handleviewCheckboxChange = (event) => {
    setViewUploadedData(event.target.checked);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExtraColumnsChange = (event) => {
    setSelectedExtraColumns(event.target.value);
    setLinkContext(event.target.value)
  };

  const handleSingleExtraColumnChange = (event) => {
    setSelectedExtraColumn(event.target.value);
    setLinkContext([event.target.value])
  };

  const handleDownload = async () => {
    if (!download) {
      setError('No file data available for download.');
      return;
    }
    await downloadJsonAsXlsx(download, {
      fileName: 'uploaded_Dataset.xlsx',
      sheetName: 'Dataset',
    });
  };

  const uploadTaskStatus = String(uploadTaskState?.status || '').toLowerCase();
  const uploadStatusModalOpen =
    Boolean(uploadTaskState) &&
    (uploadTaskStatus === '' || uploadTaskStatus === 'queued' || uploadTaskStatus === 'running' || uploadTaskStatus === 'failed');
  const uploadPercent = Math.max(0, Math.min(100, Number(uploadTaskState?.progress?.percent ?? 0)));

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3 }} style={{ marginBottom: "50px" }}>
        <h4 style={{ color: 'black', padding: "2px" }}>Download spreadsheet templates here for specific kinds of uploads (dataset nodes, category nodes, and adding and updating USES ties):</h4>
        <br />
        <FormControl sx={{ width: "12vw", mr: "1vw" }} variant="outlined">
          <InputLabel id="dropdown-label">Download:</InputLabel>
          <Select
            labelId="dropdown-label"
            id="dropdown-select"
            value={fileDownload}
            onChange={handleFileDownload}
            label="Download:"
          >
            {/* 3. DYNAMIC RENDER: Generate MenuItems from your config */}
            {Object.entries(TEMPLATE_FILES).map(([key, data]) => (
              <MenuItem key={key} value={key}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white', 
        '&:hover': {
          backgroundColor: 'green', 
        },
      }}  onClick={handleOpen1}>
          Download Template
        </Button> */}
        {/* <Typography variant="body2" color="textSecondary" sx={{backgroundColor: 'lightblue', padding: '1em',borderRadius: '4px',display: 'inline-block',marginLeft:"10px"}}>
          {CMIDText}
        </Typography> */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleClose1}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleClose1} severity="info" sx={{ width: '100%' }}>
            Under Construction
          </Alert>
        </Snackbar>
      </Box>
      <Typography variant="h6" style={{ fontWeight: "bolder" }}>
        Use translated file or import file to upload
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ mb: 2 }}>
        <h3 style={{ color: 'black', fontWeight: "bold", padding: "2px" }}> Choose file to import</h3>

        <input id="fileInput" style={{ color: 'black', fontWeight: "bold", marginLeft: 7, padding: "2px" }} type="file" accept=".csv,.tsv,.xlsx" onChange={handleFileChange} />
      </Box>
      {showFields && <Typography variant="body2">{`Number of nodes to import: ${nodecount}`}</Typography>}
      <FormControlLabel
        control={<Checkbox checked={viewUploadedData} onChange={handleviewCheckboxChange} name="viewUploadedData" />}
        label="View uploaded data?"
        sx={{ my: 2 }}
      />

      {viewUploadedData && rows.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell key={index}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {/*{row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}*/}
                    {columns.map((column, columnIndex) => (
                      <TableCell key={columnIndex}>
                        {row[columnIndex] !== undefined && row[columnIndex] !== null
                          ? row[columnIndex]
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
      <br />
      <h4 style={{ color: 'black', padding: "2px" }}>Choose :</h4>
      <RadioGroup defaultValue="standard" name="uploadOption" sx={{ mb: 2 }} onChange={handleOptionChange}>
        <FormControlLabel value="standard" control={<Radio />} label="Standard" />
        <FormControlLabel value="simple" control={<Radio />} label="Simple" />
      </RadioGroup>

      {showFields && selectedOption === "simple" && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel id="domain-label" style={{ color: "black " }}>
                Select the <strong>domain</strong> for this upload:
              </InputLabel>
              <SimpleFieldInfoButton helpText="Used when assigning category labels. If Subdomain is selected, Subdomain becomes the upload label; otherwise Domain is used." />
            </Box>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleSimpleDomainChange}
              sx={{ width: 300, height: 40 }}
              margin="normal"
            >
              {simpleDomainOptions.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel id="subdomain-label" style={{ color: "black " }}>
                Select the <strong>subdomain</strong> for this upload:
              </InputLabel>
              <SimpleFieldInfoButton helpText="If provided, this is the exact label written to each uploaded row (it overrides Domain for label assignment)." />
            </Box>
            <br />
            <Select
              labelId="subdomain-label"
              id="subdomain"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleSimpleSubdomainChange}
              sx={{ width: 300, height: 40 }}
              margin="normal"
            >
              {simpleSubdomainOptions.map((item) => (
                <MenuItem key={`${item.subdomain}-${item.subdisplay}`} value={item.subdomain}>
                  {item.subdisplay || item.subdomain}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel id="domain-label" style={{ color: "black " }}>
                Enter the <strong>Dataset CMID</strong>:
              </InputLabel>
              <SimpleFieldInfoButton helpText="Mapped to datasetID for every uploaded row. Must be a dataset CMID such as SD... or AD...." />
            </Box>
            <TextField
              name="datasetID"
              value={formData.datasetID}
              onChange={handleChange}
              sx={{ width: 300, height: 40 }}
              variant="outlined"
              margin="normal"
            />
            <Box sx={{ mt: 1 }}>
              <SavedCmidInsertPopover
                user={user}
                cred={cred}
                database={database}
                datasetOnly
                title="Insert Dataset from Bookmarks/History"
                onInsert={(cmid) =>
                  setFormData((prev) => ({
                    ...prev,
                    datasetID: cmid,
                  }))
                }
              />
            </Box>
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel id="domain-label" style={{ color: "black " }}>
                Select the column for <strong>CMName</strong>:
              </InputLabel>
              <SimpleFieldInfoButton helpText="This column is mapped to CMName in the upload payload. It identifies the category/node name used during node creation or updates." />
            </Box>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="cmNameColumn"
              value={formData.cmNameColumn}
              onChange={handleChange}
              sx={{ width: 300, height: 40 }}
              margin="normal"
            >
              {columns.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel id="domain-label" style={{ color: "black " }}>
                Select the column for <strong>category names</strong>:
              </InputLabel>
              <SimpleFieldInfoButton helpText="Mapped to Name in the upload payload. If left blank, Name is auto-filled from the selected CMName column." />
            </Box>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="categoryNamesColumn"
              value={formData.categoryNamesColumn}
              onChange={handleChange}
              sx={{ width: 300, height: 40 }}
              margin="normal"
            >
              {columns.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel id="domain-label" style={{ color: "black " }}>
                Select column(s) for <strong>alternate category names</strong>:
              </InputLabel>
              <SimpleFieldInfoButton helpText="Selected columns are combined into one altNames value per row and joined with semicolons during upload." />
            </Box>
            <br />
            <Select
              multiple
              labelId="domain-label"
              id="domain"
              name="alternateCategoryNamesColumns"
              value={formData.alternateCategoryNamesColumns}
              onChange={handleSimpleAltNamesColumnsChange}
              renderValue={(selected) => selected.join(', ')}
              sx={{ width: 300, height: 40 }}
              margin="normal"
            >
              {columns.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel id="domain-label" style={{ color: "black " }}>
                Select the column for <strong>CMID</strong> (optional):
              </InputLabel>
              <SimpleFieldInfoButton helpText="Mapped to CMID. Leave blank to create new categories; provide a CMID column to target existing categories." />
            </Box>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="cmidColumn"
              value={formData.cmidColumn}
              onChange={handleChange}
              sx={{ width: 300, height: 40 }}
              margin="normal"
            >
              {columns.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <br />
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel id="domain-label" style={{ color: "black " }}>
                Select the column for <strong>Key</strong>:
              </InputLabel>
              <SimpleFieldInfoButton helpText="This selected column is mapped to Key and then formatted by the backend createKey function into CatMapper key format before validation and upload." />
            </Box>
            <br />
            <Select
              labelId="domain-label"
              id="domain"
              name="keyColumn"
              value={formData.keyColumn}
              onChange={handleChange}
              sx={{ width: 300, height: 40 }}
              margin="normal"
            >
              {columns.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      )}
      {showFields && selectedOption === "standard" && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
              Select option
            </Typography>
            <SimpleFieldInfoButton helpText="Choose the upload behavior first. This controls required columns and whether values are added or replaced." />
          </Box>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 0.5, mb: 1.5 }}
            onClick={openPropertiesModal}
          >
            View Available Properties
          </Button>
          <RadioGroup defaultValue="add_node" name="advuploadOption" sx={{ mb: 2 }} onChange={handleadvOptionChange}>
            <Typography variant="subtitle2" sx={{ mt: 2, color: "black", fontWeight: "bold" }}>Nodes</Typography>
            <FormControlLabel
              value="add_node"
              control={<Radio />}
              label={<StandardOptionLabel label="Adding new node for every row" helpText={standardOptionHelpText.add_node} />}
            />
            <FormControlLabel
              value="node_add"
              control={<Radio />}
              label={<StandardOptionLabel label="Updating existing Node properties--add or add to properties" helpText={standardOptionHelpText.node_add} />}
            />
            {authLevel === 2 && (
              <FormControlLabel
                value="node_replace"
                control={<Radio />}
                label={<StandardOptionLabel label="Updating existing Node properties--replace one property" helpText={standardOptionHelpText.node_replace} />}
              />
            )}
            <Typography variant="subtitle2" sx={{ mt: 2, color: "black", fontWeight: "bold" }}>Uses ties</Typography>
            <FormControlLabel
              value="add_uses"
              control={<Radio />}
              label={<StandardOptionLabel label="Adding new uses ties (with old or new nodes)" helpText={standardOptionHelpText.add_uses} />}
            />
            <FormControlLabel
              value="update_add"
              control={<Radio />}
              label={<StandardOptionLabel label="Updating existing USES only--add or add to properties" helpText={standardOptionHelpText.update_add} />}
            />
            {authLevel === 2 && (
              <FormControlLabel
                value="update_replace"
                control={<Radio />}
                label={<StandardOptionLabel label="Updating existing USES only--replace one property" helpText={standardOptionHelpText.update_replace} />}
              />
            )}
            <Typography variant="subtitle2" sx={{ mt: 2, color: "black", fontWeight: "bold" }}>Merging & Equivalence ties</Typography>
            <FormControlLabel
              value="add_merging"
              control={<Radio />}
              label={<StandardOptionLabel label="Adding new merging ties for every row" helpText={standardOptionHelpText.add_merging} />}
            />
            <FormControlLabel
              value="merging_add"
              control={<Radio />}
              label={<StandardOptionLabel label="Updating existing Merging tie properties--add or add to properties" helpText={standardOptionHelpText.merging_add} />}
            />
            {authLevel === 2 && (
              <FormControlLabel
                value="merging_replace"
                control={<Radio />}
                label={<StandardOptionLabel label="Updating existing Merging tie properties--replace one property" helpText={standardOptionHelpText.merging_replace} />}
              />
            )}
          </RadioGroup>

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            {missingColumns.length > 0 && (
              <Typography color="red !important" variant="body2" sx={{ mb: 2 }}>
                Error: Missing the following required columns: {missingColumns.join(', ')}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
                Required Columns:
              </Typography>
              <SimpleFieldInfoButton helpText="These columns are required for the selected upload option. Upload is blocked until all required columns are present in the file." />
            </Box>
            <FormGroup>
              {Object.keys(selectedColumns).map((column) => (
                <FormControlLabel
                  key={column}
                  control={
                    <Checkbox
                      checked={selectedColumns[column]}
                      disabled={true} // Grays out and disables the checkbox
                    />
                  }
                  label={column}
                />
              ))}
            </FormGroup>
          </FormControl>
          <Snackbar
            open={node_open}
            autoHideDuration={7000}
            onClose={() => setNodeOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={() => setNodeOpen(false)} severity="error" sx={{ width: "100%" }}>
              You cannot add property data for Category Nodes.
            </Alert>
          </Snackbar>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <Dialog open={openDialog} onClose={() => handleConfirm(false)}>
            <DialogTitle>Missing {missingCol} Values</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {missingCol} column contains {missingCount} missing values, hence {missingCount} new nodes will be created. Do you want to proceed?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleConfirm(false)} color="error">No</Button>
              <Button onClick={() => handleConfirm(true)} color="primary">Yes</Button>
            </DialogActions>
          </Dialog>

          <br />
          {["add_node", 'add_uses', 'update_add', 'add_merging'].includes(advselectedOption) && extraColumns.length > 0 && allRequiredColumnsFound && (
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
                  Choose columns to enter as properties:
                </Typography>
                <SimpleFieldInfoButton helpText="Select uploaded columns that should be written as properties on the target node or tie." />
              </Box>
              <Select
                multiple
                value={selectedExtraColumns}
                onChange={handleExtraColumnsChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {extraColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}
          {advselectedOption === 'update_replace' && extraColumns.length > 0 && allRequiredColumnsFound && (
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
                  Choose column to replace property:
                </Typography>
                <SimpleFieldInfoButton helpText="Replace mode updates one property only. Choose the single uploaded column to use for replacement." />
              </Box>
              <br />
              <Select
                value={selectedExtraColumn}
                onChange={handleSingleExtraColumnChange}
                style={{ width: "10vw" }}
              >
                {extraColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}
          {advselectedOption === 'node_add' && extraColumns.length > 0 && IsDataset && allRequiredColumnsFound && (
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
                  Choose columns to enter as properties:
                </Typography>
                <SimpleFieldInfoButton helpText="Select uploaded columns that should be written as properties on dataset nodes." />
              </Box>
              <Select
                multiple
                value={selectedExtraColumns}
                onChange={handleExtraColumnsChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {extraColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}
          {advselectedOption === 'node_replace' && extraColumns.length > 0 && allRequiredColumnsFound && (
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
                  Choose column to replace property:
                </Typography>
                <SimpleFieldInfoButton helpText="Replace mode updates one node property only. Choose the single uploaded column to use for replacement." />
              </Box>
              <br />
              <Select
                value={selectedExtraColumn}
                onChange={handleSingleExtraColumnChange}
                style={{ width: "7vw" }}
              >
                {extraColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}
          {advselectedOption === 'merging_add' && extraColumns.length > 0 && allRequiredColumnsFound && (
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
                  Choose columns to enter as properties:
                </Typography>
                <SimpleFieldInfoButton helpText="Select uploaded columns that should be written as properties on merging ties." />
              </Box>
              <Select
                multiple
                value={selectedExtraColumns}
                onChange={handleExtraColumnsChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {extraColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}
          {advselectedOption === 'merging_replace' && extraColumns.length > 0 && allRequiredColumnsFound && (
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
                  Choose column to replace property:
                </Typography>
                <SimpleFieldInfoButton helpText="Replace mode updates one merging tie property only. Choose the single uploaded column to use for replacement." />
              </Box>
              <br />
              <Select
                value={selectedExtraColumn}
                onChange={handleSingleExtraColumnChange}
                style={{ width: "7vw" }}
              >
                {extraColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}
          <br />
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="h4" sx={{ color: 'black', fontWeight: 'bold', p: '2px' }}>
                Add from Dataset Properties:
              </Typography>
              <SimpleFieldInfoButton helpText="These options copy values from dataset metadata onto upload results. They are not read from the uploaded row columns." />
            </Box>
            <FormGroup>
              <FormControlLabel
                value="district"
                control={<Checkbox checked={addiColumns.district} onChange={handleCheckboxChange} name="district" />}
                label="area"
              />
              <FormControlLabel
                value="recordyear"
                control={<Checkbox checked={addiColumns.recordyear} onChange={handleCheckboxChange} name="recordyear" />}
                label="record year"
              />
            </FormGroup>
          </FormControl>

        </Box>
      )}
      {error && (
        <Typography sx={{ mb: 2, color: "red !important" }}>
          {error}
        </Typography>
      )}
      <Button variant="contained" sx={{
        backgroundColor: 'black',
        color: 'white',
        '&:hover': {
          backgroundColor: 'green',
        },
      }} onClick={handleSubmit} disabled={loading}>
        UPLOAD
      </Button>
      <Button variant="outlined" sx={{ ml: "1vw" }} onClick={clearUploadState}>
        CLEAR UPLOAD
      </Button>
      <Dialog
        open={uploadStatusModalOpen}
        maxWidth="md"
        fullWidth
        aria-labelledby="upload-progress-dialog-title"
      >
        <DialogTitle id="upload-progress-dialog-title">
          {uploadTaskStatus === 'failed' ? 'Upload Failed' : 'Upload In Progress'}
        </DialogTitle>
        <DialogContent>
          {uploadTaskStatus === 'failed' && (
            <Typography variant="body2" sx={{ mb: 1.5, color: 'error.main', fontWeight: 600 }}>
              {uploadTaskState?.error || 'Upload failed.'}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mb: 1 }}>
            Batch {uploadTaskState?.progress?.completedBatches ?? 0} of {uploadTaskState?.progress?.totalBatches ?? 0}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={uploadPercent}
            sx={{ mb: 1.5 }}
          />
          <Typography variant="caption" sx={{ display: 'block', mb: 1.5 }}>
            {uploadPercent}% complete
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancelUpload}
            disabled={
              cancelUploadPending ||
              !uploadTaskId ||
              (uploadTaskStatus !== 'queued' && uploadTaskStatus !== 'running')
            }
            sx={{ mb: 1.5 }}
          >
            {cancelUploadPending ? 'Canceling...' : 'Cancel Upload'}
          </Button>
          <Box
            sx={{
              mt: 1,
              p: 1.25,
              maxHeight: 260,
              overflowY: 'auto',
              border: '1px solid #ccc',
              backgroundColor: '#fafafa',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {uploadLogLines.length > 0 ? uploadLogLines.join('\n') : 'Waiting for upload logs...'}
          </Box>
        </DialogContent>
        {uploadTaskStatus === 'failed' && (
          <DialogActions>
            <Button onClick={closeUploadStatusModal} variant="contained">Close</Button>
          </DialogActions>
        )}
      </Dialog>
      <Dialog
        open={propertiesModalOpen}
        onClose={closePropertiesModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Available Upload Properties ({String(database || '').toLowerCase()})
        </DialogTitle>
        <DialogContent>
          {propertiesLoading && (
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              Loading available properties...
            </Typography>
          )}
          {propertiesError && (
            <Typography variant="body2" sx={{ mb: 1.5, color: 'red !important' }}>
              {propertiesError}
            </Typography>
          )}

          {!propertiesLoading && !propertiesError && (
            <Box>
              <Typography variant="subtitle1" sx={{ mt: 0.5, mb: 1, color: 'black', fontWeight: 'bold' }}>
                Node Properties
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>property</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableNodeProperties.length > 0 ? (
                      availableNodeProperties.map((item, index) => (
                        <TableRow key={`node-prop-${index}`}>
                          <TableCell>{item?.property || ''}</TableCell>
                          <TableCell>{item?.description || ''}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2}>No node properties available.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle1" sx={{ mt: 0.5, mb: 1, color: 'black', fontWeight: 'bold' }}>
                USES Tie Properties
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>property</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableUsesProperties.length > 0 ? (
                      availableUsesProperties.map((item, index) => (
                        <TableRow key={`uses-prop-${index}`}>
                          <TableCell>{item?.property || ''}</TableCell>
                          <TableCell>{item?.description || ''}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2}>No USES tie properties available.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={downloadAvailableProperties}
            disabled={propertiesLoading || (!!propertiesError)}
          >
            Download Properties
          </Button>
          <Button onClick={closePropertiesModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Button variant="contained" disabled={!download} sx={{
        backgroundColor: 'black',
        ml: "1vw",
        color: 'white',
        '&:hover': {
          backgroundColor: 'green',
        },
      }} onClick={handleDownload}>
        Download
      </Button>

      <DatasetForm open={open} handleClose={handleClose} />
      <Dialog open={popen} onClose={handlePclose}>
        <DialogContent>
          <p>{CMIDText}</p>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={waitingUsesOpen}
        autoHideDuration={6000}
        onClose={handleWaitingUsesClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleWaitingUsesClose} severity={waitingUsesSeverity} sx={{ width: '100%' }}>
          {waitingUsesNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Edit;
