import React, { useEffect } from 'react';
import { Network } from 'vis-network/standalone';

const Neo4jVisualization = ({ visData }) => {
  useEffect(() => {
    {console.log(visData)}
    const container = document.getElementById('network');
    const options = {}; // Customize options as needed
    const network = new Network(container, visData, options);

    return () => {
      // Cleanup code (if needed)
      network.destroy();
    };
  }, [visData]);

  return <div id="network" style={{ height: '600px' }}></div>;
};

export default Neo4jVisualization;