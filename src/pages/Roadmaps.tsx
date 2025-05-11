
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { FileUp, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RoadmapData } from "@/lib/gemini";

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState<{id: string, title: string, created_at: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('id, title, created_at')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setRoadmaps(data || []);
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  const handleViewRoadmap = (id: string) => {
    navigate(`/roadmap/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Roadmaps</h1>
          <Button onClick={() => navigate('/upload')}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload New PDF
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-44 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No roadmaps yet
            </h3>
            <p className="text-gray-500 mb-8">
              Upload a PDF to generate your first learning roadmap
            </p>
            <Button onClick={() => navigate('/upload')}>
              <FileUp className="mr-2 h-4 w-4" />
              Upload PDF
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap) => (
              <Card key={roadmap.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{roadmap.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Created on {new Date(roadmap.created_at).toLocaleDateString()}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => handleViewRoadmap(roadmap.id)}
                  >
                    View Roadmap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">What are Learning Roadmaps?</h3>
          <p className="text-gray-600 mb-4">
            Learning roadmaps are visual guides that help you navigate through complex subjects by breaking them down into manageable topics and showing the relationships between them.
          </p>
          <p className="text-gray-600">
            Upload your educational PDF documents to PathPDF and we'll automatically generate an interactive roadmap that helps you understand the structure and progression of the material.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Roadmaps;
