import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle, Bookmark } from 'lucide-react';

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
    colorPalette?: string[];
  };
  isConnectable: boolean;
}

const RoadmapNode = ({ data, isConnectable }: RoadmapNodeProps) => {
  // Use colorPalette if provided, otherwise fallback to indigo
  const palette = data.colorPalette || ['#3730a3', '#6366f1', '#a5b4fc', '#c7d2fe', '#e0e7ff'];
  const depth = Math.min(data.depth || 0, palette.length - 1);
  const bgColor = palette[depth];
  const textColor = depth < 2 ? '#fff' : '#111827';

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

  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative px-4 py-2 rounded-md shadow-md ${getStatusBorder()} transition duration-150 hover:scale-105 hover:ring-2 hover:ring-indigo-400 hover:z-10`}
      style={{ background: bgColor, color: textColor }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Custom Tooltip */}
      {hovered && (
        <div
          className="absolute z-50 rounded px-3 py-2 shadow-lg pointer-events-none text-[7px]"
          style={{
            left: 'calc(50% - 20px)',
            transform: 'translateX(-50%)',
            whiteSpace: 'pre-line',
            width: 150,
            minHeight: 80,
            background: bgColor,
            color: textColor,
            bottom: '100%',
            marginBottom: 8
          }}
        >
          {data.description}
        </div>
      )}
      <div className="flex items-center gap-1 font-medium text-sm">
        {data.bookmarked && (
          <span title="Bookmarked"><Bookmark className="h-4 w-4 text-yellow-400" fill="none" /></span>
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
