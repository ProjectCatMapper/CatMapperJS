import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import './tableclickview.css'

export default function ClickTable(props) {
  const columns = [
    { field: 'id', headerName: 'ID', width: 30 },
    { field: 'name', headerName: 'Name', width: 300 },
    { field: 'location', headerName: 'Location', width: 150, },
    { field: 'timespan', headerName: 'Time span', width: 100 },
    { field: 'source', headerName: 'Source', width: 200 },
    { field: 'version', headerName: 'Version', width: 160, },
    { field: 'link', headerName: 'Link', width: 80, renderCell: (params) =>{if (params.row.link) {return <a className='viewlink' href={params.row.link} target="_blank" rel="noopener noreferrer">{"View"}</a>;}}, },
  ];
  const [rows, setRows] = useState([]);

  //React.useEffect(() => {console.log(props.usert)},[])
  
  React.useEffect(() => {
    setRows(props.usert.map((value, key) => {
      return {
        id: key + 1,
        name: value.Name,
        location: value.Location,
        timespan: value.Time_Span,
        source: value.Source,
        version: value.Version,
        link: value.Link,
      }
    }))
  }, [props.usert])

  // React.useEffect(() => {
  //   console.log(rows)
  // }, [rows])


  return (
    <div style={{ height: 700, width: '100%' }}>
      <DataGrid
        autoHeight
        rows={rows}
        getRowHeight={() => 80}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 30, 50]}
       />
    </div>
  );
}
