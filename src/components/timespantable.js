import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Box, Tabs, Tab } from '@mui/material';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function TimespanTable({ data }) {
  const [chartData, setChartData] = useState([]);
  const [chartData1, setChartData1] = useState([]);
  const colorScale = scaleOrdinal(schemeCategory10);
  const [minyear, setMinYear] = useState([]);
  const [maxyear, setMaxYear] = useState([]);
  const [bwidth, setBwidth] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [minyear1, setMinYear1] = useState([]);
  const [maxyear1, setMaxYear1] = useState([]);
  const [bwidth1, setBwidth1] = useState([]);
  let entries = {}
  const currentYear = new Date().getFullYear();
  let flag = false


  const generateChartData = (validEntries,minYear,maxYear) => {
    const yearSpans = [];
    
    const sourceYearCounts = {};
      
validEntries.forEach(entry => {
  let source = entry.Source
  let Start = parseInt(entry.Start)
  let End = parseInt(entry.End)
  yearSpans.push({ source, Start, End });
});

const barwidth = Math.ceil(Math.abs((minYear - maxYear) / 2000)) || 1;

yearSpans.forEach(entry => {
  if (entry.Start === entry.End){
    entry.End = entry.Start + 1
  }

  if (isNaN(entry.End)){  
    entry.End = maxYear
    if (entry.End === entry.Start){
      entry.End = currentYear
      maxYear = currentYear
      flag = true
    }
  
  }

  if (isNaN(entry.Start)){
    entry.Start = minYear
  }
})

if (flag === true){
  maxYear = currentYear
}

yearSpans.forEach(({ source, Start, End }) => {
  if (!sourceYearCounts[source]) sourceYearCounts[source] = {};

  for (let year = minYear; year <= maxYear; year += barwidth) {
    if (Start < year+barwidth && End >= year) {
      sourceYearCounts[source][year] = (sourceYearCounts[source][year] || 0) + 1;
    }
  }
});

    const allYearsSet = new Set();
    Object.values(sourceYearCounts).forEach(years =>
      Object.keys(years).forEach(year => allYearsSet.add(Number(year)))
    );
    const allYears = Array.from(allYearsSet).sort((a, b) => a - b);

    const rawChartData = allYears.map(year => {
      const row = { year };
      for (const source in sourceYearCounts) {
        row[source] = sourceYearCounts[source][year] || 0;
      }
      return row;
    });

    const activeSources = Object.keys(sourceYearCounts).filter(source =>
      rawChartData.some(row => row[source] > 0)
    );
    const filteredChartData = rawChartData.map(row => {
      const filteredRow = { year: row.year };
      activeSources.forEach(source => {
        filteredRow[source] = row[source];
      });
      return filteredRow;
    });

  return { filteredChartData, barwidth };
    
  }

  useEffect(() =>{
  
  //removes entries where both rStart and rEnd are null
  entries = data.filter(entry => {
      const rStart = entry["rStart"]?.trim();
      const rEnd = entry['rEnd']?.trim()
      return (rStart && rStart !== "null") || (rEnd && rEnd !== "null");
    }).map(entry => ({
    Start: entry["rStart"]?.trim(),
    End: entry["rEnd"]?.trim(),
    Source: entry["Source"] || "Unknown",
  }));

  let years = entries.flatMap(entry => [entry.Start, entry.End])
  .map(val => parseInt(val))
  .filter(val => isFinite(val));

  let minYear = Math.min(...years);
  let maxYear = Math.max(...years);  
  
  if (entries.length > 0) {

  const chart1 = generateChartData(entries,minYear,maxYear);
  setChartData(chart1.filteredChartData);
  setMinYear(minYear);
  setMaxYear(maxYear);
  setBwidth(chart1.barwidth);
  }
  else{
    setChartData("");
  }

  entries = data.filter(entry => {
      const rStart = entry["yStart"]?.trim();
      const rEnd = entry['yEnd']?.trim()
      return (rStart && rStart !== "null") || (rEnd && rEnd !== "null");
    }).map(entry => ({
    Start: entry["yStart"]?.trim(),
    End: entry["yEnd"]?.trim(),
    Source: entry["Source"] || "Unknown",
  }));

  years = entries.flatMap(entry => [entry.Start, entry.End])
  .map(val => parseInt(val))
  .filter(val => isFinite(val));

  minYear = Math.min(...years);
  maxYear = Math.max(...years); 

  if (entries.length > 0) {

  const chart2 = generateChartData(entries,minYear,maxYear);
  console.log(chart2.filteredChartData)
  setChartData1(chart2.filteredChartData);
  setMinYear1(minYear);
  setMaxYear1(maxYear);
  setBwidth1(chart2.barwidth);

  }
  else{
    setChartData1("");
  }
},[data]);


  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 2,
          },
        }}
      >
        <Tab label="Span of Observations" />
        <Tab label="Span of existence" />
      </Tabs>
    
    <TabPanel value={tabIndex} index={0}>
    {chartData ? (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}
       barCategoryGap={0} barGap={0}  >
        <XAxis
          dataKey="year"
          type="number"
          //minTickGap={20}
          domain={[minyear -(2*bwidth),maxyear+(2*bwidth)]}
          tickFormatter={year =>
            year < 0 ? `${-year} BCE` : `${year} CE`
          }
        />
        <YAxis
          label={{ value: 'Sample count', angle: -90, position: 'insideLeft' }}
          allowDecimals={false}
        />
         {chartData.length > 0 && Object.keys(chartData[0]).filter(key => key !== 'year').length <= 7 && (
      <Legend />
    )}
      {chartData.length > 0 && (() => {
      const keys = Object.keys(chartData[0]).filter(key => key !== 'year');
      const showColors = keys.length <= 7;
      const isSingleBar = chartData.length === 1;

      return keys.map(source => (
        <Bar
          key={source}
          dataKey={source}
          stackId="a"
          //barSize={5}
          {...(isSingleBar ? { barSize: 5 } : {})}
          {...(showColors ? { fill: colorScale(source) } : {})}
        />
      ));
    })()}
      </BarChart>
    </ResponsiveContainer>) : <p>No observation graph available</p>}
    </TabPanel>

    <TabPanel value={tabIndex} index={1}>
      {chartData1 ?(
        <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData1}
      barCategoryGap={0} barGap={0}>
        <XAxis
          dataKey="year"
          type="number"
          minTickGap={20}
          domain={[minyear1 -(2*bwidth1),maxyear1+(2*bwidth1)]}
          tickFormatter={year =>
            year < 0 ? `${-year} BCE` : `${year} CE`
          }
        />
        <YAxis
          label={{ value: 'Sample count', angle: -90, position: 'insideLeft' }}
          allowDecimals={false}
        />
         {chartData1.length > 0 && Object.keys(chartData1[0]).filter(key => key !== 'year').length <= 7 && (
      <Legend />
    )}
      {chartData1.length > 0 && (() => {
      const keys = Object.keys(chartData1[0]).filter(key => key !== 'year');
      const showColors = keys.length <= 7;
      const isSingleBar = chartData1.length === 1;

      return keys.map(source => (
        <Bar
          key={source}
          dataKey={source}
          stackId="a"
          //barSize={5}
          {...(isSingleBar ? { barSize: 5 } : {})}
          {...(showColors ? { fill: colorScale(source) } : {})}
        />
      ));
    })()}
      </BarChart>
    </ResponsiveContainer>) : <p>No existence graph available.</p>}
      </TabPanel>
    </Box>
  );
}
