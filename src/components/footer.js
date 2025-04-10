import React from 'react'
import { useEffect,useState } from 'react';
// import { styled } from '@mui/material/styles';
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
import LiveMapCarousel from "./carousel"


  function createData(names,nodes, encodings, contains,context ) {
    return { names, nodes, encodings, contains, context };
  }

  function createFoci(Focus, Datasets, Areas, Ethnicities, Languages, Religions) {
    return { Focus, Datasets, Areas, Ethnicities, Languages, Religions  };
  }

 
  const handleButtonClick = async () => {
    try {
      const response = await fetch('https://catmapper.org/api/allDatasets?database=sociomap', {
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


  const [foci,setfoci] = useState([])

  useEffect(() => {

    fetch("https://catmapper.org/api/progress?database=sociomap",
        // fetch("http://127.0.0.1:5001/progress?database=sociomap",
            {
                method: "GET"
            })
            .then(response => {
                return response.json()
            })
            .then(data => {setrows([
              createData(data.nodes[0].current),
              createData("Ethnicities",data.nodes[2].current,(data.encodings[1].current/data.nodes[2].current).toFixed(2),"x",""),
              createData("Areas",data.nodes[1].current,(data.encodings[0].current/data.nodes[1].current).toFixed(2),"x",data.relations[1].current),
              createData("Languages(incl.Dialects,Families)",data.nodes[3].current,(data.encodings[2].current/data.nodes[3].current).toFixed(2),"x",data.relations[2].current),
              createData("Religions",data.nodes[4].current,(data.encodings[3].current/data.nodes[4].current).toFixed(2),"x",data.relations[3].current),
              createData("Variables",data.nodes[5].current,(data.encodings[4].current/data.nodes[5].current).toFixed(2),"x",""),
              createData("Total",data.nodes[1].current+ data.nodes[2].current +data.nodes[3].current+data.nodes[4].current+data.nodes[5].current,
                (data.relations[4].current/(data.nodes[1].current+ data.nodes[2].current +data.nodes[3].current+data.nodes[4].current+data.nodes[5].current)).toFixed(2),
                data.relations[0].current,data.relations[1].current+data.relations[2].current+data.relations[3].current
               ),
            ])
            })
    },[])

  useEffect(() => {
    fetch("https://catmapper.org/api/foci?database=sociomap",
        // fetch("http://127.0.0.1:5001/foci?database=sociomap",
            {
                method: "GET"
            })
            .then(response => {
                return response.json()
            })
            .then(data => {setfoci([
              createFoci(data[0].Focus,data[0].Datasets,data[0].AREAS,data[0].ETHNICITIES,data[0]["LANGUAGES, DIALECTS, and FAMILIES"],data[0].RELIGIONS),
              createFoci(data[1].Focus,data[1].Datasets,data[1].AREAS,data[1].ETHNICITIES,data[1]["LANGUAGES, DIALECTS, and FAMILIES"],data[1].RELIGIONS),
              createFoci(data[2].Focus,data[2].Datasets,data[2].AREAS,data[2].ETHNICITIES,data[2]["LANGUAGES, DIALECTS, and FAMILIES"],data[2].RELIGIONS),
              createFoci(data[3].Focus,data[3].Datasets,data[3].AREAS,data[3].ETHNICITIES,data[3]["LANGUAGES, DIALECTS, and FAMILIES"],data[3].RELIGIONS),
              createFoci(data[4].Focus,data[4].Datasets,data[4].AREAS,data[4].ETHNICITIES,data[4]["LANGUAGES, DIALECTS, and FAMILIES"],data[4].RELIGIONS),
            ]);
            })
    },[])
  
  return (
    <div className='footer'>

<Box sx={{ flexGrow: 1 ,marginLeft:1,marginRight:1,}}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
        <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography id='sociomapfooter' sx={{ fontSize: 20 }} color="#fff" gutterBottom>
        Description
      </Typography>
      <Typography variant="p" color="#fff" component="div">    
                        Explore: All users can search for basic contextual information—geographical location, population size, alternative names, and language—on categories of interest (e.g., Aymara ethnicity, Balochi language, Rajshahi district). They can also identify all datasets that contain specific social, demographic, cultural and economic data for categories of interest.
                        <br/>
                        <br/>
                        Translate: All users can translate categories from new datasets to existing categories in SocioMap and download these translations. Registered users can store and document translations to assist in merging datasets for new analyses and to share with others.Please contact dhruschk@asu.edu if you would like to become a registered user.
                        <br/>
                        <br/>
                        Merge (in development): Registered users can develop, document and share plans for merging data across diverse external datasets by ethnicity, language, religion, or political district. Once a merge plan is developed and saved, SocioMap will be able to generate code in common formats (R, SPSS, Stata, SAS), that will allow users to merge external datasets they have stored on their own computer for their custom analysis needs.
                        <br/>
                        <br/>
                        Share (in development): All users can find and download all others users' past translations and merging plans to merge datasets they have stored on their own computer.                     
      </Typography>
    </CardContent>
    </Card >
      </Grid>

      <Grid item xs={6}>
      <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography id='sociomapfooter' sx={{ fontSize: 20 }} color="#fff" gutterBottom>Dataset Coverage</Typography>
      <Typography variant="table" color="#000" component="div">
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="justify">Focus</TableCell>
            <TableCell align="justify">Datasets</TableCell>
            <TableCell align="justify">Areas</TableCell>
            <TableCell align="justify">Ethnicities</TableCell>
            <TableCell align="justify">Languages</TableCell>
            <TableCell align="justify">Religions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {foci.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.Focus}
              </TableCell>
              <TableCell align="left">{row.Datasets}</TableCell>
              <TableCell align="left">{row.Areas}</TableCell>
              <TableCell align="left">{row.Ethnicities}</TableCell>
              <TableCell align="left">{row.Languages}</TableCell>
              <TableCell align="left">{row.Religions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </Typography>
    </CardContent>
    </Card>
      </Grid>

      <Grid item xs={6}>
      <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography id='sociomapfooter' sx={{ fontSize: 20 }} color="#fff" gutterBottom>
        Dataset Progress &nbsp; 
        <Button
        variant="contained"
        size="small"
        sx={{
          backgroundColor: 'blue',
          color: 'white', 
          '&:hover': {
            backgroundColor: 'green', 
          },fontSize: '0.6rem', padding: '4px 8px'
        }}
        onClick={handleButtonClick}
      >
Download datasets list      </Button>&nbsp;


      DATASETS: {rows[0]?.names}
   

      </Typography>
      <Typography variant="table" color="#000" component="div">
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="justify"></TableCell>
            <TableCell align="justify">Nodes</TableCell>
            <TableCell >Datasets per node</TableCell>
            {/* <TableCell align="justify" >Contains ties</TableCell> */}
            <TableCell align="justify">Context ties</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.filter((_, index) => index !== 0).map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.names}
              </TableCell>
              <TableCell align="left">{row.nodes}</TableCell>
              <TableCell align="left">{row.encodings}</TableCell>
              {/* <TableCell align="left">{row.contains}</TableCell> */}
              <TableCell align="left">{row.context}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </Typography>
    </CardContent>
    </Card>
      </Grid>

      <Grid item xs={6}>
        <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white'}}>
        <CardContent>
      <LiveMapCarousel />
    </CardContent>
    </Card >
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