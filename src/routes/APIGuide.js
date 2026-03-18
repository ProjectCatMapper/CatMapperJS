import { Container, Typography, Box, List, ListItem, ListItemText, Divider, Link } from '@mui/material';
import '@fontsource/source-sans-pro';
import Navbar from '../components/NavbarHome';
import '../components/APIGuides.css';

const ApiGuide = () => {
  return (
    <div style={{ backgroundColor: 'white' }}>
      <Navbar />
      <Container sx={{ fontFamily: 'Segou UI' }}>
        <Typography variant="h4" gutterBottom sx={{ marginTop: 4 }}>
          CatMapper API User Guide
        </Typography>

        <Typography variant="body1" gutterBottom>
          This user guide documents public CatMapper API endpoints. The API base URL is{' '}
          <Link className="link" href="https://api.catmapper.org" target="_blank" rel="noopener">
            https://api.catmapper.org
          </Link>.
        </Typography>
        <Typography variant="body1" gutterBottom>
          Example:{' '}
          <Link
            className="link"
            href="https://api.catmapper.org/CMID/SocioMap/SM1"
            target="_blank"
            rel="noopener"
          >
            https://api.catmapper.org/CMID/SocioMap/SM1
          </Link>
        </Typography>
        <Typography variant="body1" gutterBottom>
          Questions and feedback can be directed to{' '}
          <Link className="link" href="mailto:support@catmapper.org">
            support@catmapper.org
          </Link>.
        </Typography>
        <Typography variant="body1" gutterBottom>
          API explorer:{' '}
          <Link className="link" href="https://api.catmapper.org/docs" target="_blank" rel="noopener">
            https://api.catmapper.org/docs
          </Link>
        </Typography>

        <Divider sx={{ marginY: 4 }} />

        <Typography variant="h5" gutterBottom>
          <strong>API User Guide: Search Endpoint</strong>
        </Typography>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Endpoint Description</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            The <code className="codetext">/search</code> endpoint supports Explore-style search over
            CatMapper categories and datasets. You can filter by domain, year range, country, context,
            contexts, and dataset.
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>HTTP Request Method</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <ul>
              <li className="outer">GET</li>
            </ul>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Resource URL</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <code className="codetext">/search</code>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Query Parameters</strong>
          </Typography>
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="database"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Required. CatMapper database name. Typical values: SocioMap or ArchaMap."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="term (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Search value. If omitted, the endpoint can return broad domain-scoped results."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="property (required when term is set)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Property searched by term. Common values: Name, CMID, Key."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="domain (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Domain label filter. If omitted, search defaults to ALLNODES behavior."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="yearStart (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Start year filter. Must be supplied together with yearEnd."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="yearEnd (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="End year filter. Must be supplied together with yearStart."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="country (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Country CMID filter (ADM0 context)."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="context (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Single parent/context CMID filter."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="contexts (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Comma-separated or repeated context CMIDs for multi-context filtering."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="contextMode (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="all (default) requires all listed contexts; any requires at least one."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="dataset (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Dataset CMID filter (e.g., SD..., AD...)."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="query (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="If true, returns generated Cypher + parameters instead of data."
              />
            </ListItem>
          </List>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Request Examples</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <code className="codetext">
              GET /search?database=SocioMap&term=Yoruba&domain=ETHNICITY&property=Name&query=false
            </code>
            <br />
            <code className="codetext">
              GET /search?database=ArchaMap&term=Grasshopper&domain=SITE&property=Name&dataset=AD1&query=false
            </code>
            <br />
            <code className="codetext">
              GET /search?database=SocioMap&term=Yoruba&domain=ETHNICITY&property=Name&contexts=SM47,SM2508&contextMode=all&query=false
            </code>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Responses</strong>
          </Typography>
          <Box marginBottom={2}>
            <Typography variant="subtitle1">Successful Response</Typography>
            <Typography variant="body1" gutterBottom>
              <ul>
                <li className="outer">
                  <strong>Status Code:</strong> 200 OK
                </li>
                <li className="outer">
                  <strong>Content when query=false:</strong> JSON object with{' '}
                  <code>data</code> (result rows) and <code>count</code> (includes <code>totalCount</code>{' '}
                  and CMID list).
                </li>
                <li className="outer">
                  <strong>Content when query=true:</strong> JSON object with <code>query</code> and{' '}
                  <code>parameters</code>.
                </li>
              </ul>
            </Typography>
          </Box>
          <Box marginBottom={2}>
            <Typography variant="subtitle1">Error Response</Typography>
            <Typography variant="body1" gutterBottom>
              <ul>
                <li className="outer">
                  <strong>Status Code:</strong> 500 Internal Server Error
                </li>
                <li className="outer">
                  <strong>Content:</strong> Error message string.
                </li>
              </ul>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ marginY: 4 }} />

        <Typography variant="h5" gutterBottom>
          <strong>API User Guide: Retrieve CMID Details</strong>
        </Typography>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Endpoint Description</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            This endpoint retrieves properties for a CMID node and grouped USES relationship properties.
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>HTTP Request Method</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <ul>
              <li className="outer">GET</li>
            </ul>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Resource URL</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <code className="codetext">/CMID/&lt;database&gt;/&lt;cmid&gt;</code>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Path Parameters</strong>
          </Typography>
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="database"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Database name (e.g., SocioMap, ArchaMap)."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="cmid"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="CatMapper ID to retrieve."
              />
            </ListItem>
          </List>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Request Examples</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <code className="codetext">GET /CMID/SocioMap/SM1</code>
            <br />
            <code className="codetext">GET /CMID/ArchaMap/AM1</code>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Responses</strong>
          </Typography>
          <Box marginBottom={2}>
            <Typography variant="subtitle1">Successful Response</Typography>
            <Typography variant="body1" gutterBottom>
              <ul>
                <li className="outer">
                  <strong>Status Code:</strong> 200 OK
                </li>
                <li className="outer">
                  <strong>Content:</strong> JSON object with <code>node</code> (node properties) and{' '}
                  <code>relations</code> (relationship property map keyed by relation ID).
                </li>
              </ul>
            </Typography>
          </Box>
          <Box marginBottom={2}>
            <Typography variant="subtitle1">Error Response</Typography>
            <Typography variant="body1" gutterBottom>
              <ul>
                <li className="outer">
                  <strong>Status Code:</strong> 500 Internal Server Error
                </li>
                <li className="outer">
                  <strong>Content:</strong> Error message string.
                </li>
              </ul>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ marginY: 4 }} />

        <Typography variant="h5" gutterBottom>
          <strong>API User Guide: Retrieve Dataset Details</strong>
        </Typography>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Endpoint Description</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            This endpoint retrieves USES-linked category details for dataset CMIDs and can optionally include
            child datasets.
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>HTTP Request Method</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <ul>
              <li className="outer">GET</li>
              <li className="outer">POST</li>
            </ul>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Resource URL</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <code className="codetext">/dataset</code>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>GET Query Parameters</strong>
          </Typography>
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="database"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Database name (e.g., SocioMap, ArchaMap)."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="cmid"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Dataset CMID (e.g., SD..., AD...)."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="domain (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Domain filter. If omitted or ANY DOMAIN, defaults to CATEGORY behavior."
              />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="children (optional)"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="If true, includes child datasets (up to 5 levels) in the request CMID set."
              />
            </ListItem>
          </List>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>POST Body</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            JSON object with the same keys: <code>database</code>, <code>cmid</code>, optional{' '}
            <code>domain</code>, optional <code>children</code>.
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Request Examples</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <code className="codetext">
              GET /dataset?database=SocioMap&cmid=SD1&domain=CATEGORY&children=false
            </code>
            <br />
            <code className="codetext">GET /dataset?database=ArchaMap&cmid=AD1&children=true</code>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Responses</strong>
          </Typography>
          <Box marginBottom={2}>
            <Typography variant="subtitle1">Successful Response</Typography>
            <Typography variant="body1" gutterBottom>
              <ul>
                <li className="outer">
                  <strong>Status Code:</strong> 200 OK
                </li>
                <li className="outer">
                  <strong>Content:</strong> JSON array of dataset-to-category records (for example:{' '}
                  <code>datasetName</code>, <code>datasetID</code>, <code>CMID</code>, <code>CMName</code>,
                  plus dynamic USES properties and <code>*_name</code> expansions when available).
                </li>
              </ul>
            </Typography>
          </Box>
          <Box marginBottom={2}>
            <Typography variant="subtitle1">Error Response</Typography>
            <Typography variant="body1" gutterBottom>
              <ul>
                <li className="outer">
                  <strong>Status Code:</strong> 500 Internal Server Error
                </li>
                <li className="outer">
                  <strong>Content:</strong> Error message string.
                </li>
              </ul>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ marginY: 4 }} />

        <Typography variant="h5" gutterBottom>
          <strong>API User Guide: Retrieve All Datasets</strong>
        </Typography>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Endpoint Description</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Returns DATASET nodes from the requested database with standard dataset metadata fields.
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>HTTP Request Method</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <ul>
              <li className="outer">GET</li>
            </ul>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Resource URL</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <code className="codetext">/allDatasets</code>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Query Parameters</strong>
          </Typography>
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText
                primary="database"
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondary="Database name (e.g., SocioMap, ArchaMap)."
              />
            </ListItem>
          </List>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Request Examples</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <code className="codetext">GET /allDatasets?database=SocioMap</code>
            <br />
            <code className="codetext">GET /allDatasets?database=ArchaMap</code>
          </Typography>
        </Box>

        <Box marginBottom={2}>
          <Typography variant="h6">
            <strong>Responses</strong>
          </Typography>
          <Box marginBottom={2}>
            <Typography variant="subtitle1">Successful Response</Typography>
            <Typography variant="body1" gutterBottom>
              <ul>
                <li className="outer">
                  <strong>Status Code:</strong> 200 OK
                </li>
                <li className="outer">
                  <strong>Content:</strong> Array of objects with fields including <code>nodeID</code>,{' '}
                  <code>CMName</code>, <code>CMID</code>, <code>shortName</code>, <code>project</code>,{' '}
                  <code>Unit</code>, <code>parent</code>, <code>ApplicableYears</code>,{' '}
                  <code>DatasetCitation</code>, <code>District</code>, <code>DatasetLocation</code>,{' '}
                  <code>DatasetVersion</code>, <code>DatasetScope</code>, <code>Subnational</code>, and{' '}
                  <code>Note</code>.
                </li>
              </ul>
            </Typography>
          </Box>
          <Box marginBottom={2}>
            <Typography variant="subtitle1">Error Response</Typography>
            <Typography variant="body1" gutterBottom>
              <ul>
                <li className="outer">
                  <strong>Status Code:</strong> 500 Internal Server Error
                </li>
                <li className="outer">
                  <strong>Content:</strong> Error message string.
                </li>
              </ul>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ marginY: 4 }} />
      </Container>
    </div>
  );
};

export default ApiGuide;
