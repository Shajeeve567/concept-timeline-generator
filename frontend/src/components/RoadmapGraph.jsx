import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  applyNodeChanges, 
  applyEdgeChanges  
} from 'reactflow';
import 'reactflow/dist/style.css'; 
import dagre from 'dagre';
import Modal from './Modal';
import '../Modal.css';
import CustomNode from './CustomNode';

const nodeWidth = 172;
const nodeHeight = 90;

const nodeTypes = {
  custom: CustomNode,
};

const getLayoutedElements = (nodes, edges) => {
  // 1. Initialize Graph
  // We enable 'multigraph' to prevent crashes if the AI generates duplicate edges
  const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
  dagreGraph.setGraph({ 
      rankdir: 'LR', 
      ranksep: 150, // 2. HUGE GAP horizontally (was default ~50)
      nodesep: 100  // 3. Bigger gap vertically
    });

  // 2. Add Nodes (Force IDs to string to be safe)
  nodes.forEach((node) => {
    dagreGraph.setNode(String(node.id), { width: nodeWidth, height: nodeHeight });
  });

  // 3. Add Edges with Safety Checks
  const validNodeIds = new Set(nodes.map((n) => String(n.id)));
  const validEdges = [];

  edges.forEach((edge) => {
    const source = String(edge.source);
    const target = String(edge.target);

    // Check if both nodes exist
    if (validNodeIds.has(source) && validNodeIds.has(target)) {
      // CRITICAL FIX: Pass '{}' as the third argument!
      // This ensures Dagre has a place to write the 'points' data.
      dagreGraph.setEdge(source, target, {}); 
      
      validEdges.push({
        ...edge,
        source: source,
        target: target
      });
    } else {
      console.warn(`👻 Ghost Edge removed: ${source} -> ${target}`);
    }
  });

  // 4. Calculate Layout
  dagre.layout(dagreGraph);

  // 5. Apply positions back to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeId = String(node.id);
    const nodeWithPosition = dagreGraph.node(nodeId);

    // Fallback if layout failed for this node
    if (!nodeWithPosition) {
      return { ...node, position: { x: 0, y: 0 } };
    }

    // Shift anchor point (Dagre is center-based, ReactFlow is top-left)
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    node.targetPosition = 'left';
    node.sourcePosition = 'right';

    return node;
  });

  return { nodes: layoutedNodes, edges: validEdges };
};


const RoadmapGraph = ({ data, concept }) => {

  const [ nodes, setNodes ] = useState([])
  const [ edges, setEdges ] = useState([])

  const [selectedNode, setSelectedNode] = useState(null)

  const [edgeTooltip, setEdgeTooltip] = useState(null); // { x, y, label }

  const handleExpandNode = useCallback(async (nodeId, nodeLabel, nodeType) => {
    console.log(`Expanding ${nodeLabel} (${nodeType})...`);

    try {
      const response = await fetch('http://localhost:8000/expand', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          concept: concept || data?.nodes[0]?.label,
          parent_node: nodeLabel,
          parent_id: nodeId,
          context_type: nodeType
        })
      })


      const newSubgraph = await response.json();

      console.log("New Nodes: ", newSubgraph.nodes);
      console.log("New Edges: ", newSubgraph.edges);
      

      if (!newSubgraph.nodes || newSubgraph.nodes.length === 0) return;

      // Format new nodes to match ReactFlow structure
      const newFlowNodes = newSubgraph.nodes.map(n => ({
        id: String(n.id),
        type: 'custom',
        data: { 
          label: n.label, 
          type: n.type, 
          tag: n.tag,
          details: n.details,
          onExpand: handleExpandNode // Pass function recursively
        },
        position: { x: 0, y: 0 }
      }));

      const newFlowEdges = newSubgraph.edges.map(e => ({
        id: `${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        data: { label: e.label },
        animated: true,
        style: { stroke: '#555' },
        interactionWidth: 20,
      }))

// Update State & Re-Layout
      setNodes((nds) => {
        const allNodes = [...nds, ...newFlowNodes];
        const currentEdges = edges; // Access current edges via closure or ref if needed
        // Note: For perfect layout, we usually need the latest edges here too.
        // We will trigger layout in a separate effect or immediately here:
        return allNodes; 
      });

      setEdges((eds) => {
        const allEdges = [...eds, ...newFlowEdges];
        
        // RE-LAYOUT everything
        // We use the functional update of setNodes to ensure we have latest nodes
        setNodes(prevNodes => {
           const { nodes: reLayoutedNodes } = getLayoutedElements([...prevNodes], allEdges);
           return reLayoutedNodes;
        });
        
        const { edges: reLayoutedEdges } = getLayoutedElements(nodes, allEdges); // Dummy call just to get edges if needed
        return allEdges; 
      });

    } catch (error) {
      console.error("Expansion failed:", error);
    }
  }, [concept, data, edges, nodes, setNodes, setEdges]);


  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onNodeClick = useCallback((event, node) => {
    // console.log([...data['nodes'].map((d) => d.id == node['id']? node: node)], " <-here")
    setSelectedNode({
        label: node.data.label,
        details: node.data.details, // This was missing because we looked in the wrong place
        type: node.data.type,
        tag: node.data.tag
    });
    console.log(selectedNode)
  }, [data])

  const handleCloseModal = () => {
    setSelectedNode(null)
  }

  const onEdgeMouseEnter = (event, edge) => {
    if (edge.data && edge.data.label) {
      setEdgeTooltip({
        x: event.clientX,
        y: event.clientY,
        label: edge.data.label
      })
    }
  }
  
  const onEdgeMouseLeave = () => {
    setEdgeTooltip(null);
  }

  useEffect(() => {
    if(!data) {
      setNodes([])
      setEdges([])
      return;
    }

    const initialNodes = data.nodes.map((n) => ({
          id: String(n.id),
          type: 'custom', // 👈 IMPORTANT: This activates CustomNode.jsx
          data: { 
            label: n.label,
            type: n.type,   // 👈 Pass 'root', 'core', or 'path' for colors
            tag: n.tag,
            details: n.details,
            onExpand: handleExpandNode // 👈 Pass the function so the button works!
          },
          position: { x: 0, y: 0 },
          // Note: We removed the 'style' object here because CustomNode.jsx 
          // handles its own styling (colors, borders) based on the type.
    }));

    const initialEdges = data.edges.map((e) => ({
      id: `${e.source}-${e.target}`,
      source: String(e.source),
      target: String(e.target),
      // label: String(e.label),
      data: {
        label: e.label
      },
      animated: true,
      style: { stroke: '#555'}, 
      interactionWidth: 20,
      labelStyle: { fill: '#555555', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
    }));

    const layout = getLayoutedElements(initialNodes, initialEdges)

    setNodes(layout.nodes);
    setEdges(layout.edges);

  }, [data])

  return (
    <>
    <div style={{ width: '100%', height: '100%', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      {selectedNode && (
          <Modal handleCloseModal={handleCloseModal}>
              {console.log("Node pressed!")}
              <div className="modal-header">
                  <h3 className="modal-title">{selectedNode.label}</h3>
                  {console.log(selectedNode)}
                  <button onClick={handleCloseModal} className="modal-close-btn">&times;</button>
              </div>
              <div style={{ lineHeight: '1.6', color: '#555' }}>
                  {selectedNode.details}
              </div>
          </Modal>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}

        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        
        panOnScroll={true}
        selectionOnDrag={true}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.1}

        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#aaa" gap={20} size={1} />
        <Controls />
        <MiniMap nodeColor="#e2e2e2" maskColor="rgba(240, 240, 240, 0.6)" />
      </ReactFlow>
      {/* 👇 RENDER THE TOOLTIP OVERLAY */}
      {edgeTooltip && (
        <div style={{
          position: 'fixed',
          top: edgeTooltip.y - 45, // Position above cursor
          left: edgeTooltip.x,
          transform: 'translateX(-50%)', // Center horizontally over cursor
          zIndex: 100,
          pointerEvents: 'none', // Lets clicks pass through to the graph
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
           {/* 1. The Main White Box */}
           <div style={{
             backgroundColor: 'white',
             color: '#333',
             padding: '6px 12px',
             borderRadius: '6px',
             fontSize: '12px',
             fontWeight: '500',
             boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
             whiteSpace: 'nowrap'
           }}>
             {edgeTooltip.label}
           </div>

           {/* 2. The Down Arrow (CSS Triangle) */}
           <div style={{
              width: 0, 
              height: 0, 
              // This creates a triangle pointing down
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white', // Must match the box color
              marginTop: '-1px' // Slight overlap to prevent tiny gaps
           }}></div>
        </div>
      )}
    </div>

    </>
  );
};

export default RoadmapGraph;