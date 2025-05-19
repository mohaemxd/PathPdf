import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import RoadmapView from '@/components/roadmap/RoadmapView';
import { Button } from '@/components/ui/button';
import { Bookmark, ChevronDown, ArrowLeft } from 'lucide-react';
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
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchRoadmapAndProgress = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('roadmaps')
        .select('content, title')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Roadmap not found.');
        setLoading(false);
        return;
      }
      setRoadmapData(data);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (userId) {
        const { data: progress } = await supabase
          .from('roadmap_progress')
          .select('completed_node_ids')
          .eq('user_id', userId)
          .eq('roadmap_id', id)
          .single();
        if (progress && Array.isArray(progress.completed_node_ids)) {
          setCompletedNodeIds(progress.completed_node_ids);
        } else {
          setCompletedNodeIds([]);
        }
      }
      setLoading(false);
    };
    if (id) fetchRoadmapAndProgress();
  }, [id]);

  const handleToggleNodeComplete = async (nodeId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId || !id) return;
    let updatedCompleted: string[];
    if (completedNodeIds.includes(nodeId)) {
      updatedCompleted = completedNodeIds.filter(nid => nid !== nodeId);
    } else {
      updatedCompleted = [...completedNodeIds, nodeId];
    }
    setCompletedNodeIds(updatedCompleted);
    const { error } = await supabase.from('roadmap_progress').upsert(
      {
        user_id: userId,
        roadmap_id: id,
        completed_node_ids: updatedCompleted,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,roadmap_id' }
    );
    if (error) {
      console.error('Error updating progress:', error);
      // Revert the local state if the update failed
      setCompletedNodeIds(completedNodeIds);
    }
  };

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

  // Helper to count all nodes in the roadmap
  function countAllNodes(node: any): number {
    if (!node) return 0;
    let count = 1;
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        count += countAllNodes(child);
      }
    }
    return count;
  }

  const totalNodes = roadmapData ? countAllNodes(roadmapData.content.rootNode) : 0;
  const completedCount = completedNodeIds.length;
  const progressPercent = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

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
        <div className="py-2 px-4 sm:px-6 lg:px-10 border-b border-black" style={{ backgroundColor: '#fafafa' }}>
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-full bg-white border border-gray-200 p-2 hover:bg-gray-100 transition-colors duration-200 shadow-sm mr-4"
                title="Back to Dashboard"
                style={{ marginRight: 24 }}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-4">
                {roadmapData.title || 'Roadmap'}
                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-black rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{progressPercent}%</span>
                </div>
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
          <RoadmapView
            roadmapData={roadmapData.content}
            selectedNodeId={selectedNodeId || undefined}
            onBookmarkChange={loadBookmarkedNodes}
            completedNodeIds={completedNodeIds}
            onToggleNodeComplete={handleToggleNodeComplete}
          />
        </div>
      </main>
    </div>
  );
} 