
import { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import ReactFlow, {
  Node,
  Edge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "@/components/roadmap/CustomNode";

// Sample roadmap data
const sampleRoadmap = {
  title: "Java Programming",
  rootNode: {
    id: "node-1",
    title: "Java",
    description: "Java is a high-level, class-based, object-oriented programming language.",
    children: [
      {
        id: "node-2",
        title: "Java Basics",
        description: "Fundamental concepts in Java programming.",
        children: [
          {
            id: "node-2-1",
            title: "Syntax",
            description: "Basic rules for writing Java code.",
            children: []
          },
          {
            id: "node-2-2",
            title: "Variables",
            description: "How to declare and use variables in Java.",
            children: []
          }
        ]
      },
      {
        id: "node-3",
        title: "Data Types",
        description: "Types of data and their operations in Java.",
        children: [
          {
            id: "node-3-1",
            title: "Primitive Types",
            description: "Basic data types in Java.",
            children: []
          },
          {
            id: "node-3-2",
            title: "Reference Types",
            description: "Complex data types in Java.",
            children: []
          }
        ]
      },
      {
        id: "node-4",
        title: "OOP Concepts",
        description: "Object-Oriented Programming concepts in Java.",
        children: [
          {
            id: "node-4-1",
            title: "Classes & Objects",
            description: "Creating and using classes and objects.",
            children: []
          },
          {
            id: "node-4-2",
            title: "Inheritance",
            description: "Extending classes in Java.",
            children: []
          },
          {
            id: "node-4-3",
            title: "Polymorphism",
            description: "Methods behaving differently based on context.",
            children: []
          }
        ]
      }
    ]
  }
};

// Convert hierarchical data to ReactFlow format
const convertRoadmapToFlowFormat = (roadmapData: any) => {
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

// Initialize flow data from sample roadmap
const { nodes: initialNodes, edges: initialEdges } = convertRoadmapToFlowFormat(sampleRoadmap);

const Demo = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  const nodeTypes: NodeTypes = {
    custom: CustomNode
  };
  
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );
  
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 h-full border-r border-gray-200">
          <div style={{ height: 'calc(100vh - 64px)' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
            >
              <Controls />
              <MiniMap zoomable pannable />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>
        
        <div className="w-full md:w-80 border-t md:border-t-0 border-gray-200 bg-gray-50 overflow-auto" style={{ height: selectedNode ? 'auto' : 'calc(100vh - 64px)' }}>
          {selectedNode ? (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{selectedNode.data.label}</h2>
              <p className="text-gray-600 mb-4">{selectedNode.data.description}</p>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Learning Resources</h3>
                  <ul className="space-y-2">
                    <li className="text-sm">
                      <a href="#" className="text-pathpdf-600 hover:underline">Documentation</a>
                    </li>
                    <li className="text-sm">
                      <a href="#" className="text-pathpdf-600 hover:underline">Practice Exercises</a>
                    </li>
                    <li className="text-sm">
                      <a href="#" className="text-pathpdf-600 hover:underline">Video Tutorial</a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{sampleRoadmap.title}</h2>
              <p className="text-gray-600">
                Click on any node in the roadmap to view details about that topic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demo;
