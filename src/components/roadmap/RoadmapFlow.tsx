
import { useState, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "@/components/roadmap/CustomNode";
import { RoadmapData } from "@/lib/gemini";

interface RoadmapFlowProps {
  roadmapData: RoadmapData;
  onNodeClick: (nodeId: string, node: Node) => void;
}

// Convert hierarchical data to ReactFlow format
const convertRoadmapToFlowFormat = (roadmapData: RoadmapData) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Helper function to process node and its children
  const processNode = (node: any, position = { x: 0, y: 0 }, level = 0) => {
    nodes.push({
      id: node.id,
      type: 'custom',
      data: { 
        label: node.title, 
        description: node.description,
        expanded: level < 1 // Auto-expand first level
      },
      position
    });
    
    if (node.children && node.children.length > 0) {
      // Calculate positions for children
      const childYStep = 100;
      const childXStep = 200;
      
      node.children.forEach((child: any, index: number) => {
        const childPosition = {
          x: position.x + childXStep,
          y: position.y - ((node.children.length - 1) * childYStep / 2) + index * childYStep
        };
        
        // Add edge from parent to child
        edges.push({
          id: `e${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          animated: false,
          style: { stroke: '#0ea5e9' }
        });
        
        // Process child node and its children
        processNode(child, childPosition, level + 1);
      });
    }
  };
  
  processNode(roadmapData.rootNode);
  
  return { nodes, edges };
};

const RoadmapFlow: React.FC<RoadmapFlowProps> = ({ roadmapData, onNodeClick }) => {
  const { nodes: initialNodes, edges: initialEdges } = convertRoadmapToFlowFormat(roadmapData);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const nodeTypes: NodeTypes = {
    custom: CustomNode
  };
  
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );
  
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    onNodeClick(node.id, node);
  };
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      maxZoom={1.5}
    >
      <Controls />
      <MiniMap zoomable pannable />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

export default RoadmapFlow;
