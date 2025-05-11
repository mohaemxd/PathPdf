
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeDetails from './NodeDetails';
import RoadmapNode from './RoadmapNode';
import { RoadmapData } from '@/lib/gemini';

// Custom node types
const nodeTypes = {
  roadmapNode: RoadmapNode,
};

interface RoadmapViewProps {
  roadmapData: RoadmapData;
}

export default function RoadmapView({ roadmapData }: RoadmapViewProps) {
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['node-1'])); // Root node always expanded

  // Convert hierarchical data to ReactFlow format
  const { initialNodes, initialEdges } = useMemo(() => {
    return convertRoadmapToFlowFormat(roadmapData, expandedNodes);
  }, [roadmapData, expandedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when expanded nodes change
  useEffect(() => {
    if (roadmapData) {
      const { initialNodes, initialEdges } = convertRoadmapToFlowFormat(
        roadmapData,
        expandedNodes
      );
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [expandedNodes, roadmapData, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setNodeDetails(node.data);
  }, []);

  const onExpandNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // No data state
  if (!roadmapData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No roadmap data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              return node.data.depth === 0 ? '#4338CA' :
                     node.data.depth === 1 ? '#6366F1' :
                     node.data.depth === 2 ? '#818CF8' : '#A5B4FC';
            }}
            maskColor="#f8fafc80"
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      
      {nodeDetails && (
        <NodeDetails 
          node={nodeDetails} 
          onExpandNode={onExpandNode} 
          isExpanded={expandedNodes.has(nodeDetails.id)}
        />
      )}
    </div>
  );
}

// Helper function to convert hierarchical data to nodes/edges
function convertRoadmapToFlowFormat(roadmapData: RoadmapData, expandedNodes: Set<string>) {
  if (!roadmapData || !roadmapData.rootNode) {
    return { initialNodes: [], initialEdges: [] };
  }

  const nodes: any[] = [];
  const edges: any[] = [];
  
  // Starting position
  let startX = 0;
  let startY = 0;
  
  // Process the hierarchical data recursively
  const processNode = (node: any, depth = 0, position = { x: startX, y: startY }, parentId: string | null = null) => {
    // Add this node
    nodes.push({
      id: node.id,
      type: 'roadmapNode',
      position,
      data: {
        ...node,
        depth,
        isExpanded: expandedNodes.has(node.id),
        hasChildren: node.children && node.children.length > 0
      },
      style: {
        width: 180,
        height: 60,
      }
    });
    
    // If this node has a parent, add an edge
    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        animated: false,
        style: { stroke: '#0ea5e9' }
      });
    }
    
    // Process children if this node is expanded
    if (node.children && node.children.length > 0 && expandedNodes.has(node.id)) {
      const childYSpacing = 100;
      const childXOffset = 250;
      
      // Calculate vertical space needed
      const totalHeight = (node.children.length - 1) * childYSpacing;
      
      node.children.forEach((child: any, index: number) => {
        // Calculate position for this child
        const childY = position.y - (totalHeight / 2) + (index * childYSpacing);
        const childPosition = {
          x: position.x + childXOffset,
          y: childY
        };
        
        // Process this child node
        processNode(child, depth + 1, childPosition, node.id);
      });
    }
  };
  
  // Start with the root node
  processNode(roadmapData.rootNode);
  
  return { initialNodes: nodes, initialEdges: edges };
}
