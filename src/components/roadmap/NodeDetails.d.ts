declare module '@/components/roadmap/NodeDetails' {
  interface NodeDetailsProps {
    node: {
      id: string;
      title: string;
      description: string;
      hasChildren: boolean;
      completed: boolean;
      inProgress: boolean;
      bookmarked: boolean;
      children?: any[];
    };
    onExpandNode: (nodeId: string) => void;
    isExpanded: boolean;
    getBreadcrumbs: (nodeId: string) => { id: string; title: string }[];
    onStatusChange: () => void;
    onBookmarkChange?: () => void;
    focusMode: boolean;
    setFocusMode: (mode: boolean) => void;
    onToggleNodeComplete?: (nodeId: string) => void;
  }

  const NodeDetails: React.FC<NodeDetailsProps>;
  export default NodeDetails;
} 