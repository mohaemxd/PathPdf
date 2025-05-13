import React from "react";
import { ReactFlow, Background, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RoadmapData } from "@/lib/gemini";

interface MiniRoadmapViewProps {
  roadmapData: RoadmapData;
}

export default function MiniRoadmapView({ roadmapData }: MiniRoadmapViewProps) {
  if (!roadmapData || !roadmapData.rootNode) return null;

  // Only show root and first-level children
  const root = roadmapData.rootNode;
  const nodes = [
    {
      id: root.id,
      type: "default",
      data: { label: root.title },
      position: { x: 60, y: 40 },
      style: { width: 110, height: 30, fontSize: 8, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }
    },
    ...(root.children || []).slice(0, 4).map((child, i) => ({
      id: child.id,
      type: "default",
      data: { label: child.title },
      position: { x: 180, y: 20 + i * 40 },
      style: { width: 110, height: 30, fontSize: 7, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }
    }))
  ];
  const edges = (root.children || []).slice(0, 4).map(child => ({
    id: `e-${root.id}-${child.id}`,
    source: root.id,
    target: child.id,
    animated: false,
    style: { stroke: "#0ea5e9", strokeWidth: 1 }
  }));

  return (
    <div style={{ width: 240, height: 100 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        elementsSelectable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        minZoom={1}
        maxZoom={1}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={0.5} />
      </ReactFlow>
    </div>
  );
} 