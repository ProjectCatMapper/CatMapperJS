import React from 'react'
import { styled } from '@mui/material/styles';
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

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#000',
    opacity: "0.3",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'justify',
    color: '#fff',
  }));


  function createData(nodes, relations, DatasetProgress ) {
    return { nodes, relations, DatasetProgress };
  }

  const rows = [
    createData('2,194 DATASETS','258,573 CONTAINS','DISTRICTS 310,839'),
    createData('205,536 DISTRICTS ','253,386 DISTRICT OF','ETHNICITIES 127,553'),
    createData('11,955 ETHNICITIES ','','GENERICS 386'),
    createData('25 GENERICS','6,862	LANGUAGE OF','LANGUAGES, DIALECTS, and FAMILIES	59,925'),
    createData('26,572 LANGUAGES, DIALECTS, and FAMILIES','638	RELIGION OF','RELIGIONS	8,774'),
    createData('2,561 RELIGIONS','','VARIABLES	17,108'),
    createData('104	VARIABLES','524,517	ENCODINGS',''),
  ];
  
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

const footer = () => {
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
                        Share (in development): All userscan find and download all others users' past translations and merging plans to merge datasets they have stored on their own computer. 
                    
      </Typography>
    </CardContent>
    </Card >
      </Grid>

      <Grid item xs={6}>
      <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography id='sociomapfooter' sx={{ fontSize: 20 }} color="#fff" gutterBottom>
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

      <Grid item xs={6}>
      <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography id='sociomapfooter' sx={{ fontSize: 20 }} color="#fff" gutterBottom>
        Citation
      </Typography>
      <Typography variant="p" color="#fff" component="div">
      More information can be found in the following citation. You may also use this citation to reference CatMapper and CatMapper applications.
                        <br/>
                        <br/>
                        Hruschka, Daniel J., Robert Bischoff, Matt Peeples, Sharon Hsiao, and Mohamed Sarwat <br/>2022 CatMapper: A User-Friendly Tool for Integrating Data across Complex Categories. SocArXiv Papers.<br/>https://osf.io/preprints/socarxiv/n6rty/      
      </Typography>
    </CardContent>
    </Card>
      </Grid>

      <Grid item xs={6}>
      <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',paddingLeft:10,}}>
        <CardContent>
      <Typography id='sociomapfooter' sx={{ fontSize: 20 }} color="#fff" gutterBottom>
        Funding
      </Typography>
      <Typography variant="p" color="#fff" component="div">

      Early development of CatMapper has been supported by:<br/><br/>
                    <ol>
                        <li>ASU’s Institute for Social Science Research seed grant</li>
                        <li>School for Human Evolution and Social Change interdisciplinary research grant</li>
                        <li>National Science Foundation (BCS-2051369) through the Human Networks and Data Science and Cultural Anthropology programs.</li>
                        <li>Arizona State University's Center for Archaeology and Society</li>
                    </ol>

        </Typography>
    </CardContent>
    </Card>
      </Grid>
      </Grid>        
    </Box>
        
    </div>
  )
}

export default footer