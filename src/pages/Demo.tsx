
import { useState } from "react";
import Header from "@/components/layout/Header";
import RoadmapView from "@/components/roadmap/RoadmapView";
import { sampleRoadmap } from "@/data/sampleRoadmap";

const Demo = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1">
        <div style={{ height: 'calc(100vh - 64px)' }}>
          <RoadmapView roadmapData={sampleRoadmap} />
        </div>
      </div>
    </div>
  );
};

export default Demo;
