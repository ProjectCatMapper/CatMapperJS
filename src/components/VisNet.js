import { useEffect, useState, useRef } from 'react';
import { Network } from 'vis-network';
import { useNavigate, useLocation } from 'react-router-dom'

const Neo4jVisualization = ({ visData, dropdownNodeLimit }) => {
  const navigate = useNavigate();
  const loc = useLocation();
  const valuesToRemove = ['DISTRICT', 'CATEGORY'];
  const nodes = visData["nodes"].length > dropdownNodeLimit ? visData["nodes"].slice(0, dropdownNodeLimit) : visData["nodes"];
  const domainHierarchy = [
    "PROJECTILE_POINT_TYPE",
    "PROJECTILE_POINT_CLUSTER",
    "PROJECTILE_POINT",
    "CERAMIC_TYPE",
    "CERAMIC_WARE",
    "CERAMIC",
    "PHYTOLITH",
    "BOTANICAL",
    "FAUNA",
    "SUBSPECIES",
    "SPECIES",
    "SUBGENUS",
    "GENUS",
    "FAMILY",
    "ORDER",
    "CLASS",
    "PHYLUM",
    "KINGDOM",
    "BIOTA",
    "FEATURE",
    "SITE",
    "ADM0",
    "ADM1",
    "ADM2",
    "ADM3",
    "ADM4",
    "ADMD",
    "ADME",
    "ADML",
    "ADMX",
    "REGION",
    "DISTRICT",
    "PERIOD",
    "DIALECT",
    "LANGUAGE",
    "FAMILY",
    "LANGUOID",
    "ETHNICITY",
    "RELIGION",
    "OCCUPATION",
    "POLITY",
    "CULTURE",
    "STONE",
    "DATASET",
    "GENERIC",
    "VARIABLE"
  ];

  const getMostSpecificDomain = (domains) => {
    const flat = Array.from(new Set(domains.flat()));
    const filtered = flat.filter(val => !valuesToRemove.includes(val));

    for (const specific of domainHierarchy) {
      if (filtered.includes(specific)) {
        return specific;
      }
    }

    return null;
  };

  const filteredMap = new Map();

  visData["nodes"].forEach((item) => {
    const mostSpecific = getMostSpecificDomain(item.domain || []);
    if (mostSpecific && !filteredMap.has(mostSpecific)) {
      filteredMap.set(mostSpecific, item.color);
    }
  });

  const filteredData = Array.from(filteredMap.entries()).map(([domain, color]) => ({
    domain,
    color
  }));

  const uniqueMap = new Map();
  let tooltipText

  filteredData.forEach(obj => {
    uniqueMap.set(obj.color, obj);
  });

  const uniqueArray = Array.from(uniqueMap.values());
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);

  useEffect(() => {
    const currentid = visData["nodes"][0].CMID
    const container = document.getElementById('network');
    const options = {
      nodes: {
        shape: 'dot',
        // widthConstraint: 50,      
      },
      // physics: false
      physics: {
        enabled: true,
        solver: "forceAtlas2Based",
        forceAtlas2Based: {
          springLength: 100,
          avoidOverlap: 1,
        },
        stabilization: {
          iterations: 7,
        }
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
    let path = "sociomap"
    if (loc.pathname.includes("archamap")) {
      path = "archamap"
    }

    const data = { nodes, edges: visData.edges };
    const network = new Network(container, data, options);

    let isMounted = true;

    network.once("stabilizationFinished", function () {
      // Small delay to let the final positions settle
      setTimeout(() => {
        // Check if network hasn't been destroyed by a re-render/unmount
        if (isMounted && network && typeof network.setOptions === 'function') {
          try {
            network.setOptions({ physics: false });
          } catch (e) {
            console.warn("Physics disable failed:", e);
          }
        }
      }, 500); // 500ms is usually enough
    });


    let clickTimeout = null;
    let lastClickedNode = null;

    network.on('click', (params) => {
      if (params.nodes.length === 0) return;

      if (clickTimeout !== null) {
        // DOUBLE CLICK DETECTED
        clearTimeout(clickTimeout);
        clickTimeout = null;

        const clickedNodeId = params.nodes[0];
        const nodeData = visData.nodes.find(obj => obj.id === clickedNodeId);
        if (nodeData.CMID !== currentid) {
          navigate({ pathname: `/${path}/${nodeData.CMID}/0` });
          window.location.reload();
        }
      } else {
        // SINGLE CLICK START
        clickTimeout = setTimeout(() => {
          if (params.nodes.length > 0 && params.nodes[0].length > -1) {
            let tooltipContent = visData.nodes.find(obj => obj.id === params.nodes[0]).tooltipcon.filter(item => item !== 'SocioMapID' && item !== 'SocioMapName');
            const cmItems = tooltipContent.filter(item => ['CMID', 'CMName'].includes(item.split(':')[0].trim()));
            const glottoItems = tooltipContent.filter(item => item.split(':')[0].trim().toLowerCase() === 'glottocode');
            const ISOItems = tooltipContent.filter(item => item.split(':')[0].trim() === 'ISO3');
            const FIPSItems = tooltipContent.filter(item => item.split(':')[0].trim() === 'FIPS');
            tooltipContent = tooltipContent.filter(item => !['CMID', 'CMName', 'glottocode', 'ISO3', 'FIPS'].includes(item.split(':')[0].trim()) && !item.toLowerCase().includes('log'));

            tooltipContent = [...cmItems, ...glottoItems, ...ISOItems, ...FIPSItems, ...tooltipContent];

            setTooltipContent(tooltipContent.map((item, index) => <span key={index}>{item}<br /></span>));
            setTooltipPosition({ x: params.pointer.DOM.x, y: params.pointer.DOM.y });
          }
          clickTimeout = null;
        }, 350); // Increased to 300ms for touchpad friendliness
        lastClickedNode = params.nodes[0];
      }
    });


    network.on("hoverEdge", function (params) {
      const edgeId = params.edge;
      const edge = visData["edges"].find(edge => edge["id"] === edgeId);
      switch (edge.type) {
        case 'CONTAINS':
          {
            const parts = [];

            if (edge.eventDate !== null && edge.eventDate !== undefined && edge.eventDate !== "NULL") {
              parts.push(`eventDate: ${edge.eventDate}`);
            }

            if (edge.eventType !== null && edge.eventType !== undefined && edge.eventType !== "NULL") {
              parts.push(`eventType: ${edge.eventType}`);
            }

            if (edge.referenceKey !== null) {
              parts.push(`referenceKey: ${edge.referenceKey}`);
            }

            parts.push(`type: ${edge.type}`);

            tooltipText = parts.join(' <br> ');
            break;
          }
        case 'USES':
          {
            const { from, to, color, id, ...rest } = edge;
            tooltipText = Object.entries(rest)
              .reduce((acc, [key, value]) => {
                if (key === 'Name' || key === 'Key') {
                  acc.top.push(`${key}: ${value}`);
                }
                else if (key.toLowerCase().includes('log')) {
                  return acc;
                }
                else {
                  acc.middle.push(`${key}: ${value}`);
                }
                return acc;
              }, { top: [], middle: [], bottom: [] });

            tooltipText = [...tooltipText.top, ...tooltipText.middle, ...tooltipText.bottom].join(' <br> ');
            break;
          }
        case 'EQUIVALENT':
          tooltipText = `stack: ${edge.stack} <br> dataset: ${edge.dataset} <br> Key: ${edge.Key}`;
          break;
        default:
          tooltipText = `referenceKey: ${edge.referenceKey} <br> type: ${edge.type}`;
          break;
      }

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

    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setTooltipContent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false; // Mark as unmounted
      document.removeEventListener('mousedown', handleClickOutside);
      network.destroy();
    };
  }, [visData, dropdownNodeLimit]);

  const handleTooltipClose = () => {
    setTooltipContent(null);
  };

  return (<div style={{ display: "Flex" }}><div id="network" style={{ height: '400px', width: "1000px" }}></div>
    <div id="edge-tooltip" style={{ position: 'fixed', display: 'none', padding: '5px', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '5px' }}></div>

    {tooltipContent && (
      <div
        ref={tooltipRef}
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