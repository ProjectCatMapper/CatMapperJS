import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import {useNavigate} from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import "./tableviewsc.css"

export default function DataTable(props) {
  const columns = [
    { field: 'id', headerName: 'Index', flex: 0.3 },
    { field: 'cmid', headerName: 'CMID',  flex: 0.9 },
    { field: 'name', headerName: 'CMName', flex: 2 },
    { field: 'label', headerName: 'Label', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 2,cellClassName: (params) => params.row.hasLargeText ? 'wrap-text-3-lines_ex' : '' },
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
      const hasLargeText = ['country'].some(column => {
        const text = value[column];
        return text && text.toString().length > 50;
      });

      return {
        id: key + 1,
        cmid: value.CMID,
        name: value.CMName,
        label: value.domain,
        country: value.country,
        match: value.matching,
        hasLargeText
      }
    }))
  }, [props.users])

  // React.useEffect(() => {
  //   console.log(rows)
  // }, [rows])


  const getRowHeight = (params) => {
    return params.model.hasLargeText ? 70 : 40;  };

  return (
    <div style={{ height: 650, width: '100%' }}>
      <DataGrid
        className="custom-row-height"
        rows={rows}
        columns={columns}
        getRowHeight={getRowHeight}
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