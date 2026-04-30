import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { red } from '@mui/material/colors';
import Neo4jVisualization from "./VisNet";
import "./ExploreNode.css";

import Tooltip from '@mui/material/Tooltip';
import WarningIcon from '@mui/icons-material/Warning'; // or HelpOutline

const NetworkExplorerView = ({
    database,
    domainType,
    limit,
    dropdownNodeLimit,
    setDropdownNodeLimit,
    firstDropdownValue,
    fetchData,
    orderedProperties,
    selectedValues,
    updateData,
    domains,
    thirdDropdownValue,
    updateNodeData,
    selectedNodes,
    visData,
    fourthDropdownValue,
    updateDatasetNodeData,
    selectedDatasets,
    eventTypes,
    selectedEventTypes,
    updateEventTypeData,
    onNodeNavigateStart
}) => {
    return (
        <div>
            <Typography variant="p" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                Double click on node to move to that node's info page.

                <Tooltip
                    title={
                        <span style={{ fontSize: '14px', lineHeight: '1.4' }}>
                            No more than {dropdownNodeLimit} nodes are shown in the network (Use "Limit Display Nodes" dropdown to increase this up to 50).
                            Use the "Nodes" dropdown to select specific nodes (only {limit} total nodes are returned. Additional nodes cannot be selected).
                        </span>
                    }
                    arrow
                    placement="top"
                >
                    <WarningIcon
                        sx={{
                            ml: 1,
                            color: red[500],
                            fontSize: '1.2rem',
                            cursor: 'pointer'
                        }}
                    />
                </Tooltip>
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="first-dropdown">Relationship</InputLabel>
                    <Select
                        label="Relationship"
                        value={firstDropdownValue}
                        onChange={fetchData}
                    >
                        {orderedProperties.map((property) => (
                            <MenuItem key={property} value={property}>
                                {property}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="second-dropdown">Domain</InputLabel>
                    <Select
                        multiple
                        value={selectedValues}
                        onChange={updateData}
                        label="Domain"
                    >
                        {domains?.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ m: 1, width: 300 }} disabled={selectedDatasets.length <= 1}>
                    <InputLabel htmlFor="fourth-dropdown">Dataset Filter</InputLabel>
                    <Select
                        label="Dataset Filter"
                        value={fourthDropdownValue}
                        onChange={updateDatasetNodeData}
                    >
                        {selectedDatasets.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="third-dropdown">Nodes</InputLabel>
                    <Select
                        multiple
                        label="Nodes"
                        value={thirdDropdownValue}
                        onChange={updateNodeData}
                        renderValue={(selected) => Array.isArray(selected) ? selected.join(", ") : selected}
                    >
                        {selectedNodes.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ m: 1, width: 300 }} disabled={firstDropdownValue !== "CONTAINS"}>
                    <InputLabel htmlFor="event-type-dropdown">Event Type</InputLabel>
                    <Select
                        multiple
                        value={selectedEventTypes}
                        onChange={updateEventTypeData}
                        label="Event Type"
                    >
                        {(eventTypes.length > 0 ? eventTypes : ["All"]).map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel htmlFor="dropdown-nodelimit">
                        Limit Display Nodes
                    </InputLabel>
                    <Select
                        label="Limit Display Nodes"
                        id="dropdown-nodelimit"
                        value={dropdownNodeLimit}
                        onChange={(event) => setDropdownNodeLimit(event.target.value)}
                    >
                        {[5, 10, 25, 50].map((num) => (
                            <MenuItem key={num} value={num}>
                                {num}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <div style={{ width: "100%", height: "500px", marginTop: '20px' }}>
                {/* {console.log(database)} */}
                {visData && <Neo4jVisualization
                    database={database}
                    visData={visData}
                    dropdownNodeLimit={dropdownNodeLimit}
                    setDropdownNodeLimit={setDropdownNodeLimit}
                    onNavigateStart={onNodeNavigateStart}
                />}
            </div>
        </div>
    );
};

export default NetworkExplorerView;
