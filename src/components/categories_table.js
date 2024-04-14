import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import {useNavigate} from 'react-router-dom'
import { useLocation } from 'react-router-dom';


export default function CategoriesTable(props) {
  const columns = [
    { field: 'Domain', headerName: 'Domain', width: 500 },
    { field: 'Count', headerName: 'Count', width: 200 },
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
    setRows(props.categories.map((value, key) => {
      return {
        id: key + 1,
        Domain: value.Domain,
        Count: value.Count,
      }
    }))
  }, [props.categories])

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
