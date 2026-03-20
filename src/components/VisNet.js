import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { Network } from 'vis-network';
import { useNavigate } from 'react-router-dom'
import './VisNet.css';

export const buildNodeNetworkPath = (database, cmid) => `/${database}/${cmid}/network`;

export const navigateToNetworkNode = ({
  cmid,
  currentid,
  database,
  navigate,
  onNavigateStart,
}) => {
  if (!cmid || cmid === currentid) return false;
  onNavigateStart?.(cmid);
  navigate({ pathname: buildNodeNetworkPath(database, cmid) });
  return true;
};

const Neo4jVisualization = ({
  visData,
  dropdownNodeLimit,
  database,
  onNavigateStart,
}) => {
  const navigate = useNavigate();
  const visNodes = visData.nodes;
  const visEdges = visData.edges;
  const nodes = useMemo(
    () => (visNodes.length > dropdownNodeLimit ? visNodes.slice(0, dropdownNodeLimit) : visNodes),
    [dropdownNodeLimit, visNodes]
  );

  const filteredMap = new Map();
  const currentid = visNodes[0].CMID;

  visNodes.forEach((item) => {
    const legendLabel = item.legendLabel || (Array.isArray(item.domain) ? item.domain.join(':') : 'UNMAPPED');
    const legendColor = item.color || '#cccccc';
    const legendKey = `${legendLabel}::${legendColor}`;
    if (!filteredMap.has(legendKey)) {
      filteredMap.set(legendKey, { domain: legendLabel, color: legendColor });
    }
    if (item.CMID === currentid) {
      item.shape = 'triangle';
    } else {
      item.shape = 'dot';
    }
  });

  const uniqueArray = Array.from(filteredMap.values());
  const [nodeInfo, setNodeInfo] = useState(null);
  const [edgeInfo, setEdgeInfo] = useState(null);
  const [nodePopupPosition, setNodePopupPosition] = useState(null);
  const nodeInfoRef = useRef(null);
  const edgeInfoRef = useRef(null);

  const navigateToNode = useCallback((cmid) => {
    navigateToNetworkNode({
      cmid,
      currentid,
      database,
      navigate,
      onNavigateStart,
    });
  }, [currentid, database, navigate, onNavigateStart]);

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
        const canvasRect = container.getBoundingClientRect();
        const anchorX = canvasRect.left + params.pointer.DOM.x;
        const anchorY = canvasRect.top + params.pointer.DOM.y;

        setNodeInfo({
          ...nodeDetails,
          position: { x: anchorX, y: anchorY },
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

  const positionNodePopup = useCallback(() => {
    if (!nodeInfo || !nodeInfoRef.current) return;

    const popupRect = nodeInfoRef.current.getBoundingClientRect();
    const margin = 12;
    const offset = 14;

    // Prefer right side of node; flip to left when right edge would overflow.
    let left = nodeInfo.position.x + offset;
    if (left + popupRect.width > window.innerWidth - margin) {
      left = nodeInfo.position.x - popupRect.width - offset;
    }
    left = Math.max(margin, Math.min(left, window.innerWidth - popupRect.width - margin));

    // Keep popup vertically near the node while staying inside current viewport.
    let top = nodeInfo.position.y - popupRect.height / 2;
    top = Math.max(margin, Math.min(top, window.innerHeight - popupRect.height - margin));

    setNodePopupPosition({ left, top });
  }, [nodeInfo]);

  useLayoutEffect(() => {
    if (!nodeInfo) {
      setNodePopupPosition(null);
      return;
    }
    positionNodePopup();
  }, [nodeInfo, positionNodePopup]);

  useEffect(() => {
    if (!nodeInfo) return;
    const handleResize = () => positionNodePopup();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodeInfo, positionNodePopup]);

  return (<div className="visnet-layout"><div id="network" className="visnet-canvas"></div>
    {edgeInfo && (
      <div
        ref={edgeInfoRef}
        className="visnet-info-box visnet-info-box--edge"
        style={{
          left: edgeInfo.position.x,
          top: edgeInfo.position.y,
        }}
      >
        <div className="visnet-actions">
          <button onClick={handleEdgeInfoClose} className="visnet-btn visnet-btn--close">Close</button>
        </div>
        {edgeInfo.lines.map((line, index) => (
          <div key={`edge-${index}`}>{line}</div>
        ))}
      </div>
    )}

    {nodeInfo && (
      <div
        ref={nodeInfoRef}
        className="visnet-info-box visnet-info-box--node"
        style={{
          left: nodePopupPosition?.left ?? nodeInfo.position.x,
          top: nodePopupPosition?.top ?? nodeInfo.position.y,
        }}
      >
        <div className="visnet-actions-between">
          <div>
            {nodeInfo.cmid !== currentid && (
              <button onClick={() => navigateToNode(nodeInfo.cmid)} className="visnet-btn visnet-btn--view">View</button>
            )}
          </div>
          <button onClick={handleNodeInfoClose} className="visnet-btn visnet-btn--close">Close</button>
        </div>
        {nodeInfo.lines.map((line, index) => (
          <div key={`node-${index}`}>{line}</div>
        ))}
      </div>
    )}
    <ul className="visnet-legend">
      {uniqueArray.map((item, index) => (
        <li key={index}>
          <span
            className="visnet-legend-color"
            style={{ backgroundColor: item.color }}
          ></span>
          {item.domain}
        </li>
      ))}
    </ul></div>)
};

export default Neo4jVisualization;
