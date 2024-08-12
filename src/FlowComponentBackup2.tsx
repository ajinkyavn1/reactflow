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
// import dagre from 'dagre';

// const nodeWidth =  window.innerWidth/2;
// const nodeHeight = window.innerHeight/2;
// const padding = 200; // Padding around the node to extend the bounds (can be adjusted)

// const totalNodes = 300;

// // Generate initial nodes
// const initialNodes: Node[] = Array.from({ length: totalNodes }, (_, i) => ({
//   id: `node-${i}`,
//   type: 'default',
//   data: { label: `Node ${i}` },
//   position: { x: 0, y: 0 }, // Initial positions will be updated by Dagre
// }));

// // Generate initial edges where each node has 2-3 children
// const initialEdges: Edge[] = [];

// for (let i = 0; i < totalNodes; i++) {
//   const numChildren = Math.floor(Math.random() * 2) + 2; // 2-3 children
//   for (let j = 1; j <= numChildren; j++) {
//     const childIndex = i * 2 + j;
//     if (childIndex < totalNodes) {
//       initialEdges.push({
//         id: `edge-${i}-${childIndex}`,
//         source: `node-${i}`,
//         target: `node-${childIndex}`,
//       });
//     }
//   }
// }

// // Dagre layout function
// const getLayoutedNodesAndEdges = (nodes: Node[], edges: Edge[], direction = 'LR') => {
//   const dagreGraph = new dagre.graphlib.Graph();
//   dagreGraph.setDefaultEdgeLabel(() => ({}));
//   const isHorizontal = direction === 'LR';
//   dagreGraph.setGraph({ rankdir: direction });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   const layoutedNodes = nodes.map((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     node.position = {
//       x: nodeWithPosition.x - nodeWidth / 2,
//       y: nodeWithPosition.y - nodeHeight / 2,
//     };
//     node.data = {
//       ...node.data,
//       minX: node.position.x ,
//       minY: node.position.y,
//       maxX: node.position.x + nodeWidth + padding,
//       maxY: node.position.y + nodeHeight + padding,
//     };
//     return node;
//   });

//   return { nodes: layoutedNodes, edges };
// };

// function FlowComponent() {
//   const { getViewport, fitView } = useReactFlow();
//   const [nodes, setNodes] = useState<Node[]>([]);
//   const [edges, setEdges] = useState<Edge[]>(initialEdges);
//   const [visibleNodes, setVisibleNodes] = useState<Node[]>([]);
//   const [panArea, setPanArea] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 });

//   const rTree = new RBush<Node>();

//   // Index the nodes in RBush
//   const indexNodes = useCallback((nodes: Node[]) => {
//     const indexedNodes = nodes.map((node) => ({
//       ...node,
//       minX: node.data.minX,
//       minY: node.data.minY,
//       maxX: node.data.maxX,
//       maxY: node.data.maxY,
//     }));
//     rTree.load(indexedNodes);
//   }, [rTree]);

//   // Function to get visible nodes
//   const getVisibleNodes = useCallback(() => {
//     const { x, y, zoom } = getViewport();
//     const viewportBounds = {
//       minX: panArea.minX,
//       minY: panArea.minY,
//       maxX: x + window.innerWidth / zoom,
//       maxY: y + window.innerHeight / zoom,
//     };

//     const visible = rTree.search(viewportBounds);
//     setVisibleNodes(visible);
//     console.log('Visible Nodes:', visible);

//     // Update pan area state
//     setPanArea(viewportBounds);
//   }, [getViewport, rTree]);

//   // Handle viewport changes
//   const handleViewportChange = useCallback(() => {
//     getVisibleNodes();
//   }, [getVisibleNodes]);

//   // Handle canvas click event
//   const handleCanvasClick = (event: React.MouseEvent) => {
//     const { x, y, zoom } = getViewport();
//     const clickX = event.clientX / zoom + x;
//     const clickY = event.clientY / zoom + y;
//     console.log(`Clicked at: (${clickX.toFixed(2)}, ${clickY.toFixed(2)})`);
//   };

//   useEffect(() => {
//     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedNodesAndEdges(
//       initialNodes,
//       initialEdges
//     );
//     setNodes(layoutedNodes);
//     setEdges(layoutedEdges);
//     indexNodes(layoutedNodes);
//   }, [indexNodes]);

//   // Set up a resize listener to handle viewport changes
//   useEffect(() => {
//     window.addEventListener('resize', handleViewportChange);
//     return () => {
//       window.removeEventListener('resize', handleViewportChange);
//     };
//   }, [handleViewportChange]);

//   // Print the pan area coordinates
//   useEffect(() => {
//     console.log(`Top-left: (${panArea.minX}, ${panArea.minY}), Bottom-right: (${panArea.maxX}, ${panArea.maxY})`);

//     // Update or add the node that shows the pan area coordinates
//     const coordinateNode: Node = {
//       id: 'coordinate-node',
//       type: 'default',
//       data: {
//         label: `Top-left: (${Math.round(panArea.minX)}, ${Math.round(panArea.minY)})\nBottom-right: (${Math.round(panArea.maxX)}, ${Math.round(panArea.maxY)})`,
//       },
//       position: { x: panArea.minX + 10, y: panArea.minY + 10 },
//       draggable: false,
//     };

//     setNodes((nds) => {
//       const existingNodeIndex = nds.findIndex((node) => node.id === 'coordinate-node');
//       if (existingNodeIndex >= 0) {
//         const updatedNodes = [...nds];
//         updatedNodes[existingNodeIndex] = coordinateNode;
//         return updatedNodes;
//       } else {
//         return [...nds, coordinateNode];
//       }
//     });
//   }, [panArea]);

//   return (
//     <ReactFlow
//       nodes={visibleNodes}
//       edges={edges.filter((edge) => visibleNodes.some((node) => edge.source === node.id || edge.target === node.id))}
//       fitView
//       onLoad={(instance) => {
//         fitView(); // Adjust initial view if needed
//       }}
//       onMove={handleViewportChange}
//       onClick={handleCanvasClick} // Attach the click handler
//       // onZoom={handleViewportChange}
//     >
//       <MiniMap />
//       <Controls />
//       <Background />
//       {/* Highlight the pan area */}
//       <div
//         style={{
//           position: 'absolute',
//           left: panArea.minX,
//           top: panArea.minY,
//           width: panArea.maxX - panArea.minX,
//           height: panArea.maxY - panArea.minY,
//           border: '2px dashed red',
//           pointerEvents: 'none',
//         }}
//       />
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
