import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Network } from 'vis-network';
import { useNavigate } from 'react-router-dom'

const Neo4jVisualization = ({ visData, dropdownNodeLimit, database }) => {
  const navigate = useNavigate();
  const visNodes = visData.nodes;
  const visEdges = visData.edges;
  const valuesToRemove = ['DISTRICT', 'CATEGORY'];
  const nodes = useMemo(
    () => (visNodes.length > dropdownNodeLimit ? visNodes.slice(0, dropdownNodeLimit) : visNodes),
    [dropdownNodeLimit, visNodes]
  );
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
  const currentid = visNodes[0].CMID;

  visNodes.forEach((item) => {
    const mostSpecific = getMostSpecificDomain(item.domain || []);
    if (mostSpecific && !filteredMap.has(mostSpecific)) {
      filteredMap.set(mostSpecific, item.color);
    }
    if (item.CMID === currentid) {
      item.shape = 'triangle';
    } else {
      item.shape = 'dot';
    }
  });

  const filteredData = Array.from(filteredMap.entries()).map(([domain, color]) => ({
    domain,
    color
  }));

  const uniqueMap = new Map();

  filteredData.forEach(obj => {
    uniqueMap.set(obj.color, obj);
  });

  const uniqueArray = Array.from(uniqueMap.values());
  const [nodeInfo, setNodeInfo] = useState(null);
  const [edgeInfo, setEdgeInfo] = useState(null);
  const nodeInfoRef = useRef(null);
  const edgeInfoRef = useRef(null);

  const navigateToNode = useCallback((cmid) => {
    if (!cmid || cmid === currentid) return;
    navigate({ pathname: `/${database}/${cmid}/network` });
    window.location.reload();
  }, [currentid, database, navigate]);

  const formatNodeDetails = useCallback((nodeId) => {
    const node = visNodes.find(obj => obj.id === nodeId);
    if (!node) return null;

    let details = (node.tooltipcon || []).filter(
      item => item !== 'SocioMapID' && item !== 'SocioMapName'
    );
    const cmItems = details.filter(item => ['CMID', 'CMName'].includes(item.split(':')[0].trim()));
    const glottoItems = details.filter(item => item.split(':')[0].trim().toLowerCase() === 'glottocode');
    const ISOItems = details.filter(item => item.split(':')[0].trim() === 'ISO3');
    const FIPSItems = details.filter(item => item.split(':')[0].trim() === 'FIPS');
    details = details.filter(
      item => !['CMID', 'CMName', 'glottocode', 'ISO3', 'FIPS'].includes(item.split(':')[0].trim()) &&
        !item.toLowerCase().includes('log')
    );

    return {
      cmid: node.CMID,
      lines: [...cmItems, ...glottoItems, ...ISOItems, ...FIPSItems, ...details],
    };
  }, [visNodes]);

  const formatEdgeDetails = useCallback((edgeId) => {
    const edge = visEdges.find(item => item.id === edgeId);
    if (!edge) return [];

    const cleanAndFormat = (val) => {
      if (val === null || val === undefined) return null;
      const parts = String(val).split(',');
      const validParts = parts.filter(part => {
        const p = part.trim().toUpperCase();
        return p !== "NULL" && p !== "" && p !== "UNDEFINED";
      });
      return validParts.length > 0 ? validParts.join(', ') : null;
    };

    if (edge.type === 'CONTAINS') {
      const lines = [];
      const dateVal = cleanAndFormat(edge.eventDate);
      const typeVal = cleanAndFormat(edge.eventType);
      const refKey = cleanAndFormat(edge.referenceKey);
      if (dateVal) lines.push(`eventDate: ${dateVal}`);
      if (typeVal) lines.push(`eventType: ${typeVal}`);
      if (refKey) lines.push(`referenceKey: ${refKey}`);
      lines.push(`type: ${edge.type}`);
      return lines;
    }

    if (edge.type === 'USES') {
      const { from, to, color, id, ...rest } = edge;
      const grouped = Object.entries(rest).reduce((acc, [key, value]) => {
        if (key === 'Name' || key === 'Key') {
          acc.top.push(`${key}: ${value}`);
        } else if (key.toLowerCase().includes('log')) {
          return acc;
        } else {
          acc.middle.push(`${key}: ${value}`);
        }
        return acc;
      }, { top: [], middle: [], bottom: [] });
      return [...grouped.top, ...grouped.middle, ...grouped.bottom];
    }

    if (edge.type === 'EQUIVALENT') {
      return [`stack: ${edge.stack}`, `dataset: ${edge.dataset}`, `Key: ${edge.Key}`];
    }

    if (edge.type === 'MERGING') {
      const { from, to, color, id, ...rest } = edge;
      const lines = Object.entries(rest)
        .filter(([key, value]) => {
          if (key.toLowerCase().includes('log')) return false;
          if (value === null || value === undefined) return false;
          const strVal = String(value).trim();
          if (!strVal) return false;
          const normalized = strVal.toUpperCase();
          return normalized !== 'NULL' && normalized !== 'UNDEFINED';
        })
        .map(([key, value]) => `${key}: ${value}`);

      return lines.length > 0 ? lines : [`type: ${edge.type}`];
    }

    return [`referenceKey: ${edge.referenceKey}`, `type: ${edge.type}`];
  }, [visEdges]);

  useEffect(() => {

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
          iterations: 100,
          enabled: true,
          updateInterval: 25,
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

    const data = { nodes, edges: visEdges };
    const network = new Network(container, data, options);

    let isMounted = true;

    const freezeNetwork = () => {
      if (isMounted && network) {
        network.setOptions({ physics: { enabled: false } });
      }
    };

    network.once("stabilizationFinished", function () {
      freezeNetwork();
    });

    setTimeout(() => {
      freezeNetwork();
    }, 800);

    let singleClickTimer = null;

    const clearTimers = () => {
      if (singleClickTimer) {
        clearTimeout(singleClickTimer);
        singleClickTimer = null;
      }
    };

    network.on('dragStart', clearTimers);
    network.on('dragging', clearTimers);

    network.on('doubleClick', (params) => {
      clearTimers();
      if (!params.nodes.length) return;
      const nodeData = visNodes.find(obj => obj.id === params.nodes[0]);
      if (nodeData?.CMID && nodeData.CMID !== currentid) {
        navigateToNode(nodeData.CMID);
      }
    });

    network.on('click', (params) => {
      if (!params.nodes.length) {
        setNodeInfo(null);
        return;
      }

      const nodeDetails = formatNodeDetails(params.nodes[0]);
      if (!nodeDetails) return;

      singleClickTimer = setTimeout(() => {
        setNodeInfo({
          ...nodeDetails,
          position: { x: params.pointer.DOM.x, y: params.pointer.DOM.y },
        });
      }, 200);
    });

    network.on('hoverEdge', (params) => {
      const lines = formatEdgeDetails(params.edge);
      setEdgeInfo({
        lines,
        position: { x: params.event.clientX, y: params.event.clientY },
      });
    });

    network.on('blurEdge', () => {
      // Keep info visible until explicit close or clicking elsewhere.
    });

    const handleClickOutside = (event) => {
      if (nodeInfoRef.current && !nodeInfoRef.current.contains(event.target)) {
        setNodeInfo(null);
      }
      if (edgeInfoRef.current && !edgeInfoRef.current.contains(event.target)) {
        setEdgeInfo(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false; // Mark as unmounted
      clearTimers();
      document.removeEventListener('mousedown', handleClickOutside);
      network.destroy();
    };
  }, [currentid, formatEdgeDetails, formatNodeDetails, navigateToNode, nodes, visEdges, visNodes]);

  const handleNodeInfoClose = () => setNodeInfo(null);
  const handleEdgeInfoClose = () => setEdgeInfo(null);
  const viewButtonStyle = {
    backgroundColor: 'rgb(46, 125, 50)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer'
  };
  const closeButtonStyle = {
    backgroundColor: 'rgb(211, 47, 47)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer'
  };

  return (<div style={{ display: "Flex" }}><div id="network" style={{ height: '400px', width: "1000px" }}></div>
    {edgeInfo && (
      <div
        ref={edgeInfoRef}
        style={{
          position: 'fixed',
          left: edgeInfo.position.x,
          top: edgeInfo.position.y,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '3px',
          boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          width: "500px",
          maxHeight: "280px",
          overflowY: "auto"
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button onClick={handleEdgeInfoClose} style={closeButtonStyle}>Close</button>
        </div>
        {edgeInfo.lines.map((line, index) => (
          <div key={`edge-${index}`}>{line}</div>
        ))}
      </div>
    )}

    {nodeInfo && (
      <div
        ref={nodeInfoRef}
        style={{
          position: 'absolute',
          left: nodeInfo.position.x,
          top: nodeInfo.position.y,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px',
          borderRadius: '3px',
          boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          width: "500px",
          maxHeight: "320px",
          overflowY: "auto"
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            {nodeInfo.cmid !== currentid && (
              <button onClick={() => navigateToNode(nodeInfo.cmid)} style={viewButtonStyle}>View</button>
            )}
          </div>
          <button onClick={handleNodeInfoClose} style={closeButtonStyle}>Close</button>
        </div>
        {nodeInfo.lines.map((line, index) => (
          <div key={`node-${index}`}>{line}</div>
        ))}
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
