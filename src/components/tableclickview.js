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
    { field: 'popest', headerName: 'Population estimate', width: 150 },
    { field: 'samplesize', headerName: 'Sample size', width: 150 },
    { field: 'source', headerName: 'Source', width: 200, renderCell: (params1) =>{ return <a id='viewlink' href={params1.row.link2} target="_blank" rel="noopener noreferrer">{params1.row.source}</a>}, },
    { field: 'version', headerName: 'Version', width: 160, },
    { field: 'link', headerName: 'Link', width: 80, renderCell: (params) =>{if (params.row.link) {return <a id='viewlink' href={params.row.link} target="_blank" rel="noopener noreferrer">{"View"}</a>;}}, },
  ];
  const [rows, setRows] = useState([]);

  {console.log(props.usert)}

  //React.useEffect(() => {console.log(props.usert)},[])
  
  React.useEffect(() => {
    setRows(props.usert.map((value, key) => {
      return {
        id: key + 1,
        name: value.Name,
        location: value.Location,
        timespan: value['Time span'],
        popest: value['Population est.'],
        samplesize: value['Sample size'],
        source: value.Source,
        version: value.Version,
        link: value.Link,
        link2:value.link2
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
