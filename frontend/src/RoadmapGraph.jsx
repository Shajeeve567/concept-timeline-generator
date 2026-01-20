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
import './Modal.css';

const nodeWidth = 172;
const nodeHeight = 90;


const getLayoutedElements = (nodes, edges) => {
  // 1. Initialize Graph
  // We enable 'multigraph' to prevent crashes if the AI generates duplicate edges
  const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
  dagreGraph.setGraph({ rankdir: 'LR' }); 

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




const RoadmapGraph = ({ data }) => {

  const [ nodes, setNodes ] = useState([])
  const [ edges, setEdges ] = useState([])

  const [selectedNode, setSelectedNode] = useState(null)

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onNodeClick = useCallback((event, node) => {
    // console.log([...data['nodes'].map((d) => d.id == 'ai-origin'? d.details: null)][0], " <-here")
    setSelectedNode([...data['nodes'].map((d) => d.id == 'ai-origin'? d: null)][0])
  }, [])

  const handleCloseModal = () => {
    setSelectedNode(null)
  }

  useEffect(() => {
    if(!data) {
      setNodes([])
      setEdges([])
      return;
    }

    const initialNodes = data.nodes.map((n) => ({
      id: String(n.id), // Ensure ID is string
      data: { label: n.label },
      position: { x: 0, y: 0 },
      style: { 
        background: n.type === 'origin' ? '#ffebee' : '#fff',
        border: '1px solid #777',
        borderRadius: '5px',
        padding: '10px',
        fontSize: '12px',
        textAlign: 'center',
        width: nodeWidth 
      }
    }));

    const initialEdges = data.edges.map((e) => ({
      id: `${e.source}-${e.target}`,
      source: String(e.source),
      target: String(e.target),
      animated: true,
      style: { stroke: '#555' }
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
                  {/* {console.log(selectedNode)} */}
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
        fitView
        
        panOnScroll={true}
        selectionOnDrag={true}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.1}

        attributionPosition="bottom-right"
      >
        <Background color="#aaa" gap={20} size={1} />
        <Controls />
        <MiniMap nodeColor="#e2e2e2" maskColor="rgba(240, 240, 240, 0.6)" />
      </ReactFlow>
    </div>

    </>
  );
};

export default RoadmapGraph;