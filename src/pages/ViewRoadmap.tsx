import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import RoadmapView from '@/components/roadmap/RoadmapView';
import { Button } from '@/components/ui/button';
import { Bookmark, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ViewRoadmap() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState<{ content: any; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedNodes, setBookmarkedNodes] = useState<{id: string, title: string}[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('roadmaps')
        .select('content, title')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Roadmap not found.');
      } else {
        setRoadmapData(data);
      }
      setLoading(false);
    };
    if (id) fetchRoadmap();
  }, [id]);

  // Load bookmarked nodes
  const loadBookmarkedNodes = async () => {
    try {
      const { data: favorites } = await supabase
        .from('roadmap_favorites')
        .select('favorite_node_ids')
        .eq('roadmap_id', id)
        .single();

      if (favorites?.favorite_node_ids) {
        // Get node titles from the roadmap data
        const bookmarkedNodes = favorites.favorite_node_ids.map((nodeId: string) => {
          const findNode = (node: any): {id: string, title: string} | null => {
            if (node.id === nodeId) return { id: node.id, title: node.title };
            if (node.children) {
              for (const child of node.children) {
                const found = findNode(child);
                if (found) return found;
              }
            }
            return null;
          };
          return findNode(roadmapData?.content.rootNode);
        }).filter(Boolean);
        setBookmarkedNodes(bookmarkedNodes);
      } else {
        setBookmarkedNodes([]);
      }
    } catch (error) {
      console.error('Error loading bookmarked nodes:', error);
    }
  };

  useEffect(() => {
    if (id && roadmapData) {
      loadBookmarkedNodes();
    }
  }, [id, roadmapData]);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center h-full text-gray-500">Loading roadmap...</div>;
  }
  if (error) {
    return <div className="flex flex-1 flex-col items-center justify-center h-full text-gray-500">
      <div className="mb-4">{error}</div>
      <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
    </div>;
  }
  if (!roadmapData) {
    return <div className="flex flex-1 items-center justify-center h-full text-gray-500">No roadmap data.</div>;
  }
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-1 flex flex-col">
        <div className="bg-gradient-to-b from-white to-pathpdf-50 dark:from-gray-900 dark:to-gray-800 py-2 px-4 sm:px-6 lg:px-10 border-b border-black">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {roadmapData.title || 'Roadmap'}
              </h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {bookmarkedNodes.length > 0 ? (
                    bookmarkedNodes.map((node) => (
                      <DropdownMenuItem
                        key={node.id}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          // Scroll to the node
                          const element = document.getElementById(node.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                      >
                        {node.title}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No bookmarks yet</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="w-full grow min-h-[400px]" style={{ height: 'calc(100vh - 64px - 96px)' }}>
          <RoadmapView roadmapData={roadmapData.content} selectedNodeId={selectedNodeId || undefined} onBookmarkChange={loadBookmarkedNodes} />
        </div>
      </main>
    </div>
  );
} 