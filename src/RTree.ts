// // src/RTree.ts

// interface NodeBounds {
//     minX: number;
//     minY: number;
//     maxX: number;
//     maxY: number;
//   }
  
//   class RTreeNode {
//     bounds: NodeBounds;
//     id: string;
//     children: RTreeNode[];
//     isLeaf: boolean;
  
//     constructor(bounds: NodeBounds, id: string, isLeaf = true) {
//       this.bounds = bounds;
//       this.id = id;
//       this.children = [];
//       this.isLeaf = isLeaf;
//     }
  
//     insert(child: RTreeNode) {
//       if (this.isLeaf) {
//         this.children.push(child);
//       } else {
//         // Implement splitting logic for non-leaf nodes (not included in this simple example)
//       }
//     }
  
//     search(bounds: NodeBounds): RTreeNode[] {
//       let results: RTreeNode[] = [];
  
//       if (this.intersects(bounds)) {
//         if (this.isLeaf) {
//           results.push(this);
//         } else {
//           for (const child of this.children) {
//             results = results.concat(child.search(bounds));
//           }
//         }
//       }
  
//       return results;
//     }
  
//     intersects(bounds: NodeBounds): boolean {
//       return !(
//         this.bounds.minX > bounds.maxX ||
//         this.bounds.maxX < bounds.minX ||
//         this.bounds.minY > bounds.maxY ||
//         this.bounds.maxY < bounds.minY
//       );
//     }
//   }
  
//   export default RTreeNode;
//   // src/App.tsx
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
// import dagre from 'dagre';
// import RTreeNode from './RTree'; // Import the custom R* tree

// const nodeWidth = 172;
// const nodeHeight = 36;
// const padding = 50; // Padding around the node to extend the bounds (can be adjusted)

// const totalNodes = 100;

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
//       minX: node.position.x - padding,
//       minY: node.position.y - padding,
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

//   const rTree = new RTreeNode({ minX: 0, minY: 0, maxX: 0, maxY: 0 }, '', false);

//   // Memoized indexNodes function
//   const indexNodes = useCallback((nodes: Node[]) => {
//     rTree.children = nodes.map((node) => 
//       new RTreeNode({
//         minX: node.data.minX,
//         minY: node.data.minY,
//         maxX: node.data.maxX,
//         maxY: node.data.maxY
//       }, node.id, true)
//     );
//   }, [rTree]);

//   // Function to get visible nodes
//   const getVisibleNodes = useCallback(() => {
//     const { x, y, zoom } = getViewport();
//     const viewportBounds = {
//       minX: x,
//       minY: y,
//       maxX: x + window.innerWidth / zoom,
//       maxY: y + window.innerHeight / zoom,
//     };

//     const visibleNodes = rTree.search(viewportBounds).map(node => 
//       nodes.find(n => n.id === node.id) || null
//     ).filter(n => n !== null) as Node[];
//     setVisibleNodes(visibleNodes);
//     console.log('Visible Nodes:', visibleNodes);

//     // Update pan area state
//     setPanArea(viewportBounds);
//   }, [getViewport, rTree, nodes]);

//   // Handle viewport changes
//   const handleViewportChange = useCallback(() => {
//     getVisibleNodes();
//   }, [getVisibleNodes]);

//   useEffect(() => {
//     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedNodesAndEdges(
//       initialNodes,
//       initialEdges
//     );
//     console.log(layoutedNodes);
//     setNodes(layoutedNodes);
//     setEdges(layoutedEdges);
//     indexNodes(layoutedNodes);
//   }, [indexNodes]); // Ensure that indexNodes is stable

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
//       //onZoom={handleViewportChange}
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
