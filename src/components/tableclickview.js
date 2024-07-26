import React from 'react';
import { useState,useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import './tableclickview.css'

export default function ClickTable(props) {
  const ccolumns = [
    { field: 'name', headerName: 'Name',flex: 2},
    { field: 'location', headerName: 'Location',flex: 1 },
    { field: 'timespan', headerName: 'Time span',flex: 0.5 },
    { field: 'popest', headerName: 'Population est.',flex: 0.5 },
    { field: 'samplesize', headerName: 'Sample size',flex: 0.5},
    { field: 'source', headerName: 'Source',flex: 0.5,  renderCell: (params1) =>{ return <a id='viewlink' href={params1.row.link2} target="_blank" rel="noopener noreferrer">{params1.row.source}</a>}, },
    { field: 'version', headerName: 'Version',flex: 0.5, },
    { field: 'link', headerName: 'Link', flex: 0.4, renderCell: (params) =>{if (params.row.link) {return <a id='viewlink' href={params.row.link} target="_blank" rel="noopener noreferrer">{"View"}</a>;}}, },
  ];
  const [rows, setRows] = useState([]);

  //React.useEffect(() => {console.log(props.usert)},[])
  
  useEffect(() => {
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
  },[props.usert])

  const nonEmptyColumns = ccolumns.filter((col) => 
    rows.some((row) => (row[col.field] !== null) && (row[col.field] !== "null"))
  );

//  useEffect(() => {
//   setColumns(nonEmptyColumns);
//   }, [])

  return (
    <div style={{ marginLeft:"2vw",height: 600, width: "90vw" }}>
      <DataGrid
        rows={rows}
        getRowHeight={() => 50}
        columns={nonEmptyColumns}
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
