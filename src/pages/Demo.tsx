
import { useState } from "react";
import Header from "@/components/layout/Header";
import { Node } from "@xyflow/react";
import RoadmapFlow from "@/components/roadmap/RoadmapFlow";
import NodeDetailPanel from "@/components/roadmap/NodeDetailPanel";
import { sampleRoadmap } from "@/data/sampleRoadmap";

const Demo = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  const handleNodeClick = (_nodeId: string, node: Node) => {
    setSelectedNode(node);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 h-full border-r border-gray-200">
          <div style={{ height: 'calc(100vh - 64px)' }}>
            <RoadmapFlow 
              roadmapData={sampleRoadmap} 
              onNodeClick={handleNodeClick} 
            />
          </div>
        </div>
        
        <div className="w-full md:w-80 border-t md:border-t-0 border-gray-200 bg-gray-50 overflow-auto" style={{ height: selectedNode ? 'auto' : 'calc(100vh - 64px)' }}>
          <NodeDetailPanel 
            selectedNode={selectedNode}
            roadmapData={sampleRoadmap}
          />
        </div>
      </div>
    </div>
  );
};

export default Demo;
