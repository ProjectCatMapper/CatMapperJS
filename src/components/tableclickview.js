import React from 'react';
import { useState,useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import './tableclickview.css'

export default function ClickTable(props) {
  const ccolumns = [
    { field: 'name', headerName: 'Name',flex: 2,cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : ''},
    {
      field: 'spacer', // Dummy field for space
      headerName: '',
      width: 50, // Set desired width for the space
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: () => null, // Renders an empty cell
    },
    { field: 'location', headerName: 'Location',flex: 1,cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : ''},
    { field: 'timespan', headerName: 'Time span',flex: 0.3,headerClassName: 'wrap-header_data' },
    { field: 'popest', headerName: 'Population est.',flex: 0.35,headerClassName: 'wrap-header_data' },
    { field: 'samplesize', headerName: 'Sample size',flex: 0.3,headerClassName: 'wrap-header_data'},
    { field: 'source', headerName: 'Source',flex: 0.8,  renderCell: (params1) =>{ return <a id='viewlink' href={params1.row.link2} target="_blank" rel="noopener noreferrer">{params1.row.source}</a>}, },
    { field: 'version', headerName: 'Version',flex: 0.7,cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : '' },
    { field: 'link', headerName: 'Link', flex: 0.4, renderCell: (params) =>{if (params.row.link) {return <a id='viewlink' href={params.row.link} target="_blank" rel="noopener noreferrer">{"View"}</a>;}}, },
  ];
  const [rows, setRows] = useState([]);
  let nonEmptyColumns = []

  //React.useEffect(() => {console.log(props.usert)},[])
  
  useEffect(() => {
    setRows(props.usert.map((value, key) => {
      const hasLarge = ['Name','Location','Version'].some(column => {
        console.log(value)
        const text = value[column];
        return text && text.toString().length > 30;
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