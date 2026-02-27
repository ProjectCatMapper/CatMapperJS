import React, { useMemo, useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  MenuItem
} from "@mui/material";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './NavbarHome';
import './EditMetadata.css';

const isHexColor = (value) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value || '').trim());

const getMetadataNodeType = (labels = []) => {
  const upper = (Array.isArray(labels) ? labels : [])
    .map((label) => String(label || '').trim().toUpperCase())
    .filter(Boolean);
  if (upper.includes('LABEL')) return 'LABEL';
  if (upper.includes('PROPERTY')) return 'PROPERTY';
  if (upper.includes('TRANSLATION')) return 'TRANSLATION';
  return 'OTHER';
};

const normalizeNodeItem = (databaseName, item) => {
  if (!item || typeof item !== 'object') return null;
  const props = (item.props && typeof item.props === 'object') ? item.props : {};
  const labels = Array.isArray(item.labels)
    ? item.labels
    : (Array.isArray(props.labels) ? props.labels : []);
  const nodeType = getMetadataNodeType(labels);
  const groupLabel = item.groupLabel || props.groupLabel || props.groupDomain || 'UNMAPPED';
  const cmid = item.CMID || item.cmid || props.CMID || props.cmid || '';
  const cmname = item.CMName || item.cmname || props.CMName || props.Name || props.name || '';
  const color = item.color || props.color || props.hexColor || null;
  if (!cmid && !cmname) return null;
  return {
    database: databaseName,
    id: item.id || props.id || null,
    CMID: cmid,
    CMName: cmname,
    color,
    nodeType,
    groupLabel,
    labels,
  };
};

const DynamicPropertiesForm = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authLevel, cred } = useAuth();

  const cmid = params.cmid || params.legacyCmid;
  const database = (params.database || '').toLowerCase();
  const mode = location.pathname.endsWith('/view')
    ? 'view'
    : (location.pathname.endsWith('/edit') ? 'edit' : (cmid ? 'edit' : 'list'));
  const isReadOnly = mode === 'view';
  const isListView = !cmid;

  const [metadataIndex, setMetadataIndex] = useState({});
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [addableProps, setAddableProps] = useState({});
  const [selectedAddProp, setSelectedAddProp] = useState({});
  const [newAddProp, setNewAddProp] = useState({});
  const [addPropTarget, setAddPropTarget] = useState({});
  const [listReloadKey, setListReloadKey] = useState(0);
  const [creatingNode, setCreatingNode] = useState(false);
  const [createPropOptions, setCreatePropOptions] = useState([]);
  const [selectedCreateProp, setSelectedCreateProp] = useState('');
  const [createNodeData, setCreateNodeData] = useState({
    CMName: '',
    nodeLabel: 'PROPERTY',
    databaseTarget: 'both',
    properties: {},
  });

  const fetchHeaders = useMemo(() => ({
    "Content-Type": "application/json",
    ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
  }), [cred]);

  useEffect(() => {
    if (authLevel !== 2) {
      setError("Not authorized to edit metadata.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        if (isListView) {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/metadata/nodes`, {
            headers: fetchHeaders,
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || `Server error: ${response.status}`);
          }

          const normalized = {
            SocioMap: (result.SocioMap || [])
              .map((item) => normalizeNodeItem('SocioMap', item))
              .filter(Boolean),
            ArchaMap: (result.ArchaMap || [])
              .map((item) => normalizeNodeItem('ArchaMap', item))
              .filter(Boolean),
          };
          setMetadataIndex(normalized);
          setFormData([]);
        } else {
          const dbParam = database ? `?database=${database}` : '';
          const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/metadata/node/${cmid}${dbParam}`, {
            headers: fetchHeaders,
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || `Server error: ${response.status}`);
          }

          const rawArray = Array.isArray(result) ? result : [];
          const processedData = rawArray.map((item) => {
            const dbName = Object.keys(item)[0];
            const nodeData = item[dbName];
            return {
              database: dbName,
              ...nodeData,
            };
          });
          setFormData(processedData);
        }
      } catch (err) {
        setError(err.message || "Failed to load metadata.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLevel, cmid, database, isListView, fetchHeaders, listReloadKey]);

  useEffect(() => {
    if (isListView || isReadOnly || formData.length === 0) return;

    const loadAddableProps = async () => {
      const nextAddable = {};
      const nextSelected = {};

      for (let index = 0; index < formData.length; index += 1) {
        const item = formData[index];
        const itemCMID = item?.properties?.CMID || item?.CMID || cmid;
        const itemDatabase = String(item?.database || '').toLowerCase();
        if (!itemCMID || !itemDatabase) {
          nextAddable[index] = [];
          continue;
        }

        try {
          const query = new URLSearchParams({
            CMID: itemCMID,
            database: itemDatabase,
            option: 'add',
          });
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/admin_add_edit_delete_nodeproperties?${query.toString()}`,
            { headers: fetchHeaders }
          );
          const result = await response.json();
          const options = Array.isArray(result?.r1) ? result.r1 : [];
          nextAddable[index] = options;
          nextSelected[index] = options[0] || '';
        } catch (_err) {
          nextAddable[index] = [];
        }
      }

      setAddableProps(nextAddable);
      setSelectedAddProp(nextSelected);
    };

    loadAddableProps();
  }, [cmid, formData, isListView, isReadOnly, fetchHeaders]);

  useEffect(() => {
    if (!isListView || authLevel !== 2) return;

    const loadCreatePropOptions = async () => {
      try {
        const nodeLabel = String(createNodeData.nodeLabel || 'PROPERTY').trim().toUpperCase();
        const target = String(createNodeData.databaseTarget || 'both').trim().toLowerCase();
        const query = new URLSearchParams({ databaseTarget: target });
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/admin/metadata/properties/${nodeLabel}?${query.toString()}`,
          { headers: fetchHeaders },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || `Server error: ${response.status}`);
        }

        const options = Array.isArray(result?.properties)
          ? result.properties
            .map((prop) => String(prop || '').trim())
            .filter(Boolean)
            .filter((prop) => !['CMID', 'CMName'].includes(prop))
          : [];

        setCreatePropOptions(options);
        setSelectedCreateProp((prev) => (options.includes(prev) ? prev : (options[0] || '')));
        setCreateNodeData((prev) => {
          const kept = {};
          Object.entries(prev.properties || {}).forEach(([key, value]) => {
            if (options.includes(key)) {
              kept[key] = value;
            }
          });
          return {
            ...prev,
            properties: kept,
          };
        });
      } catch (err) {
        setCreatePropOptions([]);
        setSelectedCreateProp('');
        setError(err.message || 'Failed to load metadata property options.');
      }
    };

    loadCreatePropOptions();
  }, [isListView, authLevel, createNodeData.nodeLabel, createNodeData.databaseTarget, fetchHeaders]);

  const groupedIndex = useMemo(() => {
    const sortByName = (rows = []) => [...rows].sort((a, b) => {
      const nameA = String(a?.CMName || '').toLowerCase();
      const nameB = String(b?.CMName || '').toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return String(a?.CMID || '').localeCompare(String(b?.CMID || ''));
    });

    const mergedByCmid = new Map();
    const allRows = [...(metadataIndex.SocioMap || []), ...(metadataIndex.ArchaMap || [])];
    allRows.forEach((row, index) => {
      const key = row?.CMID || `${row?.database || 'unknown'}:${row?.id || row?.CMName || `row-${index}`}`;
      const existing = mergedByCmid.get(key);
      if (!existing) {
        mergedByCmid.set(key, {
          ...row,
          databases: [row.database],
        });
        return;
      }

      const nextDatabases = new Set([...(existing.databases || []), row.database]);
      mergedByCmid.set(key, {
        ...existing,
        CMName: existing.CMName || row.CMName,
        color: existing.color || row.color,
        nodeType: existing.nodeType !== 'OTHER' ? existing.nodeType : row.nodeType,
        groupLabel: existing.groupLabel !== 'UNMAPPED' ? existing.groupLabel : row.groupLabel,
        labels: Array.from(new Set([...(existing.labels || []), ...(row.labels || [])])),
        databases: Array.from(nextDatabases),
      });
    });

    const mergedRows = sortByName(Array.from(mergedByCmid.values()));

    const labelByDomain = mergedRows
      .filter((row) => row.nodeType === 'LABEL')
      .reduce((acc, row) => {
        const key = row.groupLabel || 'UNMAPPED';
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
      }, {});

    Object.keys(labelByDomain).forEach((domain) => {
      labelByDomain[domain] = sortByName(labelByDomain[domain]);
    });

    return {
      LABEL: labelByDomain,
      PROPERTY: sortByName(mergedRows.filter((row) => row.nodeType === 'PROPERTY')),
      TRANSLATION: sortByName(mergedRows.filter((row) => row.nodeType === 'TRANSLATION')),
    };
  }, [metadataIndex]);

  const hasBothDatabasesInForm = useMemo(() => {
    const dbSet = new Set(formData.map((item) => item?.database).filter(Boolean));
    return dbSet.has('SocioMap') && dbSet.has('ArchaMap');
  }, [formData]);

  const handleChange = (itemIndex, key, value) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        properties: {
          ...(updated[itemIndex].properties || {}),
          [key]: value,
        },
      };
      return updated;
    });
  };

  const handleOpenNode = (dbName, nodeCmid, targetMode) => {
    navigate(`/admin/metadata/${dbName.toLowerCase()}/${nodeCmid}/${targetMode}`);
  };

  const handleSave = async () => {
    if (!formData || formData.length === 0) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        updates: formData.map((item) => ({
          id: item.id,
          database: item.database,
          properties: item.properties || {},
        })),
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/saveMetadata`, {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      setSuccessMessage(result.message || "Changes saved successfully.");
    } catch (err) {
      setError(err.message || "Error saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddProperty = (itemIndex) => {
    const typedPropName = String(newAddProp[itemIndex] || '').trim();
    const selectedPropName = selectedAddProp[itemIndex];
    const propName = typedPropName || selectedPropName;
    if (!propName) return;

    const blockedProps = new Set(['cmid', 'id', 'labels', 'database']);
    if (blockedProps.has(String(propName).toLowerCase())) {
      setError(`"${propName}" is reserved and cannot be added as a metadata property.`);
      return;
    }

    const targetMode = addPropTarget[itemIndex] || 'current';
    const targetIndexes = targetMode === 'both' && hasBothDatabasesInForm
      ? formData.map((_item, index) => index)
      : [itemIndex];

    setFormData((prev) => {
      const updated = [...prev];
      targetIndexes.forEach((targetIndex) => {
        const props = { ...(updated[targetIndex]?.properties || {}) };
        if (!(propName in props)) {
          props[propName] = '';
        }
        updated[targetIndex] = {
          ...updated[targetIndex],
          properties: props,
        };
      });
      return updated;
    });

    const nextAddableProps = { ...addableProps };
    targetIndexes.forEach((targetIndex) => {
      nextAddableProps[targetIndex] = (nextAddableProps[targetIndex] || []).filter((name) => name !== propName);
    });
    setAddableProps(nextAddableProps);
    setSelectedAddProp((prev) => {
      const next = { ...prev };
      targetIndexes.forEach((targetIndex) => {
        const nextOptions = nextAddableProps[targetIndex] || [];
        next[targetIndex] = nextOptions[0] || '';
      });
      return next;
    });
    setNewAddProp((prev) => ({
      ...prev,
      [itemIndex]: '',
    }));
    setError(null);
  };

  const handleCreateNodeFieldChange = (key, value) => {
    setCreateNodeData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateNodePropertyChange = (key, value) => {
    setCreateNodeData((prev) => ({
      ...prev,
      properties: {
        ...(prev.properties || {}),
        [key]: value,
      },
    }));
  };

  const handleAddCreatePropertyField = () => {
    if (!selectedCreateProp) return;
    setCreateNodeData((prev) => {
      const nextProps = { ...(prev.properties || {}) };
      if (!(selectedCreateProp in nextProps)) {
        nextProps[selectedCreateProp] = '';
      }
      return {
        ...prev,
        properties: nextProps,
      };
    });
  };

  const handleCreateNode = async () => {
    const cmnameValue = String(createNodeData.CMName || '').trim();
    if (!cmnameValue) {
      setError('CMName is required to create a metadata node.');
      return;
    }

    setCreatingNode(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        CMName: cmnameValue,
        nodeLabel: String(createNodeData.nodeLabel || 'PROPERTY').trim().toUpperCase(),
        databaseTarget: String(createNodeData.databaseTarget || 'both').trim().toLowerCase(),
        properties: { ...(createNodeData.properties || {}) },
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/metadata/create`, {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      setSuccessMessage(result.message || 'Metadata node created.');
      setCreateNodeData((prev) => ({
        ...prev,
        CMName: '',
        properties: {},
      }));
      setListReloadKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to create metadata node.');
    } finally {
      setCreatingNode(false);
    }
  };

  return (
    <div className="metadata-page">
      <Navbar />
      <div className="metadata-content">
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {!loading && successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
        )}

        {!loading && isListView && !error && (
          <>
            <div className="metadata-toolbar">
              <Typography variant="h4">Metadata Nodes (Admin)</Typography>
              <Typography variant="body2" color="text.secondary">
                Combined across databases, grouped by metadata node label
              </Typography>
            </div>

            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Create Metadata Node</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Node Name"
                    size="small"
                    value={createNodeData.CMName}
                    onChange={(e) => handleCreateNodeFieldChange('CMName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Node Label"
                    size="small"
                    value={createNodeData.nodeLabel}
                    onChange={(e) => handleCreateNodeFieldChange('nodeLabel', e.target.value)}
                  >
                    <MenuItem value="PROPERTY">PROPERTY</MenuItem>
                    <MenuItem value="LABEL">LABEL</MenuItem>
                    <MenuItem value="TRANSLATION">TRANSLATION</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Create In Database"
                    size="small"
                    value={createNodeData.databaseTarget}
                    onChange={(e) => handleCreateNodeFieldChange('databaseTarget', e.target.value)}
                  >
                    <MenuItem value="both">Both databases</MenuItem>
                    <MenuItem value="sociomap">SocioMap only</MenuItem>
                    <MenuItem value="archamap">ArchaMap only</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Add Property Field"
                    size="small"
                    value={selectedCreateProp}
                    onChange={(e) => setSelectedCreateProp(e.target.value)}
                  >
                    {createPropOptions.map((prop) => (
                      <MenuItem key={prop} value={prop}>
                        {prop}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    onClick={handleAddCreatePropertyField}
                    disabled={!selectedCreateProp}
                    sx={{ height: '40px' }}
                  >
                    Add Selected Property
                  </Button>
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {Object.entries(createNodeData.properties || {}).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={4} key={`create-prop-${key}`}>
                    <TextField
                      fullWidth
                      label={key}
                      size="small"
                      value={value ?? ''}
                      onChange={(e) => handleCreateNodePropertyChange(key, e.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleCreateNode}
                  disabled={creatingNode}
                >
                  {creatingNode ? 'Creating...' : 'Create Metadata Node'}
                </Button>
              </Box>
            </Paper>

            <div className="metadata-grid">
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 1 }}>LABEL</Typography>
                <Divider sx={{ mb: 2 }} />

                {Object.keys(groupedIndex.LABEL || {}).length === 0 && (
                  <Typography variant="body2" color="text.secondary">No LABEL metadata nodes found.</Typography>
                )}

                {Object.entries(groupedIndex.LABEL || {}).map(([groupName, rows]) => (
                  <Box key={`LABEL-${groupName}`} sx={{ mb: 2 }}>
                    <Typography className="metadata-section-title" variant="h6">{groupName}</Typography>
                    <div className="metadata-table-wrap">
                      <table className="metadata-table">
                        <thead>
                          <tr>
                            <th>CMID</th>
                            <th>Name</th>
                            <th>Color</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={`LABEL-${row.CMID || row.id}`}>
                              <td>{row.CMID || '-'}</td>
                              <td>{row.CMName || '-'}</td>
                              <td>
                                {isHexColor(row.color) ? (
                                  <span className="metadata-color-chip">
                                    <span className="metadata-color-swatch" style={{ backgroundColor: row.color }} />
                                    {row.color}
                                  </span>
                                ) : (
                                  row.color || "-"
                                )}
                              </td>
                              <td>
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={!row.CMID}
                                    onClick={() => handleOpenNode(row.databases?.[0] || 'SocioMap', row.CMID, 'view')}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    disabled={!row.CMID}
                                    onClick={() => handleOpenNode(row.databases?.[0] || 'SocioMap', row.CMID, 'edit')}
                                  >
                                    Edit
                                  </Button>
                                </Stack>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Box>
                ))}
              </Paper>

              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 1 }}>PROPERTY</Typography>
                <Divider sx={{ mb: 2 }} />
                {groupedIndex.PROPERTY.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No PROPERTY metadata nodes found.</Typography>
                )}
                {groupedIndex.PROPERTY.length > 0 && (
                  <div className="metadata-table-wrap">
                    <table className="metadata-table">
                      <thead>
                        <tr>
                          <th>CMID</th>
                          <th>Name</th>
                          <th>Color</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedIndex.PROPERTY.map((row) => (
                          <tr key={`PROPERTY-${row.CMID || row.id}`}>
                            <td>{row.CMID || '-'}</td>
                            <td>{row.CMName || '-'}</td>
                            <td>
                              {isHexColor(row.color) ? (
                                <span className="metadata-color-chip">
                                  <span className="metadata-color-swatch" style={{ backgroundColor: row.color }} />
                                  {row.color}
                                </span>
                              ) : (
                                row.color || "-"
                              )}
                            </td>
                            <td>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={!row.CMID}
                                  onClick={() => handleOpenNode(row.databases?.[0] || 'SocioMap', row.CMID, 'view')}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  disabled={!row.CMID}
                                  onClick={() => handleOpenNode(row.databases?.[0] || 'SocioMap', row.CMID, 'edit')}
                                >
                                  Edit
                                </Button>
                              </Stack>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Paper>

              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 1 }}>TRANSLATION</Typography>
                <Divider sx={{ mb: 2 }} />
                {groupedIndex.TRANSLATION.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No TRANSLATION metadata nodes found.</Typography>
                )}
                {groupedIndex.TRANSLATION.length > 0 && (
                  <div className="metadata-table-wrap">
                    <table className="metadata-table">
                      <thead>
                        <tr>
                          <th>CMID</th>
                          <th>Name</th>
                          <th>Color</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedIndex.TRANSLATION.map((row) => (
                          <tr key={`TRANSLATION-${row.CMID || row.id}`}>
                            <td>{row.CMID || '-'}</td>
                            <td>{row.CMName || '-'}</td>
                            <td>
                              {isHexColor(row.color) ? (
                                <span className="metadata-color-chip">
                                  <span className="metadata-color-swatch" style={{ backgroundColor: row.color }} />
                                  {row.color}
                                </span>
                              ) : (
                                row.color || "-"
                              )}
                            </td>
                            <td>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={!row.CMID}
                                  onClick={() => handleOpenNode(row.databases?.[0] || 'SocioMap', row.CMID, 'view')}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  disabled={!row.CMID}
                                  onClick={() => handleOpenNode(row.databases?.[0] || 'SocioMap', row.CMID, 'edit')}
                                >
                                  Edit
                                </Button>
                              </Stack>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Paper>
            </div>
          </>
        )}

        {!loading && !isListView && !error && (
          <>
            <div className="metadata-toolbar">
              <Typography variant="h4">
                {isReadOnly ? "View Metadata Node" : "Edit Metadata Node"}
              </Typography>
              <Button variant="outlined" onClick={() => navigate('/admin/metadata')}>
                Back To Metadata List
              </Button>
            </div>

            {formData.length === 0 && (
              <Typography variant="body1">No metadata node found for {cmid}.</Typography>
            )}

            {formData.map((item, index) => (
              <Paper key={item.id || index} elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {item.database} ({item.id})
                </Typography>

                {!isReadOnly && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                      select
                      size="small"
                      label="Add property"
                      value={selectedAddProp[index] || ''}
                      onChange={(e) =>
                        setSelectedAddProp((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }))
                      }
                      sx={{ minWidth: 260 }}
                    >
                      {(addableProps[index] || []).map((prop) => (
                        <MenuItem key={`${index}-${prop}`} value={prop}>
                          {prop}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      label="New property name"
                      value={newAddProp[index] || ''}
                      onChange={(e) =>
                        setNewAddProp((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }))
                      }
                      sx={{ minWidth: 220 }}
                    />
                    <TextField
                      select
                      size="small"
                      label="Add to database"
                      value={addPropTarget[index] || 'current'}
                      onChange={(e) =>
                        setAddPropTarget((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }))
                      }
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="current">{item.database}</MenuItem>
                      <MenuItem value="both" disabled={!hasBothDatabasesInForm}>Both databases</MenuItem>
                    </TextField>
                    <Button
                      variant="outlined"
                      onClick={() => handleAddProperty(index)}
                      disabled={!String(newAddProp[index] || '').trim() && !selectedAddProp[index]}
                    >
                      Add Property
                    </Button>
                    {(addableProps[index] || []).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No additional properties available for this metadata label.
                      </Typography>
                    )}
                  </Box>
                )}

                <Grid container spacing={2}>
                  {Object.entries(item.properties || {}).map(([key, value]) => {
                    const displayValue = Array.isArray(value) ? JSON.stringify(value) : (value ?? "");
                    const isColorField = key.toLowerCase() === 'color' && isHexColor(displayValue);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <div className="metadata-field-row">
                          {isColorField && <span className="metadata-color-swatch" style={{ backgroundColor: displayValue }} />}
                          <TextField
                            fullWidth
                            label={key}
                            value={displayValue}
                            onChange={(e) => handleChange(index, key, e.target.value)}
                            variant="outlined"
                            size="small"
                            multiline={String(displayValue).length > 60}
                            disabled={isReadOnly}
                          />
                        </div>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            ))}

            {!isReadOnly && formData.length > 0 && (
              <Button variant="contained" size="large" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DynamicPropertiesForm;
