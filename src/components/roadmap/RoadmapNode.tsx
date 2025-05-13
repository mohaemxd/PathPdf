import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle, Star } from 'lucide-react';

interface RoadmapNodeProps {
  id: string;
  data: {
    title: string;
    description: string;
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
    children?: any[];
    completed?: boolean;
    bookmarked?: boolean;
    tooltip?: string;
    inProgress?: boolean;
  };
  isConnectable: boolean;
}

const RoadmapNode = ({ data, isConnectable }: RoadmapNodeProps) => {
  const getBgColor = () => {
    switch (data.depth) {
      case 0:
        return 'bg-indigo-800 text-white';
      case 1:
        return 'bg-indigo-600 text-white';
      case 2:
        return 'bg-indigo-400 text-white';
      default:
        return 'bg-indigo-300 text-indigo-900';
    }
  };

  // Determine status: completed, in progress, not started
  let status: 'completed' | 'inProgress' | 'notStarted' = 'notStarted';
  if (data.completed) status = 'completed';
  else if (data.inProgress) status = 'inProgress';

  const getStatusBorder = () => {
    switch (status) {
      case 'completed':
        return 'border-2 border-green-400';
      case 'inProgress':
        return 'border-2 border-yellow-400';
      default:
        return 'border border-gray-300';
    }
  };

  return (
    <div
      className={`px-4 py-2 rounded-md shadow-md relative ${getBgColor()} ${getStatusBorder()} transition duration-150 hover:scale-105 hover:ring-2 hover:ring-indigo-400 hover:z-10`}
      title={data.tooltip || data.description}
    >
      <div className="flex items-center gap-1 font-medium text-sm">
        {data.bookmarked && (
          <span title="Bookmarked"><Star className="h-4 w-4 text-yellow-300" /></span>
        )}
        <span>{data.title}</span>
        {data.completed && (
          <span title="Completed"><CheckCircle className="h-4 w-4 text-green-400" /></span>
        )}
      </div>
      
      {data.hasChildren && (
        <div className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center bg-white bg-opacity-20 rounded-full m-1">
          {data.isExpanded ? '-' : '+'}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-white border-2 border-indigo-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-white border-2 border-indigo-500"
      />
    </div>
  );
};

export default memo(RoadmapNode);
