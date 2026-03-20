import * as React from 'react';
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Button, IconButton, Tooltip } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import './TableClickViewSC.css';
import { useAuth } from './AuthContext';
import { addBookmark } from '../api/profileApi';

export default function DataTable({ users, snackbarOpen, setSnackbarOpen, database }) {
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [bookmarkNotice, setBookmarkNotice] = useState({ open: false, severity: 'info', message: '' });
  const tableContainerRef = React.useRef(null);
  const navigate = useNavigate();
  const { user, cred } = useAuth();

  const handleViewButton = (params) => {
    navigate({ pathname: `/${database}/${params.row.cmid}` });
  };

  const handleBookmarkClick = async (row) => {
    if (!user || !cred) {
      setBookmarkNotice({ open: true, severity: 'warning', message: 'Please log in to save bookmarks.' });
      return;
    }

    try {
      await addBookmark({
        userId: user,
        database,
        cmid: row.cmid,
        cmname: row.name,
        cred
      });
      setBookmarkNotice({ open: true, severity: 'success', message: `Bookmarked ${row.cmid}` });
    } catch (error) {
      setBookmarkNotice({ open: true, severity: 'error', message: error.message || 'Unable to add bookmark.' });
    }
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
      )
    },
    { field: 'id', headerName: 'Index', flex: 0.3 },
    { field: 'cmid', headerName: 'CatMapper ID', flex: 0.9 },
    { field: 'name', headerName: 'CMName', flex: 2 },
    { field: 'label', headerName: 'Domain', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 2, cellClassName: (params) => (params.row.hasLargeText ? 'wrap-text-3-lines_ex' : '') },
    { field: 'match', headerName: 'Matching', flex: 1 },
    {
      field: 'bookmarkAction',
      headerName: '',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Bookmark" arrow>
          <IconButton onClick={() => handleBookmarkClick(params.row)} color="primary">
            <BookmarkBorderIcon />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  React.useEffect(() => {
    setRows(
      users.map((value, key) => {
        const hasLargeText = ['country'].some((column) => {
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
        };
      })
    );
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [users]);

  React.useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const scroller = tableContainerRef.current?.querySelector('.MuiDataGrid-virtualScroller');
      if (scroller) {
        scroller.scrollTop = 0;
        scroller.scrollLeft = 0;
      }
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [users]);

  const getRowHeight = (params) => (params.model.hasLargeText ? 63 : 48);

  return (
    <div ref={tableContainerRef} style={{ height: 'auto', width: '100%' }}>
      <DataGrid
        className="custom-row-height"
        rows={rows}
        columns={columns}
        getRowHeight={getRowHeight}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }
          }
        }}
        pageSizeOptions={[10, 30, 50]}
        localeText={{ noRowsLabel: '' }}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%', fontWeight: 'bold' }}>
          No results found
        </Alert>
      </Snackbar>

      <Snackbar
        open={bookmarkNotice.open}
        autoHideDuration={3000}
        onClose={() => setBookmarkNotice((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={bookmarkNotice.severity} variant="filled">
          {bookmarkNotice.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
