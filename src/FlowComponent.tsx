import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import RBush from 'rbush';
import dagre from 'dagre';

// const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'LR') => {
//   const dagreGraph = new dagre.graphlib.Graph();
//   dagreGraph.setGraph({ rankdir: direction });
//   dagreGraph.setDefaultEdgeLabel(() => ({}));

//   nodes.forEach(node => {
//     dagreGraph.setNode(node.id, { width: 172, height: 36 });
//   });

//   edges.forEach(edge => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   const layoutedNodes = nodes.map((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     node.position = {
//       x: nodeWithPosition.x,
//       y: nodeWithPosition.y,
//     };
//     node.data = {
//       ...node.data,
//       minX: node.position.x,
//       minY: node.position.y,
//       maxX: node.position.x,
//       maxY: node.position.y,
//     };
//     return node;
//   });
//   return {
//     nodes: layoutedNodes,
//     edges
//   };
// };

const numNodes = 500;
const numEdges = numNodes * 5;

const initialNodes: Node[] = Array.from({ length: numNodes }, (_, i) => ({
  id: `node-${i}`,
  type: 'default',
  data: { label: `Node ${i}` },
  position: { x: Math.random() * 2000, y: Math.random() * 10000 }, // Random initial positions
}));

const initialEdges: Edge[] = [];
const nodesWithChildren: Set<string> = new Set();

for (let i = 0; i < numNodes; i++) {
  const sourceNodeId = `node-${i}`;
  const numChildren = Math.random() < 0.5 ? 2 : 5;
  for (let j = 1; j <= numChildren; j++) {
    const childNodeIndex = i + j;
    if (childNodeIndex < numNodes) {
      const targetNodeId = `node-${childNodeIndex}`;
      initialEdges.push({
        id: `edge-${initialEdges.length}`,
        source: sourceNodeId,
        target: targetNodeId,
      });
      nodesWithChildren.add(sourceNodeId);
      nodesWithChildren.add(targetNodeId);
    }
  }
}

const allNodes = new Set(initialNodes.map(node => node.id));
const unconnectedNodes = Array.from(allNodes).filter(nodeId => !nodesWithChildren.has(nodeId));
unconnectedNodes.forEach(nodeId => {
  const randomTargetNodeId = Array.from(allNodes).find(id => id !== nodeId);
  if (randomTargetNodeId) {
    initialEdges.push({
      id: `edge-${initialEdges.length}`,
      source: nodeId,
      target: randomTargetNodeId,
    });
  }
});

// const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges, 'LR');

function FlowComponent() {
  const { getViewport, fitView } = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [visibleNodes, setVisibleNodes] = useState<Node[]>([]);
  const [visibleEdges, setVisibleEdges] = useState<Edge[]>([]);
  const rTree = useRef(new RBush<Node>()).current;

  const updateRTree = useCallback(() => {
    const { x, y, zoom } = getViewport();
    const padding = 50;

    const indexedNodes = nodes.map(node => ({
      ...node,
      minX: node.position.x,
      minY: node.position.y,
      maxX: node.position.x + padding,
      maxY: node.position.y + padding,
    }));

    rTree.clear();
    rTree.load(indexedNodes);
  }, [getViewport, nodes, rTree]);

  const getVisibleNodesAndEdges = useCallback(() => {
    const { x, y, zoom } = getViewport();
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;
    const padding = 50;

    const viewportBounds = {
      minX: x,
      minY: y,
      maxX: x + viewportWidth,
      maxY: y + viewportHeight,
    };

    const visibleNodes = rTree.search(viewportBounds);
    setVisibleNodes(visibleNodes);

    const visibleNodeIds = new Set(visibleNodes.map(node => node.id));
    const visibleEdges = edges.filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
    setVisibleEdges(visibleEdges);
    console.log("Visible Nodes", visibleNodes)
    console.log(getViewport())

  }, [getViewport, edges, rTree]);

  useEffect(() => {
    updateRTree();
    console.log("Update Tree")
  }, [nodes, updateRTree]);

  useEffect(() => {
    const handleResize = () => getVisibleNodesAndEdges();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleNodesAndEdges]);

  useEffect(() => {
    getVisibleNodesAndEdges();
  }, [getVisibleNodesAndEdges]);

  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    const { x, y, zoom } = getViewport();
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;

    const topLeft = { x, y };
    const bottomRight = { x: x + viewportWidth, y: y + viewportHeight };

    console.log('Top-Left (x, y):', topLeft);
    console.log('Bottom-Right (x, y):', bottomRight);

    // Get the mouse click position relative to the viewport
    const clickX = x + event.clientX / zoom;
    const clickY = y + event.clientY / zoom;

    console.log('Mouse Click (x, y):', { clickX, clickY });
  }, [getViewport]);

  return (
    <ReactFlow
      nodes={visibleNodes}
      edges={visibleEdges}
      onPaneClick={handlePaneClick}
      onMoveEnd={getVisibleNodesAndEdges}
    >
      
      <Controls />
      <Background />
    </ReactFlow>
  );
}

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <ReactFlowProvider>
        <FlowComponent />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
