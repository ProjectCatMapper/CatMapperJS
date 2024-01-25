import React, { useEffect } from 'react';
import { Network } from 'vis-network/standalone';
import {useNavigate} from 'react-router-dom'

const Neo4jVisualization = ({ visData }) => {
  const navigate = useNavigate();
  useEffect(() => {
    {console.log(visData)}
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

  return <div id="network" style={{ height: '600px' }}></div>;
};

export default Neo4jVisualization;