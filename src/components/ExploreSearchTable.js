import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom'
import { Snackbar, Alert } from "@mui/material";
import "./TableClickViewSC.css"

export default function DataTable({ users, snackbarOpen, setSnackbarOpen, database }) {
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const navigate = useNavigate();

  const columns = [
    {
      field: 'spacer', // Dummy field for space
      headerName: '',
      width: 50, // Set desired width for the space
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: () => null, // Renders an empty cell
    },
    { field: 'id', headerName: 'Index', flex: 0.3 },
    { field: 'cmid', headerName: 'CatMapper ID', flex: 0.9 },
    { field: 'name', headerName: 'CMName', flex: 2 },
    { field: 'label', headerName: 'Domain', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 2, cellClassName: (params) => params.row.hasLargeText ? 'wrap-text-3-lines_ex' : '' },
    {
      field: 'spacer1', // Dummy field for space
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: () => null, // Renders an empty cell
    },
    { field: 'match', headerName: 'Matching', flex: 1 },
  ];


  const handleRowClick = (
    params,
  ) => {
    navigate({ pathname: `/${database}/${params.row.cmid}`, });
  };

  React.useEffect(() => {
    setRows(users.map((value, key) => {
      const hasLargeText = ['country'].some(column => {
        const text = value[column];
        return text && text.toString().length > 50;
      });

      return {
        id: key + 1,
        cmid: value.CMID,
        name: value.CMName,
        label: value.domain,
        country: value.country,
        match: value.matching,
        hasLargeText
      }
    }))
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [users])

  const getRowHeight = (params) => {
    return params.model.hasLargeText ? 63 : 40;
  };

  return (
    <div style={{ height: "auto", width: '100%' }}>
      <DataGrid
        className="custom-row-height"
        rows={rows}
        columns={columns}
        getRowHeight={getRowHeight}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 30, 50]}
        //onRowClick={handleRowClick}
        onRowDoubleClick={handleRowClick}
        localeText={{ noRowsLabel: "" }} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        message="No results found"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error" // Makes it red and adds an error icon
          sx={{
            fontSize: "1.2rem",  // Bigger text
            padding: "1rem",  // More padding
            width: "100%", // Make it wider
            fontWeight: "bold" // Bold text
          }}
        >
          No results found
        </Alert>
      </Snackbar>
    </div>
  );
}