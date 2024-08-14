import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import "./translate_Categories.css"

export default function TranslateTable(props) {
  const columns = [
    { field: 'Type', headerName: 'Type', width: 150 },
    { field: 'Count', headerName: 'Count', width: 100 },
  ];
  const [rows, setRows] = useState([]);
  const matchTypes = [
    { id: 1, Type: "Total matches", Count: "0%" },
    { id: 2, Type: "exact match", Count: "0%" },
    { id: 3, Type: "fuzzy match", Count: "0%" },
    { id: 4, Type: "one-to-many", Count: "0%" },
    { id: 5, Type: "many-to-one", Count: "0%" },
    { id: 6, Type: "No matches", Count: "0%" }
  ];

  React.useEffect(() => {
    let totalPercentage = 0;
  const updatedMatchTypes = matchTypes.map(match => {
    if (match.Type === "Total matches" || match.Type === "No matches") {
      return match; 
    }

    const count = props.categories[match.Type] || "0%";
    if (count !== "0%") {
      totalPercentage += parseFloat(count.replace('%', ''));
    }
    return { ...match, Count: count };
  });

  const totalMatchesIndex = updatedMatchTypes.findIndex(match => match.Type === "Total matches");
  updatedMatchTypes[totalMatchesIndex].Count = totalPercentage.toFixed(2) + "%";

  const noMatchesIndex = updatedMatchTypes.findIndex(match => match.Type === "No matches");
  updatedMatchTypes[noMatchesIndex].Count = (100 - totalPercentage).toFixed(2) + "%";
  console.log(updatedMatchTypes)

  setRows(updatedMatchTypes);
  }, [props.categories])

  const getRowClassName = (params) => {
    if (params.row.id === 1) {
      return '';
    } else {
      const colorIndex = params.row.id;
      return `row-color-${colorIndex}`;
    }
  };

  return (
    <div className="translate-table-container">
      <DataGrid
        rows={rows}
        columns={columns}
        getRowClassName={getRowClassName}
        localeText={{ noRowsLabel: "No results to display" }}
        rowHeight={30}
        pagination={false}
        hideFooter={true} 
        />
    </div>
  );
}
