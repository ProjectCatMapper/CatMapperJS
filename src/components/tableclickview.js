import React from 'react';
import { useState,useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import './tableclickview.css'

export default function ClickTable(props) {
  const ccolumns = [
    { field: 'name', headerName: 'Name',flex: 1.3,cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : ''},
    {
      field: 'spacer', // Dummy field for space
      headerName: '',
      width: 20, // Set desired width for the space
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: () => null, // Renders an empty cell
    },
    { field: 'location', headerName: 'Location',flex: 1.3,cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : ''},
    { field: 'timespan', headerName: 'Time span',flex: 0.45,headerClassName: 'wrap-header_data',cellClassName: 'timespan_text',renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>), },
    { field: 'popest', headerName: 'Pop. est.',flex: 0.4,headerClassName: 'wrap-header_data',renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>), },
    { field: 'samplesize', headerName: 'Sample size',flex: 0.37,headerClassName: 'wrap-header_data',renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>),},
    { field: 'source', headerName: 'Source',flex: 0.83,  renderCell: (params1) =>{ return <a id='viewlink' href={params1.row.link2} target="_blank" rel="noopener noreferrer">{params1.row.source}</a>}, },
    { field: 'version', headerName: 'Version',flex: 0.7,cellClassName: (params) => params.value && params.value.length > 10 ? 'wrap-text-3-lines_dt' : '',renderCell: (params) => (<div style={{ paddingLeft: '10px' }}>{params.value}</div>), },
    { field: 'link', headerName: 'Link', flex: 0.4, renderCell: (params) =>{if (params.row.link) {return <a id='viewlink' href={params.row.link} target="_blank" style={{ paddingLeft: '10px' }} rel="noopener noreferrer">{"View"}</a>;}}, },
  ];
  const [rows, setRows] = useState([]);
  let nonEmptyColumns = []

  //React.useEffect(() => {console.log(props.usert)},[])
  
  useEffect(() => {
    setRows(props.usert.map((value, key) => {
      const hasLarge = ['Name','Location','Version'].some(column => {
        console.log(value)
        const text = value[column];
        return text && text.toString().length > 35;
      });
      console.log(hasLarge)

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
        link2:value.link2,
        hasLarge
      }
    }))
  },[props.usert])

  nonEmptyColumns = ccolumns.filter((col) => 
    rows.some((row) => (row[col.field] !== null) && (row[col.field] !== "null"))
  );

//  useEffect(() => {
//   setColumns(nonEmptyColumns);
//   }, [])

const getRowHeight = (params) => {
  return params.model.hasLarge ? 63 : 40;

};

  return (
    <div style={{ marginLeft:"2vw",height: 600, width: "90vw" }}>
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
      <DataGrid
        className="custom-row-height"
        rows={rows}
        getRowHeight={getRowHeight}
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