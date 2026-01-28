import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

// Color mapping for your "Three Dimensions"
const colors = {
  root: '#ff7e67', // Orange (History)
  core: '#4facfe', // Blue (Theory)
  path: '#43e97b', // Green (Learning)
  input: '#333'     // Dark (Main Center)
};

const CustomNode = ({ data, id }) => {
  const [showActions, setShowActions] = useState(false);

  // 1. Get color based on the semantic type (root, core, path)
  // We assume data.type comes from your API schema
  const nodeColor = colors[data.type] || '#777';

  const handleExpand = (e) => {
    e.stopPropagation(); // Stop click from triggering "Node Details"
    // Call the function passed down from RoadmapGraph
    data.onExpand(id, data.label, data.type); 
  };

  return (
    <div 
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        padding: '10px 20px',
        borderRadius: '8px',
        background: 'white',
        border: `2px solid ${nodeColor}`,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        minWidth: '120px',
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Input Handle (Left) */}
      <Handle type="target" position={Position.Left} style={{ background: nodeColor }} />

      {/* Label & Tag */}
      <div style={{ fontWeight: 'bold', color: '#333' }}>{data.label}</div>
      {data.tag && (
        <span style={{ fontSize: '10px', background: '#eee', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display:'inline-block' }}>
          {data.tag}
        </span>
      )}

      {/* THE EXPAND BUTTON (+) */}
      {showActions && (
        <button
          onClick={handleExpand}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: 'none',
            background: nodeColor,
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          title="Expand this concept"
        >
          +
        </button>
      )}

      {/* Output Handle (Right) */}
      <Handle type="source" position={Position.Right} style={{ background: nodeColor }} />
    </div>
  );
};

export default CustomNode;