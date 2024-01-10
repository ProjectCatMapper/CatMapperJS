import React, { useEffect,useState } from 'react';
import './neocomp.css'
import * as d3 from 'd3';
import neo4j, { session } from 'neo4j-driver';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import {useNavigate} from 'react-router-dom'

function Neo4jGraph({n,r,l,f,id}) {
  console.log("a")
  const [node, setNodes] = useState([]);
  const [relationship, setRelationships] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(id);
  const [flag, setflag] = useState("");
  const [filldrop, setfilldrop] = useState({});
  // const [selectedValues, setSelectedValues] = useState([]);
  const [firstDropdownValue, setFirstDropdownValue] = useState([]);
  const navigate = useNavigate();
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(() => {
    // This code will run when the component mounts and whenever 'count' changes
    // You can put any logic here that should trigger a state update
    if (selectedNodeId !== id)
    {
    navigate({pathname:`/exview/${selectedNodeId}`,});
    window.location.reload();
    }
  }, [selectedNodeId]);

//   useEffect(() => {

//     const fetchData = async () => {
//     const driver = neo4j.driver('neo4j://sociomap.rc.asu.edu:7687', neo4j.auth.basic('neo4j', 'sociomap'));

//     const session = driver.session();

// try {
//    const result = await session.run("MATCH (n:"+p0+" {CMID:'"+p1+"'})-[r:"+p2+"]-(OtherNodes) RETURN n,r,OtherNodes")

//   //  session.run("match (a) where a.CMID = '"+d.CMID+"' return labels(a)")
//     result.records.forEach((record) => { 
//       domains.push(record.get("n").labels[record.get("n").labels.length-1])
//       domains.push(record.get("OtherNodes").labels[record.get("OtherNodes").labels.length-1])
//     });
    
//     setlabels([...new Set(domains)])
//     names.push("All")

//     result.records.forEach((record) => { 
//       const source1 = record.get('n').properties;
//       const source = Object.assign({},source1,{label: record.get('n').labels} )
//       source.label = source.label[source.label.length - 1]
//       const target1 = record.get('OtherNodes').properties;
//       const target = Object.assign({},target1,{label: record.get('OtherNodes').labels} )
//       target.label = target.label[target.label.length - 1]
//       names.push(target.CMName)

//       nodesMap.set(source.CMName, source);
//       nodesMap.set(target.CMName, target);

//       newrelationships.push({
//         source: source.CMName,
//         target: target.CMName,
//         label : target.label
//       });

//     });

//     const newnodes = Array.from(nodesMap.values());
//     console.log(newnodes)
//     console.log(newrelationships)
//     setfilldrop(names)  
//     setNodes(newnodes);
//     setRelationships(newrelationships);
  
//       }
//       catch(error)  {
//         console.error('Error running Neo4j query:', error);
//       }
//       finally {
//         session.close();
//         driver.close();
//       }
//   }

//   fetchData(); // Fetch the initial data
  
// }, [firstDropdownValue]);

useEffect(() => {setNodes(n)
  setRelationships(r)
  setfilldrop(f)
  setFirstDropdownValue(f[0])
  },[f])

useEffect(() => {
  if(flag !== "" && firstDropdownValue !== "All"){
  RenderD3Graph(node.filter((node) => firstDropdownValue.includes(node.CMName) || node.CMID === id), relationship.filter((link) => firstDropdownValue.includes(link.target.CMName)) )}
  if(firstDropdownValue === "All"){
    RenderD3Graph(node,relationship)
  }
},[firstDropdownValue])

useEffect(() => {
if (relationship !== ''){
RenderD3Graph(node, relationship )
setflag("0")
}
},[relationship])

// useEffect(() => {setNodes(n)
//   setRelationships(r)
//   setlabels(l)
//   setfilldrop(f)
//   setSelectedValues(l)
//   setFirstDropdownValue(f[0])
//   },[])

// useEffect(() => {
//   if (relationship !== ''){
//   RenderD3Graph(node, relationship )}
//   },[selectedValues,firstDropdownValue])

function handleNodeClick(node) {
  if (node.label !== "DATASET")
  setSelectedNodeId(node.CMID);
}
  function RenderD3Graph(nodes, relationships) {

    d3.selectAll("svg > *").remove();
    const svg = d3.select('#graph-container').select('svg');

    // svg.selectAll('*').remove();   
    // if (selectedValues !== labels) {
    // nodes = nodes.filter((node) => selectedValues.includes(node.label))
    // relationships =  relationships.filter((link) => selectedValues.includes(link.label))
    // setfilldrop(filldrop.filter((link) => selectedValues.includes(link.label)))}
  
    const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(relationships).id((d) => d.CMName).distance(100))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('x', d3.forceX().x(400 * 0.5))
    .force('y', d3.forceY().y(300 * 0.5))
    .force('center', d3.forceCenter(400, 300))
    // .force('collide', d3.forceCollide(20)); 

      const linksSelection = svg
      .selectAll('.link')
      .data(relationships.slice(0,3))
      .enter()
      .append('g')
      .attr('class', 'link');

    linksSelection
      .append('line')
      .attr('stroke', 'gray');

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
      .attr('fill', (d) => colorScale(d.label))
      .on('click', (event, d) => handleNodeClick(d));

    nodesSelection
      .append('text')
      .text((d) => d.CMName)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      // .attr('dy', '0.35em')
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
      .attr('transform', (d) => `translate(${d.x},${d.y})`);    });
  }
                          
  return(
    <div>
      {/* <Select
        multiple
        value={selectedValues}
        onChange={(event) => setSelectedValues(event.target.value)}
        label="Select Multiple Items"
        sx={{ m: 1, width: 300 }}
      >
        {labels.map((option) => (
        <MenuItem value={option}>
          {option}
        </MenuItem>
      ))}
      </Select> */}
        <Select
          label="First Dropdown"
          value={firstDropdownValue}
          sx={{ m: 1, width: 300 }}
          onChange={(event) => setFirstDropdownValue(event.target.value)}>
         {Object.entries(filldrop).length !== 0  && filldrop.map((options) => (
        <MenuItem value={options}>
          {options}
        </MenuItem>
      ))}
        </Select>
    <div id="graph-container" >
    <svg width={800} height={600} />
    </div>
    </div>

  );
}

export default Neo4jGraph;