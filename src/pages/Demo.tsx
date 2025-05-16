import { useState, useEffect } from "react";
import RoadmapView from "@/components/roadmap/RoadmapView";
import { sampleRoadmap } from "@/data/sampleRoadmap";
import { Button } from "@/components/ui/button";
import { FileUp, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  // Always use the sample roadmap for the demo page
  const roadmap = sampleRoadmap;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-1 flex flex-col">
        {/* Demo Header */}
        <div className="bg-gradient-to-b from-white to-pathpdf-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Interactive Learning Roadmap Demo
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore this sample roadmap to see how PathPDF transforms educational content.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link to="/upload">
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload Your PDF
                  </Link>
                </Button>
                <Button className="bg-pathpdf-600 hover:bg-pathpdf-700" asChild>
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap View */}
        <div className="w-full h-[60vh] min-h-[400px] border-2 border-dashed border-blue-400">
          <RoadmapView roadmapData={roadmap} />
        </div>
      </main>
    </div>
  );
};

export default Demo;
