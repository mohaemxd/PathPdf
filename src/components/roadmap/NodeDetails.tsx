
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface NodeDetailsProps {
  node: {
    id: string;
    title: string;
    description: string;
    hasChildren: boolean;
  };
  isExpanded: boolean;
  onExpandNode: (nodeId: string) => void;
}

const NodeDetails = ({ node, isExpanded, onExpandNode }: NodeDetailsProps) => {
  if (!node) {
    return null;
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-auto">
      <h2 className="text-xl font-semibold mb-2">{node.title}</h2>
      <p className="text-gray-600 mb-4">{node.description}</p>
      
      {node.hasChildren && (
        <Button 
          variant="outline"
          onClick={() => onExpandNode(node.id)} 
          className="mb-4 w-full"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Collapse Children
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Expand Children
            </>
          )}
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Learning Resources</CardTitle>
        </CardHeader>
        <CardContent>
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

export default NodeDetails;
