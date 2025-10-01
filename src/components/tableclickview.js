import { useState,useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import './tableclickview.css'

export default function ClickTable(props) {
  const ccolumns = [
    { field: 'name', headerName: 'Name',flex: 1.3,cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : ''},
    { field: 'spacer', headerName: '', width: 20, sortable: false, filterable: false, disableColumnMenu: true, renderCell: () => null,},
    { field: 'location', headerName: 'Location',flex: 1.3,cellClassName: (params) => params.row.hasLarge ? 'wrap-text-3-lines_dt' : ''},
    { field: 'timespan', headerName: 'Time span',flex: 0.47,headerClassName: 'wrap-header_data',cellClassName: 'timespan_text',renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value === 0 ? "" : params.value}</div>), },
    { field: 'popest', headerName: 'Pop. est.',flex: 0.4,headerClassName: 'wrap-header_data',renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>), },
    { field: 'ctype', headerName: 'Type',flex: 0.4,headerClassName: 'wrap-header_data',renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>), },
    { field: 'samplesize', headerName: 'Sample size',flex: 0.37,headerClassName: 'wrap-header_data',renderCell: (params) => (<div style={{ paddingLeft: '5px' }}>{params.value}</div>),},
    { field: 'source', headerName: 'Source',flex: 0.83,  renderCell: (params1) =>{ return <a id='viewlink' href={params1.row.link2} target="_blank" rel="noopener noreferrer">{params1.row.source}</a>}, },
    { field: 'version', headerName: 'Version',flex: 0.7,cellClassName: (params) => params.value && params.value.length > 10 ? 'wrap-text-3-lines_dt' : '',renderCell: (params) => (<div style={{ paddingLeft: '10px' }}>{params.value}</div>), },
    { field: 'link', headerName: 'Link', flex: 0.4, renderCell: (params) =>{if (params.row.link) {return <a id='viewlink' href={params.row.link} target="_blank" style={{ paddingLeft: '10px' }} rel="noopener noreferrer">{"View"}</a>;}}, },
  ];
  const [rows, setRows] = useState([]);
  let nonEmptyColumns = []
  
  useEffect(() => {
    setRows(props.usert.map((value, key) => {
      const hasLarge = ['Name','Location','Version'].some(column => {
        const text = value[column];
        return text && text.toString().length > 35;
      });

      return {
        id: key + 1,
        name: value.Name,
        location: value.Location,
        timespan:  !value['rStart'] && !value['rEnd'] ? ''
                : value['rStart'] && value['rEnd'] && value['rStart'] === value['rEnd']
                  ? value['rStart']
                  : !value['rStart']
                  ? '-' + value['rEnd']
                  : !value['rEnd']
                  ? value['rStart'] + '-'
                  : value['rStart'] + '-' + value['rEnd'],
        popest: value['Population est.'],
        samplesize: value['Sample size'],
        source: value.Source,
        version: value.Version,
        link: value.Link,
        link2:value.link2,
        ctype: value.cType,
        hasLarge
      }
    }).sort((a, b) => {
      // Compare Source first
      if (a.source < b.source) return -1;
      if (a.source > b.source) return 1;
      // If Source equal, compare Location
      if (a.location < b.location) return -1;
      if (a.location > b.location) return 1;
      // If Location equal, compare timespan
      if (a.timespan < b.timespan) return -1;
      if (a.timespan > b.timespan) return 1;
      // If timespan equal, compare Version
      if (a.version < b.version) return -1;
      if (a.version > b.version) return 1;
      return 0;
    }))
  },[props.usert])

  nonEmptyColumns = ccolumns.filter((col) => 
    rows.some((row) => (row[col.field] !== null) &&  row[col.field] !== undefined && row[col.field] !== '' && (row[col.field] !== "null"))
  );



const getRowHeight = (params) => {
  return params.model.hasLarge ? 63 : 40;

};

  return (
    <div style={{ marginLeft:"2vw",minHeight: 500,maxHeight:750, width: "90vw" }}>
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
        autoHeight
        getRowHeight={getRowHeight}
        columns={nonEmptyColumns}
        sortModel={[
          { field: "source", sort: "asc" },
          { field: "location", sort: "asc" },
          { field: "timespan", sort: "asc" },
          { field: "version", sort: "asc" },
        ]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 30, 50]}
       />
       <p>*population estimate reported directly from source or estimated from survey sample</p>
    </div>
  );
}