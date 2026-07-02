import * as React from 'react';
import "./TranslateResults.css"

const MATCH_TYPES = [
  { id: 1, Type: "Total matches", Count: "0%" },
  { id: 2, Type: "exact match", Count: "0%" },
  { id: 3, Type: "fuzzy match", Count: "0%" },
  { id: 4, Type: "one-to-many", Count: "0%" },
  { id: 5, Type: "many-to-one", Count: "0%" },
  { id: 6, Type: "No matches", Count: "0%" }
];

export default function TranslateTable(props) {
  const rows = React.useMemo(() => {
    let totalPercentage = 0;
    const categories = props.categories || {};
    const updatedMatchTypes = MATCH_TYPES.map(match => {
      if (match.Type === "Total matches" || match.Type === "No matches") {
        return { ...match };
      }

      const count = categories[match.Type] || "0%";
      if (count !== "0%") {
        totalPercentage += parseFloat(count.replace('%', ''));
      }
      return { ...match, Count: count };
    });

    const totalMatchesIndex = updatedMatchTypes.findIndex(match => match.Type === "Total matches");
    updatedMatchTypes[totalMatchesIndex].Count = totalPercentage.toFixed(2) + "%";

    const noMatchesIndex = updatedMatchTypes.findIndex(match => match.Type === "No matches");
    updatedMatchTypes[noMatchesIndex].Count = (100 - totalPercentage).toFixed(2) + "%";

    return updatedMatchTypes;
  }, [props.categories])

  const getRowClassName = (row) => {
    if (row.id === 1) {
      return '';
    } else {
      const colorIndex = row.id;
      return `row-color-${colorIndex}`;
    }
  };

  return (
    <div className="translate-table-container">
      <table className="translate-results-table" aria-label="Match statistics">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={getRowClassName(row)}>
              <td>{row.Type}</td>
              <td>{row.Count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
