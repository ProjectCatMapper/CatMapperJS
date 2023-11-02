import React, { useEffect,useState } from 'react';
import './neocomp.css'
import * as d3 from 'd3';
import neo4j, { session } from 'neo4j-driver';
import {useNavigate} from 'react-router-dom'

function Neo4jGraph({p2,p0,p1}) {
  const [nodes, setNodes] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(p1);
  const navigate = useNavigate();
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(() => {
    // This code will run when the component mounts and whenever 'count' changes
    // You can put any logic here that should trigger a state update
    if (selectedNodeId !== p1)
    {
    navigate({pathname:`/exview/${selectedNodeId}`,});
    window.location.reload();
    }
  }, [selectedNodeId]);

  useEffect(() => {

    const fetchData = async () => {
    const driver = neo4j.driver('neo4j://sociomap.rc.asu.edu:7687', neo4j.auth.basic('neo4j', '[REDACTED]'));

    const session = driver.session();

try {
   const result = await session.run("MATCH (n:"+p0+" {CMID:'"+p1+"'})-[r:"+p2+"]-(OtherNodes) RETURN n,r,OtherNodes")

  //  session.run("match (a) where a.CMID = '"+d.CMID+"' return labels(a)")

    const nodesMap = new Map();
    const newrelationships = [];

        result.records.forEach((record) => {
          const source = record.get('n').properties;
          {console.log(record.get('n').labels)}
          const target = record.get('OtherNodes').properties;
          const rel = record.get('r').properties;

          nodesMap.set(source.CMName, source);
          nodesMap.set(target.CMName, target);

          newrelationships.push({
            source: source.CMName,
            target: target.CMName,
            relType: rel.type,
          });
        });

        const newnodes = Array.from(nodesMap.values());
        setNodes(newnodes);
        setRelationships(newrelationships);
        RenderD3Graph(newnodes, newrelationships);
      }
      catch(error)  {
        console.error('Error running Neo4j query:', error);
      }
      finally {
        session.close();
        driver.close();
      }
  }

  fetchData(); // Fetch the initial data

  
}, []);

function handleNodeClick(node) {
  // Update the selected node in the component state
  setSelectedNodeId(node.CMID);
  {console.log(node)}
  // Navigate to the NodeDetailsPage with the node's ID as a URL parameter
}

  function RenderD3Graph(nodes, relationships) {

    const svg = d3.select('#graph-container').select('svg');
    
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-500))
      .force('link', d3.forceLink(relationships).id((d) => d.CMName).distance(100))
      .force('center', d3.forceCenter(500, 250))
      //.force('collide', d3.forceCollide(20)); 

      const linksSelection = svg
      .selectAll('.link')
      .data(relationships.slice(0,3))
      .enter()
      .append('g')
      .attr('class', 'link');

    linksSelection
      .append('line')
      .attr('stroke', 'gray');

    linksSelection
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text((d) => d.relType);

    // Render nodes with labels
    const nodesSelection = svg
      .selectAll('.node')
      .data(nodes.slice(0,4))
      .enter()
      .append('g')
      .attr('class', 'node');

    nodesSelection
      .append('circle')
      .attr('r', 15)
      .attr('fill', (d) => colorScale(d.CMID))
      .on('click', (event, d) => handleNodeClick(d));

    nodesSelection
      .append('text')
      .text((d) => d.CMName)
      .attr('x', (d) => d.x + 12)
      .attr('y', (d) => d.y)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', 'black');

    simulation.nodes(nodes).on('tick', () => {
      linksSelection
        .selectAll('line')
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      nodesSelection
        .attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
  }
                          
  return(
    <div id="graph-container" >
    {console.log({selectedNodeId})}
    <svg width={800} height={600} />
    </div>

  );
}

export default Neo4jGraph;


// import NeoVis from 'neovis.js';

// class NeoVisComponent extends Component {

//   componentDidMount() {
//     const config = {
//       container_id: 'neo4j-vis',
//       server_url: 'neo4j://sociomap.rc.asu.edu:7687',
//       server_user: 'neo4j',
//       server_password: '[REDACTED]',
//       labels: {
//         'YourNodeLabel': {
//           caption: 'CMName',
//         },

//       },
//       relationships: {
       
//       },
//     };

//     this.neoVis = new NeoVis(config);
    
//     const cypherQuery = `MATCH (n:ADM0) RETURN n LIMIT 25`

//     this.neoVis.renderWithCypher(cypherQuery);
//   }

//   render() {
//     return <div id="neo4j-graph" style={{ width: '100%', height: '600px' }} />;
//   }
// };

// export default NeoVisComponent;