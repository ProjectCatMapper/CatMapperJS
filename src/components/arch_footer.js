import React from 'react'
import { useEffect,useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './footer.css'
import image from '../assets/white.png'
import { Link } from 'react-router-dom'
import Divider from '@mui/material/Divider';


  function createData(nodes, relations, DatasetProgress ) {
    return { nodes, relations, DatasetProgress };
  }

  // function createFoci(Focus, Datasets, Areas, Ethnicities, Languages, Religions) {
  //   return { Focus, Datasets, Areas, Ethnicities, Languages, Religions  };
  // }

  const handleButtonClick = async () => {
    try {
      const response = await fetch('https://catmapper.org/api/allDatasets?database=archamap', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      saveAs(blob, 'data.xlsx');
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  

const Footer = () => {

  const [rows, setrows] = useState([]);

  // const [foci,setfoci] = useState([])

  // useEffect(() => {
  //   fetch("https://catmapper.org/api/foci?database=archamap",
  //       // fetch("http://127.0.0.1:5001/foci?database=archamap",
  //           {
  //               method: "GET"
  //           })
  //           .then(response => {
  //               return response.json()
  //           })
  //           .then(data => {setfoci([
  //             createFoci(data[0].Focus,data[0].Datasets,data[0].AREAS,data[0].ETHNICITIES,data[0]["LANGUAGES, DIALECTS, and FAMILIES"],data[0].RELIGIONS),
  //             createFoci(data[1].Focus,data[1].Datasets,data[1].AREAS,data[1].ETHNICITIES,data[1]["LANGUAGES, DIALECTS, and FAMILIES"],data[1].RELIGIONS),
  //             createFoci(data[2].Focus,data[2].Datasets,data[2].AREAS,data[2].ETHNICITIES,data[2]["LANGUAGES, DIALECTS, and FAMILIES"],data[2].RELIGIONS),
  //             createFoci(data[3].Focus,data[3].Datasets,data[3].AREAS,data[3].ETHNICITIES,data[3]["LANGUAGES, DIALECTS, and FAMILIES"],data[3].RELIGIONS),
  //             createFoci(data[4].Focus,data[4].Datasets,data[4].AREAS,data[4].ETHNICITIES,data[4]["LANGUAGES, DIALECTS, and FAMILIES"],data[4].RELIGIONS),
  //           ]);
  //           })
  //   },[])

  useEffect(() => {

    fetch("https://catmapper.org/api/progress?database=archamap",
        // fetch("http://127.0.0.1:5001/progress?database=archamap",
            {
                method: "GET"
            })
            .then(response => {
                return response.json()
            })
            .then(data => {setrows([
              createData(data.nodes[0].current.toLocaleString()+ " " + data.nodes[0].label,data.relations[0].current.toLocaleString()+ " " + data.relations[0].label,data.encodings[0].current.toLocaleString()+ " " + data.encodings[0].label),
              createData(data.nodes[1].current.toLocaleString()+ " " + data.nodes[1].label,"",data.encodings[1].current.toLocaleString()+ " " + data.encodings[1].label),
              createData(data.nodes[2].current.toLocaleString()+ " " + data.nodes[2].label,"",data.encodings[2].current.toLocaleString()+ " " + data.encodings[2].label),
              createData(data.nodes[3].current.toLocaleString()+ " " + data.nodes[3].label,data.relations[1].current.toLocaleString()+ " " + data.relations[1].label,data.encodings[3].current.toLocaleString()+ " " + data.encodings[3].label),
              createData(data.nodes[4].current.toLocaleString()+ " " + data.nodes[4].label,"",data.encodings[4].current.toLocaleString()+ " " + data.encodings[4].label),
              createData(data.nodes[5].current.toLocaleString()+ " " + data.nodes[5].label,"",data.encodings[5].current.toLocaleString()+ " " + data.encodings[5].label),
              createData(data.nodes[6].current.toLocaleString()+ " " + data.nodes[6].label,data.relations[2].current.toLocaleString()+ " " + data.relations[2].label,data.encodings[6].current.toLocaleString()+ " " + data.encodings[6].label),
              createData(data.nodes[7].current.toLocaleString()+ " " + data.nodes[7].label,"",data.encodings[7].current.toLocaleString()+ " " + data.encodings[7].label),
              createData(data.nodes[8].current.toLocaleString()+ " " + data.nodes[8].label,"",data.encodings[8].current.toLocaleString()+ " " + data.encodings[8].label),
              createData(data.nodes[9].current.toLocaleString()+ " " + data.nodes[9].label,data.relations[3].current.toLocaleString()+ " " + data.relations[3].label,""),            
            ])
            })
    },[])

  return (
    <div className='footer'>

<Box sx={{ flexGrow: 1 ,marginLeft:1,marginRight:1,}}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
        <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography id ='sociomapfooter' sx={{ fontSize: 20 }} color="#fff" gutterBottom>
        Description
      </Typography>
      <Typography variant="p" color="#fff" component="div">
     
      ArchaMap is an open-source tool designed to aid in the integration of multiple complex data sets with different sources, data ontologies, and resolutions. ArchaMap is designed to save time, increase consistency, and document complex data merging processes among multiple sources. This application stores and suggests past translations to build an ever-expanding list of associations to aid in connecting categorical data across different sources. ArchaMap uses previously uploaded categories to build a database of potential category names and includes contextual information to help users find the appropriate match.
      </Typography>
    </CardContent>
    </Card >
      </Grid>

      <Grid item xs={6}>
      <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography id="sociomapfooter" sx={{ fontSize: 20 }} color="#fff" gutterBottom>
        Dataset Progress
        <Button
        variant="contained"
        size="small"
        color="primary"
        sx={{ fontSize: '0.6rem', padding: '4px 8px' }}
        onClick={handleButtonClick}
      >
Download datasets list      </Button>
      </Typography>
      <Typography variant="table" color="#000" component="div">
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="justify">Nodes</TableCell>
            <TableCell align="justify">Relations</TableCell>
            <TableCell align="justify">Dataset Progress</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.nodes}
              </TableCell>
              <TableCell align="left">{row.relations}</TableCell>
              <TableCell align="left">{row.DatasetProgress}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </Typography>
    </CardContent>
    </Card>
      </Grid>

      </Grid>        
    </Box>
    <Divider sx={{ marginTop: 3, marginBottom: 7, marginLeft:1,marginRight:1, backgroundColor: 'white' }} />
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb:0 }}>
        <img src={image} alt="CatMapper Logo" style={{ height: 80 }} />
        <Box>
          <Link  id="catmapperfooter" to="/people"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>People</Link>
          <Link to="/news" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>News</Link>
          <Link to="/funding" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Funding</Link>
          <Link to="/citation" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Citation</Link>
          <Link to="/terms" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Terms</Link>
          <Link to="/contact" id="catmapperfooter"  underline="none" style={{ color: 'white', textDecoration: 'none', margin: '0 8px' }}>Contact</Link>
        </Box>
      </Box>


    </div>
  )
}

export default Footer