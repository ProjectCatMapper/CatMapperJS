import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import './tableclickview.css'

export default function ClickTable(props) {
  console.log(props.usert)
  const columns = [
    { field: 'id', headerName: 'ID', width: 30 },
    { field: 'name', headerName: 'Name', width: 300 },
    { field: 'location', headerName: 'Location', width: 150, },
    { field: 'timespan', headerName: 'Time span', width: 100 },
    { field: 'popest', headerName: 'Population estimate', width: 150 },
    { field: 'source', headerName: 'Source', width: 200 },
    { field: 'version', headerName: 'Version', width: 160, },
    { field: 'link', headerName: 'Link', width: 80, renderCell: (params) =>{if (params.row.link) {return <a id='viewlink' href={params.row.link} target="_blank" rel="noopener noreferrer">{"View"}</a>;}}, },
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
        popest: value.Populationest,
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
    <div style={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        getRowHeight={() => 50}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 30, 50]}
       />
       <p>*population estimate estimated from survey sample</p>
    </div>
  );
}
