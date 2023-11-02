import React from 'react'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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
    createData('1,479 CERAMICS','','CERAMICS	19,682'),
    createData('942	DATASETS ','2,523	CONTAINS','DISTRICTS	30,582'),
    createData('21,706 DISTRICTS ','7,472 DISTRICT OF','PERIODS	7,747'),
    createData('6,107 PERIODS, DIALECTS, and FAMILIES','','PROJECTILE POINTS	226'),
    createData('182	PROJECTILE POINTS','58,269	ENCODINGS','VARIABLES	10'),
    createData('5 VARIABLES','',''),
  ];
  

const footer = () => {
  return (
    <div className='footer'>

<Box sx={{ flexGrow: 1 ,marginLeft:1,marginRight:1,}}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
        <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography sx={{ fontSize: 20 }} color="#fff" gutterBottom>
        Description
      </Typography>
      <Typography variant="p" color="#fff" component="div">
     
      ArchaMap is actively looking for contributors. See the help page for instructions. Contact dhruschk@asu.edu for questions or to contribute.
      </Typography>
    </CardContent>
    </Card >
      </Grid>

      <Grid item xs={6}>
      <Card variant="outlined" style={{backgroundColor: 'black',border: '1px solid white',}}>
        <CardContent>
      <Typography sx={{ fontSize: 20 }} color="#fff" gutterBottom>
        Dataset Progress
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
      <Typography sx={{ fontSize: 20 }} color="#fff" gutterBottom>
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
      <Typography sx={{ fontSize: 20 }} color="#fff" gutterBottom>
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