import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom'
import { Snackbar, Alert, Button, IconButton, Tooltip } from "@mui/material";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'; // Import Bookmark Icon
import "./TableClickViewSC.css"

export default function DataTable({ users, snackbarOpen, setSnackbarOpen, database }) {
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [bookmarkNotice, setBookmarkNotice] = useState(false); // State for the notice
  const navigate = useNavigate();

  const handleViewButton = (params) => {
    navigate({ pathname: `/${database}/${params.row.cmid}` });
  };

  const handleBookmarkClick = () => {
    setBookmarkNotice(true);
  };

  const columns = [
    {
      field: 'viewAction',
      headerName: '',
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: 'success.main',
            '&:hover': { backgroundColor: 'success.dark' }
          }}
          onClick={() => handleViewButton(params)}
        >
          View
        </Button>
      ),
    },
    { field: 'id', headerName: 'Index', flex: 0.3 },
    { field: 'cmid', headerName: 'CatMapper ID', flex: 0.9 },
    { field: 'name', headerName: 'CMName', flex: 2 },
    { field: 'label', headerName: 'Domain', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 2, cellClassName: (params) => params.row.hasLargeText ? 'wrap-text-3-lines_ex' : '' },
    { field: 'match', headerName: 'Matching', flex: 1 },
    {
      field: 'bookmarkAction',
      headerName: '',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: () => (
        <Tooltip title="Bookmark" arrow>
          <IconButton onClick={handleBookmarkClick} color="primary">
            <BookmarkBorderIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

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
    return params.model.hasLargeText ? 63 : 48; // Bumped slightly for button padding
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
        localeText={{ noRowsLabel: "" }} />

      {/* Main Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: "100%", fontWeight: "bold" }}>
          No results found
        </Alert>
      </Snackbar>

      {/* Bookmark "In Progress" Snackbar */}
      <Snackbar
        open={bookmarkNotice}
        autoHideDuration={3000}
        onClose={() => setBookmarkNotice(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="info" variant="filled">
          Bookmark feature coming soon!
        </Alert>
      </Snackbar>
    </div>
  );
}