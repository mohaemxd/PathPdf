
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface RoadmapNodeProps {
  id: string;
  data: {
    title: string;
    description: string;
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
    children?: any[];
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

  return (
    <div className={`px-4 py-2 rounded-md shadow-md ${getBgColor()}`}>
      <div className="font-medium text-sm">{data.title}</div>
      
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
