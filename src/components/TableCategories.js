import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';


export default function CategoriesTable(props) {
    const columns = [
        { field: 'Domain', headerName: 'Domain', width: 500 },
        { field: 'Count', headerName: 'Categories', width: 200 },
        { field: 'useskeys', headerName: 'Keys', width: 200 },
        { field: 'ChildCount', headerName: 'Child Dataset Categories', width: 200 },
        { field: 'childuseskeys', headerName: 'Child Dataset Keys', width: 200 },
    ];
    const [rows, setRows] = useState([]);
    let path = "sociomap"

    if (useLocation().pathname.includes("archamap")) {
        path = "archamap"
    }

    React.useEffect(() => {
        setRows(props.categories.map((value, key) => {
            return {
                id: key + 1,
                Domain: value.Domain,
                Count: value.Count,
                useskeys: value.TotalUses,
                ChildCount: value.UnderChildCount,
                childuseskeys: value.TotalChildUses
            }
        }))
    }, [props.categories])

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
                localeText={{ noRowsLabel: "No results to display" }} />
        </div>
    );
}