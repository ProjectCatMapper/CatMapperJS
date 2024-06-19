import React from 'react'
import { Container, Typography, Box, List, ListItem, ListItemText, Divider, Link } from '@mui/material';
import '@fontsource/source-sans-pro';
import Navbar from '../components/Navbar'
import "../components/apiguide.css"

 const Sociomap_ApiGuide = () => {
   return (
     <div style={{backgroundColor:"white"}}>
         <Navbar />
         <Container  sx={{ fontFamily: 'Segou UI' }}>
            <Typography variant="h4" gutterBottom sx={{ marginTop: 4 }}>
                CatMapper API User Guide
            </Typography>
            <Typography variant="body1" gutterBottom>
                This user guide documents the available endpoints for CatMapper's API. The api base URL is {' '}
                <Link className="link" href="https://catmapper.org/api" target="_blank" rel="noopener">
                    https://catmapper.org/api
                </Link>.
            </Typography>
            <Typography variant="body1" gutterBottom>
                Examples can be run within a browser or through various API clients by affixing the examples to the base URL (e.g., {' '}
                <Link className="link" href="https://catmapper.org/api/CMID?database=SocioMap&cmid=SM1" target="_blank" rel="noopener">
                    https://catmapper.org/api/CMID?database=SocioMap&cmid=SM1
                </Link>).
            </Typography>
            <Typography variant="body1" gutterBottom>
                Questions and feedback can be directed to {' '}
                <Link className="link" href="mailto:support@catmapper.org">
                    support@catmapper.org
                </Link>.
            </Typography>

            <Divider sx={{ marginY: 4 }} />

            <Typography variant="h5" gutterBottom>
              <strong>
                API User Guide: Search Endpoint
              </strong>
            </Typography>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Endpoint Description</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    The <code className='codetext'>/search</code> endpoint is tailored for conducting database searches on a single or empty search term on the explore page.
                    This endpoint accommodates searches in specific databases and can filter results based on various parameters such as domain, year range,
                    country, and context.
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>HTTP Request Method</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <ul>
                        <li className='outer'>GET</li>
                    </ul>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Resource URL</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <code className='codetext'>/search</code>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Query Parameters</strong></Typography>
                <List sx={{ listStyleType: 'disc',pl: 4 }}>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="database"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The name of the CatMapper database where the search will be conducted. Only 'SocioMap' and 'ArchaMap' are valid values."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="term (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The search term. If not provided, the search will return all results."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="property (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="Specifies the property to search by, with options including 'Name', 'CMID', or 'Key'."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="domain (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="Specifies the domain category within which the search is conducted. Default is 'CATEGORY'."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="yearStart (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The earliest year of data collection or existence of the category. Results will return if category year range intersects with this range."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="yearEnd (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The latest year of data collection or existence of the category."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="country (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="CMID of the ADM0 node with a ‘DISTRICT_OF’ tie."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="context (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="CMID of the parent node in the network."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="limit (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="Limits the number of results returned; defaults to 10000 if not specified."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="query (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="If set to ‘true’, returns the cypher query instead of executing it."
                        />
                    </ListItem>
                </List>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Request Examples</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <code className='codetext'>GET /search?database=SocioMap&term=Yoruba&domain=ETHNICITY&property=Name</code>
                    <br/>
                    <code className='codetext'>GET /search?database=ArchaMap&term=Grasshopper&domain=SITE&property=Name</code>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Responses</strong></Typography>
                <Box marginBottom={2}>
                    <Typography variant="subtitle1">Successful Response</Typography>
                    <Typography variant="body1" gutterBottom>
                        <ul>
                            <li className='outer'><strong>Status Code:</strong> 200 OK</li>
                            <li className='outer'><strong>Content:</strong></li>
                            <ul>
                                <li className='inner'>If <code>query</code> is set to <code>false</code>, returns a JSON array of search results with fields such as <code>CMID</code>, <code>CMName</code>, <code>country</code>, <code>domain</code>, <code>matching</code>, and <code>matchingDistance</code>.</li>
                                <li className='inner'>If <code>query</code> is set to <code>true</code>, returns a JSON object containing the cypher query and relevant parameters.</li>
                            </ul>
                        </ul>
                    </Typography>
                </Box>
                <Box marginBottom={2}>
                    <Typography variant="subtitle1">Error Response</Typography>
                    <Typography variant="body1" gutterBottom>
                        <ul>
                            <li className='outer'><strong>Status Code:</strong> 500 Internal Server Error</li>
                            <li className='outer'><strong>Content:</strong> A JSON object detailing the error encountered during the search operation.</li>
                        </ul>
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ marginY: 4 }} />

            <Typography variant="h5" gutterBottom>
              <strong>
              API User Guide: Retrieve CMID Details
              </strong>
            </Typography>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Endpoint Description</strong></Typography>
                <Typography variant="body1" gutterBottom>
                This API endpoint <code className='codetext'>/CMID</code> is designed to retrieve comprehensive details about a specific CatMapperID (CMID) from different databases. It fetches both node properties and their relationships associated with the specified CMID. The endpoint supports the GET method and requires the specification of both the database and the CMID.
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>HTTP Request Method</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <ul>
                        <li className='outer'>GET</li>
                    </ul>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Resource URL</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <code className='codetext'>/CMID</code>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Query Parameters</strong></Typography>
                <List sx={{ listStyleType: 'disc',pl: 4 }}>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="database"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The name of the CatMapper database where the search will be conducted. Only 'SocioMap' and 'ArchaMap' are valid values."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="cmid"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The CatMapperID for which details are to be retrieved. This should be a valid identifier that exists within the specified database."
                        />
                    </ListItem>
                </List>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Request Examples</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <code className='codetext'>GET /CMID?database=SocioMap&cmid=SM1</code>
                    <br/>
                    <code className='codetext'>GET /CMID?database=ArchaMap&cmid=AM1</code>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Responses</strong></Typography>
                <Box marginBottom={2}>
                    <Typography variant="subtitle1">Successful Response</Typography>
                    <Typography variant="body1" gutterBottom>
                        <ul>
                            <li className='outer'><strong>Status Code:</strong> 200 OK</li>
                            <li className='outer'><strong>Content:</strong> A JSON object containing detailed information about the node and its relationships. The response structure is as follows:</li>
                            <ul>
                                <li className='inner'><strong>node:</strong> An array of objects, each representing a node property:</li>
                                <ul>
                                <li className='inner1'><strong>nodeID:</strong> The identifier of the node.</li>
                                <li className='inner1'><strong>nodeProperties:</strong> The property name of the node.</li>
                                <li className='inner1'><strong>nodeValues:</strong> The value associated with the node property.</li>
                                </ul>
                                <li className='inner'><strong>relations:</strong> An object mapping relationship IDs to their properties:</li>
                                <ul>
                                <li className='inner1'>Each relationship ID will have associated properties and values.</li>
                                </ul>
                            </ul>
                        </ul>
                    </Typography>
                </Box>
                <Box marginBottom={2}>
                    <Typography variant="subtitle1">Error Response</Typography>
                    <Typography variant="body1" gutterBottom>
                        <ul>
                            <li className='outer'><strong>Status Code:</strong> 500 Internal Server Error</li>
                            <li className='outer'><strong>Content:</strong>  A string message detailing the nature of the error, usually related to incorrect or missing parameters.</li>
                        </ul>
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ marginY: 4 }} />

            <Typography variant="h5" gutterBottom>
              <strong>
              API User Guide: Retrieve Dataset Details
              </strong>
            </Typography>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Endpoint Description</strong></Typography>
                <Typography variant="body1" gutterBottom>
                This API endpoint <code className='codetext'>/dataset</code> is designed to retrieve detailed information about a dataset based on a given CMID (CatMapperID) from the specified database, filtering additionally by domain categories. This endpoint allows for querying dataset relations and properties within specified domains. It uses a GET method and requires specifying the database, CMID, and optionally the domain.
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>HTTP Request Method</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <ul>
                        <li className='outer'>GET</li>
                    </ul>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Resource URL</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <code className='codetext'>/dataset</code>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Query Parameters</strong></Typography>
                <List sx={{ listStyleType: 'disc',pl: 4 }}>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="database"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The name of the CatMapper database where the search will be conducted. Only 'SocioMap' and 'ArchaMap' are valid values."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="cmid"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The CatMapperID of the dataset for which information is to be retrieved."
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="domain (optional)"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="A category to filter dataset relationships. Defaults to “CATEGORY” if not specified."
                        />
                    </ListItem>
                </List>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Request Examples</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <code className='codetext'>GET /dataset?database=SocioMap&cmid=SD1&domain=CATEGORY</code>
                    <br/>
                    <code className='codetext'>GET /dataset?database=ArchaMap&cmid=AD1</code>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Responses</strong></Typography>
                <Box marginBottom={2}>
                    <Typography variant="subtitle1">Successful Response</Typography>
                    <Typography variant="body1" gutterBottom>
                        <ul>
                            <li className='outer'><strong>Status Code:</strong> 200 OK</li>
                            <li className='outer'><strong>Content: </strong> A JSON array of objects, each representing details of relationships and properties of datasets related to the specified CMID. Typical properties included are:</li>
                            <ul>
                                <li className='inner'><strong>datasetName: </strong> The name of the dataset.</li>
                                <li className='inner'><strong>datasetID: </strong> The CMID of the dataset.</li>
                                <li className='inner'><strong>CMID: </strong> The CatMapperID of related entities.</li>
                                <li className='inner'><strong>CMName: </strong> The name of related entities.</li>
                                <li className='inner'><strong>type: </strong> The type of relationship.</li>
                                <li className='inner'><strong>key: </strong> Key information of the relationship.</li>
                                <li className='inner'>Other dynamic properties based on the dataset’s schema and the specified domain.</li>
                            </ul>
                        </ul>
                    </Typography>
                </Box>
                <Box marginBottom={2}>
                    <Typography variant="subtitle1">Error Response</Typography>
                    <Typography variant="body1" gutterBottom>
                        <ul>
                            <li className='outer'><strong>Status Code:</strong> 500 Internal Server Error</li>
                            <li className='outer'><strong>Content:</strong> A string message indicating the nature of the error, typically related to incorrect database or CMID parameters or issues with database connections.</li>
                        </ul>
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ marginY: 4 }} />

            <Typography variant="h5" gutterBottom>
              <strong>
              API User Guide: Retrieve All Datasets
              </strong>
            </Typography>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Endpoint Description</strong></Typography>
                <Typography variant="body1" gutterBottom>
                This API endpoint <code className='codetext'>/allDatasets</code> provides a method to retrieve detailed information about datasets from different databases. The endpoint supports a GET method that requires specifying a particular database from which to fetch datasets.
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>HTTP Request Method</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <ul>
                        <li className='outer'>GET</li>
                    </ul>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Resource URL</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <code className='codetext'>/allDatasets</code>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Query Parameters</strong></Typography>
                <List sx={{ listStyleType: 'disc',pl: 4 }}>
                    <ListItem sx={{ display: 'list-item' }}>
                        <ListItemText
                            primary="database"
                            primaryTypographyProps={{fontWeight:"bold"}}
                            secondary="The name of the CatMapper database where the search will be conducted. Only 'SocioMap' and 'ArchaMap' are valid values."
                        />
                    </ListItem>
                </List>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Request Examples</strong></Typography>
                <Typography variant="body1" gutterBottom>
                    <code className='codetext'>GET /allDatasets?database=SocioMap</code>
                    <br/>
                    <code className='codetext'>GET /allDatasets?database=ArchaMap</code>
                </Typography>
            </Box>

            <Box marginBottom={2}>
                <Typography variant="h6"><strong>Responses</strong></Typography>
                <Box marginBottom={2}>
                    <Typography variant="subtitle1">Successful Response</Typography>
                    <Typography variant="body1" gutterBottom>
                        <ul>
                            <li className='outer'><strong>Status Code:</strong> 200 OK</li>
                            <li className='outer'><strong>Content: </strong> An array of objects, where each object represents a dataset with the following fields:</li>
                            <ul>
                                <li className='inner'><strong>nodeID: </strong> Identifier of the dataset node.</li>
                                <li className='inner'><strong>CMName: </strong> CatMapper name associated with the dataset.</li>
                                <li className='inner'><strong>CMID: </strong> CatMapper ID for the dataset.</li>
                                <li className='inner'><strong>shortName: </strong> A shorter, more concise name for the dataset.</li>
                                <li className='inner'><strong>project: </strong> The project under which the dataset was created or is maintained.</li>
                                <li className='inner'><strong>Unit: </strong> The unit the dataset applies to.</li>
                                <li className='inner'><strong>parent: </strong> The parent dataset, if any.</li>
                                <li className='inner'><strong>ApplicableYears: </strong> The years to which the dataset is applicable.</li>
                                <li className='inner'><strong>DatasetCitation: </strong> Citation information for the dataset.</li>
                                <li className='inner'><strong>District: </strong> The district covered by the dataset.</li>
                                <li className='inner'><strong>DatasetLocation: </strong> URL or other location of the dataset.</li>
                                <li className='inner'><strong>SubNational: </strong> Indicates if the dataset is sub-national.</li>
                                <li className='inner'><strong>DatasetVersion: </strong>  Version information of the dataset.</li>
                                <li className='inner'><strong>DatasetScope: </strong> The scope of the dataset.</li>
                                <li className='inner'><strong>Subdistrict: </strong> The subdistrict covered by the dataset.</li>
                                <li className='inner'><strong>Note: </strong> Additional notes or comments about the dataset.</li>
                            </ul>
                        </ul>
                    </Typography>
                </Box>
                <Box marginBottom={2}>
                    <Typography variant="subtitle1">Error Response</Typography>
                    <Typography variant="body1" gutterBottom>
                        <ul>
                            <li className='outer'><strong>Status Code:</strong> 500 Internal Server Error</li>
                            <li className='outer'><strong>Content:</strong> A string message describing the error, typically related to an invalid database specification or connection issues.</li>
                        </ul>
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ marginY: 4 }} />


        </Container>

     </div>
   )
 }


export default Sociomap_ApiGuide;