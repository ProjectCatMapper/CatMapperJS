import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import {useNavigate} from 'react-router-dom'

export default function DataTable(props) {
  console.log(props)
  const columns = [
    { field: 'id', headerName: 'Index', width: 70 },
    { field: 'cmid', headerName: 'CMID', width: 150 },
    { field: 'name', headerName: 'CMName', width: 200 },
    { field: 'label', headerName: 'Label', width: 160, },
    { field: 'country', headerName: 'Country', width: 300, },
    { field: 'match', headerName: 'Matching', width: 300, },
  ];
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  
  const handleRowClick = (
    params,
  ) => {
    navigate({pathname:`/exview/${params.row.cmid}`,
  });
  };

  React.useEffect(() => {
    setRows(props.users.map((value, key) => {
      return {
        id: key + 1,
        cmid: value.CMID,
        name: value.CMName,
        label: value.domain,
        country: value.country,
        match: value.matching
      }
    }))
  }, [props.users])

  // React.useEffect(() => {
  //   console.log(rows)
  // }, [rows])

  return (
    <div style={{ height: 700, width: '100%' }}>
      <DataGrid
        style={{ Color: "pink" }}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 30, 50]}
        onRowClick={handleRowClick}
        localeText={{ noRowsLabel: "No results to display" }} />
    </div>
  );
}
