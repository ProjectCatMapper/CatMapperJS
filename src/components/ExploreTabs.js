import { useState, useEffect, useMemo } from 'react'
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import './ExploreTabs.css'

export default function ClickTable(props) {
  const isCompactLayout = useMediaQuery('(max-width: 1366px)');
  const ccolumns = useMemo(() => ([
    {
      field: 'name',
      headerName: 'Name',
      flex: isCompactLayout ? 1.15 : 1.3,
      minWidth: isCompactLayout ? 115 : 140,
      cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : ''
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: isCompactLayout ? 1.1 : 1.3,
      minWidth: isCompactLayout ? 110 : 130,
      cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : ''
    },
    {
      field: 'timespan',
      headerName: 'Time span',
      flex: isCompactLayout ? 0.5 : 0.47,
      minWidth: isCompactLayout ? 84 : 92,
      headerClassName: 'wrap-header_data',
      cellClassName: 'timespan_text',
      renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value === 0 ? "" : params.value}</div>),
    },
    {
      field: 'popest',
      headerName: 'Pop. est.',
      flex: isCompactLayout ? 0.45 : 0.4,
      minWidth: isCompactLayout ? 82 : 90,
      headerClassName: 'wrap-header_data',
      renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>),
    },
    {
      field: 'ctype',
      headerName: 'Type',
      flex: isCompactLayout ? 0.45 : 0.4,
      minWidth: isCompactLayout ? 76 : 84,
      headerClassName: 'wrap-header_data',
      renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>),
    },
    {
      field: 'samplesize',
      headerName: 'Sample size',
      flex: isCompactLayout ? 0.5 : 0.37,
      minWidth: isCompactLayout ? 88 : 94,
      headerClassName: 'wrap-header_data',
      renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>),
    },
    {
      field: 'source',
      headerName: 'Source',
      flex: isCompactLayout ? 0.75 : 0.83,
      minWidth: isCompactLayout ? 92 : 110,
      renderCell: (params1) => <a id='viewlink' href={params1.row.link2} target="_blank" rel="noopener noreferrer">{params1.row.source}</a>,
    },
    {
      field: 'key',
      headerName: 'Key',
      flex: isCompactLayout ? 0.85 : 1.0,
      minWidth: isCompactLayout ? 140 : 180,
      cellClassName: (params) => params.value && params.value.length > 35 ? 'wrap-text-3-lines_dt' : '',
      renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>),
    },
    {
      field: 'version',
      headerName: 'Version',
      flex: isCompactLayout ? 0.58 : 0.7,
      minWidth: isCompactLayout ? 86 : 98,
      cellClassName: (params) => params.value && params.value.length > 10 ? 'wrap-text-3-lines_dt' : '',
      renderCell: (params) => (<div style={{ paddingLeft: '10px' }}>{params.value}</div>),
    },
    {
      field: 'link',
      headerName: 'Link',
      flex: isCompactLayout ? 0.32 : 0.4,
      minWidth: isCompactLayout ? 64 : 72,
      renderCell: (params) => {
        if (params.row.link) {
          return <a id='viewlink' href={params.row.link} target="_blank" style={{ paddingLeft: '10px' }} rel="noopener noreferrer">{"View"}</a>;
        }
        return null;
      },
    },
  ]), [isCompactLayout]);
  const [rows, setRows] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({ key: false });

  useEffect(() => {
    setRows(props.usert.map((value, key) => {
      const hasLarge = ['Name', 'Location', 'Version', 'Key'].some(column => {
        const text = value[column];
        return text && text.toString().length > 35;
      });

      return {
        id: key + 1,
        name: value.Name,
        location: value.Location,
        timespan: !value['rStart'] && !value['rEnd'] ? ''
          : value['rStart'] && value['rEnd'] && value['rStart'] === value['rEnd']
            ? value['rStart']
            : !value['rStart']
              ? '-' + value['rEnd']
              : !value['rEnd']
                ? value['rStart'] + '-'
                : value['rStart'] + '-' + value['rEnd'],
        popest: value['Population est.'],
        samplesize: value['Sample size'],
        source: value.Source,
        key: value.Key,
        version: value.Version,
        link: value.Link,
        link2: value.link2,
        ctype: value.cType,
        hasLarge
      }
    }).sort((a, b) => {
      // Compare Source first
      if (a.source < b.source) return -1;
      if (a.source > b.source) return 1;
      // If Source equal, compare Location
      if (a.location < b.location) return -1;
      if (a.location > b.location) return 1;
      // If Location equal, compare timespan
      if (a.timespan < b.timespan) return -1;
      if (a.timespan > b.timespan) return 1;
      // If timespan equal, compare Version
      if (a.version < b.version) return -1;
      if (a.version > b.version) return 1;
      return 0;
    }))
  }, [props.usert])

  const nonEmptyColumns = useMemo(() => ccolumns.filter((col) =>
    col.field === 'key' || rows.some((row) => (row[col.field] !== null) && row[col.field] !== undefined && row[col.field] !== '' && (row[col.field] !== "null"))
  ), [ccolumns, rows]);



  const getRowHeight = (params) => {
    if (isCompactLayout) return params.model.hasLarge ? 56 : 34;
    return params.model.hasLarge ? 63 : 40;
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <style>
        {`
          .wrap-header_data .MuiDataGrid-columnHeaderTitle {
            white-space: normal; /* Allow wrapping of the header text */
            overflow-wrap: break-word; /* Ensures long words break properly */
            word-break: normal !important; /* Breaks text at any point if needed */
            line-height: 1; /* Reduces spacing between lines */
            transition: none; /* Prevents any animation or transition effects */
          }
          .wrapHeader:hover .MuiDataGrid-columnHeaderTitle {
            font-weight: normal; /* Ensures no font-weight change on hover */
            text-decoration: none; /* Prevents underline or decoration on hover */
          }
        `}
      </style>
      <div style={{ width: "100%" }}>
        <DataGrid
          className="custom-row-height"
          autoHeight
          density={isCompactLayout ? "compact" : "standard"}
          rows={rows}
          getRowHeight={getRowHeight}
          columns={nonEmptyColumns}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              csvOptions: { disableToolbarButton: true },
              printOptions: { disableToolbarButton: true },
            },
          }}
          sortModel={[
            { field: "source", sort: "asc" },
            { field: "location", sort: "asc" },
            { field: "timespan", sort: "asc" },
            { field: "version", sort: "asc" },
          ]}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              fontSize: isCompactLayout ? '0.78rem' : '0.9rem',
            },
            '& .MuiDataGrid-cell': {
              fontSize: isCompactLayout ? '0.78rem' : '0.88rem',
              py: isCompactLayout ? 0.25 : 0.5,
            },
            '& .MuiDataGrid-toolbarContainer': {
              justifyContent: 'flex-end',
              px: 0,
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 30, 50]}
        />
      </div>
      <p>*population estimate reported directly from source or estimated from survey sample</p>
    </div>
  );
}
