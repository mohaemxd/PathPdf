import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeDetails from './NodeDetails';
import RoadmapNode from './RoadmapNode';
import { RoadmapData } from '@/lib/gemini';
import { Search, Maximize2, Minimize2 } from 'lucide-react';

// Custom node types
const nodeTypes = {
  roadmapNode: RoadmapNode,
};

interface RoadmapViewProps {
  roadmapData: RoadmapData;
}

export default function RoadmapView({ roadmapData }: RoadmapViewProps) {
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['node-1'])); // Root node always expanded
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [statusRefresh, setStatusRefresh] = useState(0); // NEW: for status sync
  const [focusMode, setFocusMode] = useState(false); // NEW: focus mode

  // Helper: Find path from root to a node by id (returns array of node IDs)
  function getBreadcrumbIds(nodeId: string): string[] {
    const path: string[] = [];
    function dfs(node: any): boolean {
      if (!node) return false;
      path.push(node.id);
      if (node.id === nodeId) return true;
      if (node.children) {
        for (const child of node.children) {
          if (dfs(child)) return true;
        }
      }
      path.pop();
      return false;
    }
    dfs(roadmapData.rootNode);
    return path;
  }

  // Helper: Find path from root to a node by id (returns array of {id, title})
  function getBreadcrumbs(nodeId: string): { id: string; title: string }[] {
    const path: { id: string; title: string }[] = [];
    function dfs(node: any): boolean {
      if (!node) return false;
      path.push({ id: node.id, title: node.title });
      if (node.id === nodeId) return true;
      if (node.children) {
        for (const child of node.children) {
          if (dfs(child)) return true;
        }
      }
      path.pop();
      return false;
    }
    dfs(roadmapData.rootNode);
    return path;
  }

  // Compute highlighted edge IDs for the selected node
  const highlightedEdgeIds = useMemo(() => {
    if (!nodeDetails?.id) return new Set<string>();
    const ids = getBreadcrumbIds(nodeDetails.id);
    const edgeIds = new Set<string>();
    for (let i = 1; i < ids.length; i++) {
      edgeIds.add(`e-${ids[i - 1]}-${ids[i]}`);
    }
    return edgeIds;
  }, [nodeDetails]);

  // Helper: Get parent ID of a node
  function getParentId(nodeId: string, node: any = roadmapData.rootNode, parentId: string | null = null): string | null {
    if (!node) return null;
    if (node.id === nodeId) return parentId;
    if (node.children) {
      for (const child of node.children) {
        const found = getParentId(nodeId, child, node.id);
        if (found) return found;
      }
    }
    return null;
  }

  // Convert hierarchical data to ReactFlow format
  const { initialNodes, initialEdges } = useMemo(() => {
    return convertRoadmapToFlowFormat(roadmapData, expandedNodes, nodePositions, highlightedEdgeIds);
  }, [roadmapData, expandedNodes, nodePositions, statusRefresh, highlightedEdgeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Filter nodes/edges for focus mode
  const filteredNodes = useMemo(() => {
    if (!focusMode || !nodeDetails?.id) return nodes;
    const selectedId = nodeDetails.id;
    const parentId = getParentId(selectedId);
    const childIds = nodes.find(n => n.id === selectedId)?.data?.children?.map((c: any) => c.id) || [];
    const allowedIds = new Set([selectedId]);
    if (parentId) allowedIds.add(parentId);
    childIds.forEach((id: string) => allowedIds.add(id));
    return nodes.filter(n => allowedIds.has(n.id));
  }, [focusMode, nodeDetails, nodes]);

  const filteredEdges = useMemo(() => {
    if (!focusMode || !nodeDetails?.id) return edges;
    const selectedId = nodeDetails.id;
    const parentId = getParentId(selectedId);
    const childIds = nodes.find(n => n.id === selectedId)?.data?.children?.map((c: any) => c.id) || [];
    const allowedEdgeIds = new Set<string>();
    if (parentId) allowedEdgeIds.add(`e-${parentId}-${selectedId}`);
    childIds.forEach((id: string) => allowedEdgeIds.add(`e-${selectedId}-${id}`));
    return edges.filter(e => allowedEdgeIds.has(e.id));
  }, [focusMode, nodeDetails, edges, nodes]);

  // Update nodes and edges when expanded nodes change
  useEffect(() => {
    if (roadmapData) {
      const { initialNodes, initialEdges } = convertRoadmapToFlowFormat(
        roadmapData,
        expandedNodes,
        nodePositions,
        highlightedEdgeIds
      );
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [expandedNodes, roadmapData, setNodes, setEdges, nodePositions, highlightedEdgeIds]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setNodeDetails(node.data);
  }, []);

  const onExpandNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Update nodePositions only when a node is dragged
  const onNodeDragStop = useCallback((event, node) => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: { x: node.position.x, y: node.position.y }
    }));
  }, []);

  // Restore roadmap state from localStorage on load
  useEffect(() => {
    if (roadmapData?.title) {
      const saved = localStorage.getItem(`roadmap-state-${roadmapData.title}`);
      if (saved) {
        try {
          const { expandedNodes: savedExpanded, nodePositions: savedPositions } = JSON.parse(saved);
          if (savedExpanded) setExpandedNodes(new Set(savedExpanded));
          if (savedPositions) setNodePositions(savedPositions);
        } catch (e) { /* ignore parse errors */ }
      }
    }
  }, [roadmapData]);

  // Persist roadmap state to localStorage on change
  useEffect(() => {
    if (roadmapData?.title) {
      localStorage.setItem(
        `roadmap-state-${roadmapData.title}`,
        JSON.stringify({
          expandedNodes: Array.from(expandedNodes),
          nodePositions,
        })
      );
    }
  }, [expandedNodes, nodePositions, roadmapData]);

  // No data state
  if (!roadmapData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No roadmap data available</p>
      </div>
    );
  }

  // Callback to trigger refresh when status changes in sidebar
  const handleStatusChange = useCallback(() => {
    setStatusRefresh((r) => r + 1);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1">
          <ReactFlow
            nodes={filteredNodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                completed: localStorage.getItem(`node-complete-${node.id}`) === 'true',
                inProgress: localStorage.getItem(`node-inprogress-${node.id}`) === 'true',
                bookmarked: localStorage.getItem(`node-bookmark-${node.id}`) === 'true',
                // Tooltip: description for preview
                tooltip: node.data.description,
              },
            }))}
            edges={filteredEdges.map(edge => ({
              ...edge,
              style: edge.highlighted
                ? { stroke: '#2563eb', strokeWidth: 4 }
                : { stroke: '#0ea5e9', strokeWidth: 2 },
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            onNodeDragStop={onNodeDragStop}
          >
            <Controls className="rf-controls-top-right" />
            <MiniMap 
              nodeColor={(node) => {
                if (node.data.completed) return '#22c55e'; // green for completed
                if (node.data.inProgress) return '#facc15'; // yellow for in progress
                if (node.data.bookmarked) return '#facc15'; // yellow for bookmarked
                return node.data.depth === 0 ? '#4338CA' :
                       node.data.depth === 1 ? '#6366F1' :
                       node.data.depth === 2 ? '#818CF8' : '#A5B4FC';
              }}
              maskColor="#f8fafc80"
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
        
        {/* Resizable Sidebar */}
        {nodeDetails && (
          <ResizableSidebar>
          <NodeDetails 
            node={{
              ...nodeDetails,
              hasChildren: nodeDetails.hasChildren ?? (Array.isArray(nodeDetails.children) && nodeDetails.children.length > 0),
              completed: localStorage.getItem(`node-complete-${nodeDetails.id}`) === 'true',
              inProgress: localStorage.getItem(`node-inprogress-${nodeDetails.id}`) === 'true',
              bookmarked: localStorage.getItem(`node-bookmark-${nodeDetails.id}`) === 'true',
            }}
            onExpandNode={onExpandNode} 
            isExpanded={expandedNodes.has(nodeDetails.id)}
            getBreadcrumbs={getBreadcrumbs}
            onStatusChange={handleStatusChange}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
          />
          </ResizableSidebar>
        )}
      </div>
    </div>
  );
}

// Helper function to convert hierarchical data to nodes/edges
function convertRoadmapToFlowFormat(
  roadmapData: RoadmapData, 
  expandedNodes: Set<string>,
  nodePositions: Record<string, { x: number; y: number }>,
  highlightedEdgeIds?: Set<string>
) {
  if (!roadmapData || !roadmapData.rootNode) {
    return { initialNodes: [], initialEdges: [] };
  }

  const nodes: any[] = [];
  const edges: any[] = [];
  
  // Starting position
  let startX = 0;
  let startY = 0;
  
  // Process the hierarchical data recursively
  const processNode = (node: any, depth = 0, position = { x: startX, y: startY }, parentId: string | null = null) => {
    // Use saved position if available, otherwise use calculated position
    const nodePosition = nodePositions[node.id] || position;
    
    // Add this node
    nodes.push({
      id: node.id,
      type: 'roadmapNode',
      position: nodePosition,
      data: {
        ...node,
        depth,
        isExpanded: expandedNodes.has(node.id),
        hasChildren: node.children && node.children.length > 0
      },
      style: {
        width: 180,
        height: 60,
      }
    });
    
    // If this node has a parent, add an edge
    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        animated: false,
        highlighted: highlightedEdgeIds && highlightedEdgeIds.has(`e-${parentId}-${node.id}`),
      });
    }
    
    // Process children if this node is expanded
    if (node.children && node.children.length > 0 && expandedNodes.has(node.id)) {
      const childYSpacing = 100;
      const childXOffset = 250;
      
      // Calculate vertical space needed
      const totalHeight = (node.children.length - 1) * childYSpacing;
      
      node.children.forEach((child: any, index: number) => {
        // Calculate default position for this child
        const defaultChildY = nodePosition.y - (totalHeight / 2) + (index * childYSpacing);
        const defaultChildPosition = {
          x: nodePosition.x + childXOffset,
          y: defaultChildY
        };
        
        // Process this child node
        processNode(child, depth + 1, defaultChildPosition, node.id);
      });
    }
  };
  
  // Start with the root node
  processNode(roadmapData.rootNode);
  
  return { initialNodes: nodes, initialEdges: edges };
}

// Minimal resizable sidebar component
function ResizableSidebar({ children }: { children: React.ReactNode }) {
  const minWidth = 320; // px
  const maxWidth = 600; // px
  const [width, setWidth] = useState(384); // default 24rem
  const dragging = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setWidth(w => {
      const newWidth = Math.min(Math.max(minWidth, window.innerWidth - e.clientX), maxWidth);
      return newWidth;
    });
  };
  const onMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = '';
  };
  // Attach listeners
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div style={{ width, minWidth, maxWidth, position: 'relative', height: '100%' }}>
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 10 }}
        className="hover:bg-indigo-200 transition-colors"
      />
      <div style={{ width: '100%', height: '100%' }}>{children}</div>
    </div>
  );
}
