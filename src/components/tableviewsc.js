import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import {useNavigate} from 'react-router-dom'
import { useLocation } from 'react-router-dom';


export default function DataTable(props) {
  const columns = [
    { field: 'id', headerName: 'Index', flex: 0.3 },
    { field: 'cmid', headerName: 'CMID',  flex: 0.5 },
    { field: 'name', headerName: 'CMName', flex: 2 },
    { field: 'label', headerName: 'Label', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 2 },
    { field: 'match', headerName: 'Matching', flex: 1 },
  ];
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  const tabval = ""

  let path = "sociomap"

  if (useLocation().pathname.includes("archamap")) {
    path = "archamap"
  } 
  
  const handleRowClick = (
    params,
  ) => {
    navigate({pathname:`/${path}/${params.row.cmid}`,});
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
