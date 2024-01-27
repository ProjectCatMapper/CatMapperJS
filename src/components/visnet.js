import React, { useEffect } from 'react';
import { Network } from 'vis-network/standalone';
import {useNavigate} from 'react-router-dom'

const Neo4jVisualization = ({ visData }) => {
  const navigate = useNavigate();
  const valuesToRemove = ['DISTRICT', 'CATEGORY'];
  const filteredData = new Set(visData["nodes"].map(item => ({ domain: item.domain, color: item.color })).map(item => {
      if (item.domain) {
        item.domain = item.domain.filter(value => !valuesToRemove.includes(value)).slice(-1)[0];
      }
      return item;
    }))
  const uniqueMap = new Map();

  filteredData.forEach(obj => {
      uniqueMap.set(obj.color, obj);
    });

  const uniqueArray = Array.from(uniqueMap.values());

  useEffect(() => {
    {console.log(uniqueArray)}
    const currentid = visData["nodes"][0].CMID
    const container = document.getElementById('network');
    const options = { nodes: {
      shape: 'dot',
      // widthConstraint: 50,      
    },
    edges: {
      arrows: {
        to: {
          enabled: true, 
          scaleFactor: 1,
        },
      },
    },
    interaction: {
      hover: true,
    },
   
  };
    const network = new Network(container, visData, options);
  
    network.on("click", function (params) {
      if (params.nodes.length > 0) {
        var clickedNodeId = params.nodes[0];
        var clickedNodeData = visData["nodes"].find(obj => obj["id"] === clickedNodeId)
        if (clickedNodeData["CMID"] !== currentid)
    {
    navigate({pathname:`/exview/${clickedNodeData["CMID"]}`,});
    window.location.reload();
    }
      }
    });

    return () => {
      network.destroy();
    };
  }, [visData]);

  return (<div style={{display: "Flex"}}><div id="network" style={{ height: '600px', width: "1000px" }}></div>
      <ul>
        {uniqueArray.map((item, index) => (
          <li key={index}>
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: item.color,
                marginRight: '5px',
              }}
            ></span>
            {item.domain}
          </li>
        ))}
      </ul></div>)
};

export default Neo4jVisualization;