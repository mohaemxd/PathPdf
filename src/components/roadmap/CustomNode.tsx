
import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomNodeProps {
  id: string;
  data: {
    label: string;
    description: string;
    expanded?: boolean;
  };
}

const CustomNode = ({ id, data }: CustomNodeProps) => {
  const [expanded, setExpanded] = useState(data.expanded || false);
  
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border ${
      expanded ? 'border-pathpdf-400' : 'border-gray-200'
    }`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-3 ${
          expanded ? 'bg-pathpdf-500' : 'bg-gray-300'
        }`} />
        <div>
          <div className="font-medium">{data.label}</div>
          {expanded && (
            <div className="text-xs text-gray-500 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 rounded-full bg-pathpdf-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 rounded-full bg-pathpdf-500 border-2 border-white"
      />
      
      <div 
        className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 text-xs"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '-' : '+'}
      </div>
    </div>
  );
};

export default memo(CustomNode);
