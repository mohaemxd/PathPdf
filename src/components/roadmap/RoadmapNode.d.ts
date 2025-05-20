declare module '@/components/roadmap/RoadmapNode' {
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

  const RoadmapNode: React.FC<RoadmapNodeProps>;
  export default RoadmapNode;
} 