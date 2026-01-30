import * as React from 'react';
import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import { useLocation } from 'react-router-dom';


export default function CategoriesTable(props) {
    const { categories, childcategories, rememberChoice, normalized } = props;
    const [rows, setRows] = useState([]);

    childcategories.forEach(c => {
        console.log(c.Domain);
        console.log(c.ChildCount);
    });

    React.useEffect(() => {
        // ---- build maps by Domain ----
        const parentMap = {};
        categories.forEach(c => {
            parentMap[c.Domain] = {
                Count: c.Count,
                useskeys: c.TotalUses
            };
        });

        const childMap = {};
        childcategories.forEach(c => {
            console.log(c);
            childMap[c.Domain] = {
                ChildCount: c.ChildCount,
                childuseskeys: c.TotalChildUses
            };
        });

        // ---- union of all domains ----
        const domains = new Set([
            ...Object.keys(parentMap),
            ...Object.keys(childMap)
        ]);

        // ---- build rows ----
        let mergedRows = Array.from(domains)
            .filter(domain => {
                const hasParent = parentMap[domain] != null;
                const hasChild = childMap[domain] != null;

                // hide child-only domains unless rememberChoice is true
                if (!hasParent && hasChild && !rememberChoice) return false;
                return true;
            })
            .map((Domain, index) => ({
                id: index + 1,
                Domain,
                Count: parentMap[Domain]?.Count ?? null,
                useskeys: parentMap[Domain]?.useskeys ?? null,
                ChildCount: childMap[Domain]?.ChildCount ?? null,
                childuseskeys: childMap[Domain]?.childuseskeys ?? null
            }));

        const domainToNormalizedKey = {};
        Object.entries(normalized).forEach(([key, values]) => {
            values.forEach(domain => {
                domainToNormalizedKey[domain] = key;
            });
        });

        mergedRows.sort((a, b) => {
            const keyA = domainToNormalizedKey[a.Domain] || "";
            const keyB = domainToNormalizedKey[b.Domain] || "";
            // sort first by normalized key order, then alphabetically by domain
            const keyOrder = Object.keys(normalized);
            const idxA = keyOrder.indexOf(keyA);
            const idxB = keyOrder.indexOf(keyB);
            if (idxA !== idxB) return idxA - idxB;
            return a.Domain.localeCompare(b.Domain);
        });

        setRows(mergedRows);
    }, [categories, childcategories, rememberChoice]);

    const hasParentData =
        categories.some(
            c => (c.Count && c.Count > 0) || (c.TotalUses && c.TotalUses > 0)
        );

    const hasChildData =
        childcategories?.some(
            c =>
                (c.ChildCount && c.ChildCount > 0) ||
                (c.TotalChildUses && c.TotalChildUses > 0)
        );


    const columns = [
        { field: 'Domain', headerName: 'Domain', width: 500 },
    ];

    if (hasParentData) {
        columns.push(
            { field: 'Count', headerName: 'Categories', width: 200 },
            { field: 'useskeys', headerName: 'Keys', width: 200 }
        );
    }

    if (rememberChoice && hasChildData) {
        columns.push(
            {
                field: 'ChildCount',
                headerName: 'Child Dataset Categories',
                width: 200
            },
            {
                field: 'childuseskeys',
                headerName: 'Child Dataset Keys',
                width: 200
            }
        );
    }

    // let path = "sociomap"

    // if (useLocation().pathname.includes("archamap")) {
    //     path = "archamap"
    // }

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
                localeText={{ noRowsLabel: "If nothing is displayed, try including connected datasets." }} />
        </div>
    );
}