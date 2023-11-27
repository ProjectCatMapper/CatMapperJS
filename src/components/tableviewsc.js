import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import {useNavigate} from 'react-router-dom'

export default function DataTable(props) {
  const columns = [
    { field: 'id', headerName: 'Index', width: 70 },
    { field: 'cmid', headerName: 'CMID', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'label', headerName: 'Label', width: 160, },
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
        cmid: value.n.CMID,
        name: value.n.CMName,
        label: props.label,
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
        onRowClick={handleRowClick} />
    </div>
  );
}
