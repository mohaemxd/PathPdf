
import { Card, CardContent } from "@/components/ui/card";
import { Node } from "@xyflow/react";
import { RoadmapData } from "@/lib/gemini";

interface NodeDetailPanelProps {
  selectedNode: Node | null;
  roadmapData: RoadmapData;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ selectedNode, roadmapData }) => {
  if (!selectedNode) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{roadmapData.title}</h2>
        <p className="text-gray-600">
          Click on any node in the roadmap to view details about that topic.
        </p>
      </div>
    );
  }

  // Type assertion to ensure label and description are treated as strings
  const label = selectedNode.data.label as string;
  const description = selectedNode.data.description as string;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">{label}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      
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
  );
};

export default NodeDetailPanel;
