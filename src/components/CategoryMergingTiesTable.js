import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  NativeSelect,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";

const DEFAULT_LIMIT = 25;

function uniqueSortedValues(rows, field) {
  return Array.from(
    new Set(
      (rows || [])
        .map((row) => row?.[field])
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
        .map(String)
    )
  ).sort();
}

export default function CategoryMergingTiesTable({
  rows = [],
  filterBy = "stack",
  initialLimit = DEFAULT_LIMIT,
  goToCmidInfo,
}) {
  const [filterValue, setFilterValue] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const filterField = filterBy === "dataset" ? "datasetID" : "stackID";
  const filterLabel = filterBy === "dataset" ? "Dataset" : "Stack";
  const options = useMemo(() => uniqueSortedValues(rows, filterField), [rows, filterField]);

  const filteredRows = useMemo(() => {
    if (filterValue === "All") return rows || [];
    return (rows || []).filter((row) => String(row?.[filterField] || "") === filterValue);
  }, [rows, filterField, filterValue]);

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const visibleRows = showAll ? filteredRows : filteredRows.slice(0, initialLimit);
  const hiddenCount = Math.max(filteredRows.length - visibleRows.length, 0);

  const renderCmid = (cmid) => {
    if (!cmid) return "";
    if (!goToCmidInfo) return cmid;
    return (
      <Button
        size="small"
        variant="text"
        sx={{ p: 0, minWidth: 0, textTransform: "none" }}
        onClick={() => goToCmidInfo(cmid)}
      >
        {cmid}
      </Button>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ alignItems: "center", display: "flex", gap: 1.5, justifyContent: "space-between", mb: 1 }}>
        <Typography sx={{ fontWeight: 700 }}>
          Category Merging Ties ({filteredRows.length})
        </Typography>
        {options.length > 1 && (
          <NativeSelect
            aria-label={`Filter category merging ties by ${filterLabel.toLowerCase()}`}
            size="small"
            value={filterValue}
            onChange={(event) => {
              setFilterValue(event.target.value);
              setShowAll(false);
            }}
          >
            <option value="All">All {filterLabel}s</option>
            {options.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </NativeSelect>
        )}
      </Box>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: showAll ? 520 : 360 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Stack</TableCell>
              <TableCell>Dataset</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Category CMID</TableCell>
              <TableCell>Category CMName</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, index) => (
              <TableRow key={`${row.stackID || ""}-${row.datasetID || ""}-${row.categoryCMID || ""}-${row.Key || ""}-${index}`}>
                <TableCell>{renderCmid(row.stackID)}</TableCell>
                <TableCell>{renderCmid(row.datasetID)}</TableCell>
                <TableCell>{row.Key || ""}</TableCell>
                <TableCell>{renderCmid(row.categoryCMID)}</TableCell>
                <TableCell>{row.categoryCMName || ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {hiddenCount > 0 && (
        <Button sx={{ mt: 1 }} size="small" variant="text" onClick={() => setShowAll(true)}>
          Show all {filteredRows.length} category merging ties
        </Button>
      )}
    </Box>
  );
}

CategoryMergingTiesTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object),
  filterBy: PropTypes.oneOf(["stack", "dataset"]),
  initialLimit: PropTypes.number,
  goToCmidInfo: PropTypes.func,
};
