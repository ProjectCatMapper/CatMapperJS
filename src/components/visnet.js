import React, { useEffect, useState } from 'react';
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
  const tabval = 2

  filteredData.forEach(obj => {
      uniqueMap.set(obj.color, obj);
    });

  const uniqueArray = Array.from(uniqueMap.values());
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

    let singleClickTimer;

    network.on('click', (params) => {
      
      if (!singleClickTimer) {
        singleClickTimer = setTimeout(() => {
           if (params.nodes[0] > -1) {
          setTooltipContent(visData.nodes.find(obj => obj.id === params.nodes[0]).tooltipcon.map((item, index) => <span key={index}>{item}<br /></span>));
          setTooltipPosition({ x: params.pointer.DOM.x, y: params.pointer.DOM.y });
         }
         singleClickTimer = null;}, 300);
      } else {
        clearTimeout(singleClickTimer);
        singleClickTimer = null;
        if (params.nodes.length > 0) {
          var clickedNodeId = params.nodes[0];
          var clickedNodeData = visData["nodes"].find(obj => obj["id"] === clickedNodeId)
          if (clickedNodeData["CMID"] !== currentid)
      {
      navigate({pathname:`/sociomap/${clickedNodeData["CMID"]}/${tabval}`,});
      window.location.reload();
      }
        }
      }
    });
  
    // network.on("doubleClick", function (params) {
    //   if (params.nodes.length > 0) {
    //     var clickedNodeId = params.nodes[0];
    //     var clickedNodeData = visData["nodes"].find(obj => obj["id"] === clickedNodeId)
    //     if (clickedNodeData["CMID"] !== currentid)
    // {
    // navigate({pathname:`/sociomap/${clickedNodeData["CMID"]}/${tabval}`,});
    // window.location.reload();
    // }
    //   }
    // });

    network.on("hoverEdge", function (params) {
      const edgeId = params.edge;
      const edge = visData["edges"].find(edge => edge["id"] === edgeId);
      const tooltipText = `date: ${edge.eventDate} <br> type: ${edge.eventType} <br> refkey: ${edge.refkey}`; 
      const tooltipElement = document.getElementById('edge-tooltip');
      tooltipElement.innerHTML = tooltipText;
      tooltipElement.style.top = params.event.clientY + 'px';
      tooltipElement.style.left = params.event.clientX + 'px';
      tooltipElement.style.display = 'block';
  });

  network.on("blurEdge", function () {
      const tooltipElement = document.getElementById('edge-tooltip');
      tooltipElement.style.display = 'none';
  });

    return () => {
      network.destroy();
    };
  }, [visData]);

  const handleTooltipClose = () => {
    setTooltipContent(null);
  };

  return (<div style={{display: "Flex"}}><div id="network" style={{ height: '600px', width: "1000px" }}></div>
              <div id="edge-tooltip" style={{ position: 'fixed', display: 'none', padding: '5px', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '5px' }}></div>

              {tooltipContent && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '5px',
            borderRadius: '3px',
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            width: "500px"
          }}
        >
          {tooltipContent}
          <button onClick={handleTooltipClose}>Close</button>
        </div>
      )}
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