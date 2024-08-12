// // src/App.tsx
// import React, { useEffect, useState, useCallback } from 'react';
// import ReactFlow, {
//   MiniMap,
//   Controls,
//   Background,
//   Node,
//   Edge,
//   ReactFlowProvider,
//   useReactFlow,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import RBush from 'rbush';

// // Define types for initial nodes and edges
// const initialNodes: Node[] = Array.from({ length: 100 }, (_, i) => ({
//   id: `node-${i}`,
//   type: 'default',
//   data: { label: `Node ${i}` },
//   position: { x: Math.random() * 1000, y: Math.random() * 1000 }, // Random initial positions
// }));

// const initialEdges: Edge[] = Array.from({ length: 99 }, (_, i) => ({
//   id: `edge-${i}`,
//   source: `node-${i}`,
//   target: `node-${i + 1}`,
// }));

// function FlowComponent() {
//   const { getViewport, fitView } = useReactFlow();
//   const [nodes, setNodes] = useState<Node[]>(initialNodes);
//   const [edges, setEdges] = useState<Edge[]>(initialEdges);
//   const [visibleNodes, setVisibleNodes] = useState<Node[]>([]);
  
//   const rTree = new RBush<Node>();

//   // Function to add nodes to RBush index
//   const indexNodes = useCallback((nodes: Node[]) => {
//     const indexedNodes = nodes.map(node => ({
//       ...node,
//       minX: node.position.x,
//       minY: node.position.y,
//       maxX: node.position.x + 200, // Default width
//       maxY: node.position.y + 50,  // Default height
//     }));
//     rTree.load(indexedNodes);
//   }, [rTree]);

//   // Function to get visible nodes
//   const getVisibleNodes = useCallback(() => {
//     const { x, y, zoom } = getViewport();
//     const padding = 200; // Padding around the viewport to account for movement
//     const viewportBounds = {
//       minX: x - padding,
//       minY: y - padding,
//       maxX: x + window.innerWidth / zoom + padding,
//       maxY: y + window.innerHeight / zoom + padding,
//     };

//     const visible = rTree.search(viewportBounds);
//     setVisibleNodes(visible);
//     console.log('Visible Nodes:', visible);
//   }, [getViewport, rTree]);

//   // Handle viewport changes
//   const handleViewportChange = useCallback(() => {
//     getVisibleNodes();
//   }, [getVisibleNodes]);

//   useEffect(() => {
//     indexNodes(nodes);
//   }, [nodes, indexNodes]);

//   // Set up a resize listener to handle viewport changes
//   useEffect(() => {
//     window.addEventListener('resize', handleViewportChange);
//     return () => {
//       window.removeEventListener('resize', handleViewportChange);
//     };
//   }, [handleViewportChange]);

//   return (
//     <ReactFlow
//       nodes={visibleNodes}
//       edges={edges.filter(edge => visibleNodes.some(node => edge.source === node.id || edge.target === node.id))}
//       fitView
//       onLoad={(instance) => {
//         fitView(); // Adjust initial view if needed
//       }}
//       onMove={handleViewportChange}
//       //onZoom={handleViewportChange}
//     >
//       <MiniMap />
//       <Controls />
//       <Background />
//     </ReactFlow>
//   );
// }

// function App() {
//   return (
//     <div style={{ height: '100vh' }}>
//       <ReactFlowProvider>
//         <FlowComponent />
//       </ReactFlowProvider>
//     </div>
//   );
// }

// export default App;
