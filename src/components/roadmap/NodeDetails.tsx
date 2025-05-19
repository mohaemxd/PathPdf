import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Bookmark, CheckCircle, Eye, EyeOff, Brain } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface NodeDetailsProps {
  node: {
    id: string;
    title: string;
    description: string;
    hasChildren: boolean;
    original?: string;
    difficulty?: string;
    estimatedStudyTime?: string;
    parentId?: string;
    detailedDescription?: string;
    codeExample?: string;
    image?: {
      url: string;
      alt: string;
      caption?: string;
    };
    resources?: {
      label: string;
      url: string;
      free: boolean;
      type: string;
      discount?: string;
    }[];
    completed?: boolean;
  };
  isExpanded: boolean;
  onExpandNode: (nodeId: string) => void;
  getBreadcrumbs?: (nodeId: string) => { id: string; title: string }[];
  onStatusChange?: () => void;
  focusMode?: boolean;
  setFocusMode?: (v: boolean) => void;
  onBookmarkChange?: () => void;
  onToggleNodeComplete?: (nodeId: string) => void;
}

const NodeDetails = ({ node, isExpanded, onExpandNode, getBreadcrumbs, onStatusChange, focusMode, setFocusMode, onBookmarkChange, onToggleNodeComplete }: NodeDetailsProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [inProgress, setInProgress] = useState(() => {
    return localStorage.getItem(`node-inprogress-${node.id}`) === 'true';
  });
  const [bookmarked, setBookmarked] = useState(() => {
    return localStorage.getItem(`node-bookmark-${node.id}`) === 'true';
  });

  const handleComplete = () => {
    if (onToggleNodeComplete) {
      onToggleNodeComplete(node.id);
    }
    if (onStatusChange) onStatusChange();
  };
  const handleInProgress = () => {
    localStorage.setItem(`node-inprogress-${node.id}`, String(!inProgress));
    setInProgress(!inProgress);
    if (onStatusChange) onStatusChange();
  };
  const handleBookmark = async () => {
    try {
      // Get the current roadmap ID from the URL
      const roadmapId = window.location.pathname.split('/').pop();
      if (!roadmapId) return;

      // Get current favorites for this roadmap
      const { data: currentFavorites } = await supabase
        .from('roadmap_favorites')
        .select('favorite_node_ids')
        .eq('roadmap_id', roadmapId)
        .single();

      let newFavoriteNodeIds: string[] = [];
      
      if (currentFavorites) {
        // If we have existing favorites, update them
        newFavoriteNodeIds = currentFavorites.favorite_node_ids || [];
        if (!bookmarked) {
          // Add the node ID if it's not already in the array
          if (!newFavoriteNodeIds.includes(node.id)) {
            newFavoriteNodeIds.push(node.id);
          }
        } else {
          // Remove the node ID if it exists
          newFavoriteNodeIds = newFavoriteNodeIds.filter(id => id !== node.id);
        }

        // Update the favorites
        await supabase
          .from('roadmap_favorites')
          .update({ favorite_node_ids: newFavoriteNodeIds })
          .eq('roadmap_id', roadmapId);
      } else {
        // If no favorites exist yet, create a new entry
        if (!bookmarked) {
          newFavoriteNodeIds = [node.id];
          await supabase
            .from('roadmap_favorites')
            .insert({
              roadmap_id: roadmapId,
              favorite_node_ids: newFavoriteNodeIds
            });
        }
      }

      // Update local state
      const newBookmarkedState = !bookmarked;
      localStorage.setItem(`node-bookmark-${node.id}`, String(newBookmarkedState));
      setBookmarked(newBookmarkedState);

      // Force a refresh of the nodes to update the UI
      if (onStatusChange) onStatusChange();
      if (onBookmarkChange) onBookmarkChange();
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  // Breadcrumbs
  const breadcrumbs = getBreadcrumbs ? getBreadcrumbs(node.id) : [];

  if (!node) {
    return null;
  }

  return (
    <div className="w-90 border-l-2 border-black bg-gray-50 p-4 overflow-auto h-full min-h-screen">
      {/* Focus Mode Button */}
      {typeof focusMode === 'boolean' && typeof setFocusMode === 'function' && (
        <div className="mb-3 flex justify-end">
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition border ${focusMode ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900'}`}
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? 'Exit Focus Mode' : 'Focus on this node'}
          >
            <Brain className={`h-4 w-4 ${focusMode ? 'text-yellow-300' : 'text-indigo-500'}`} />
            {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
          </button>
        </div>
      )}
      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <nav className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1">
          {breadcrumbs.map((b, i) => (
            <span key={b.id}>
              {i > 0 && <span className="mx-1">/</span>}
              {b.title}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-semibold mb-3 flex-1">{node.title}</h2>
        <button onClick={handleBookmark} title={bookmarked ? "Remove bookmark" : "Bookmark"}>
          <Bookmark className={`h-5 w-5 ${bookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <button onClick={handleInProgress} title={inProgress ? "Mark as not in progress" : "Mark as in progress"}>
          <svg className={`h-5 w-5 ${inProgress ? 'text-yellow-500' : 'text-gray-400'} ${inProgress ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" /><path className="opacity-75" d="M4 12a8 8 0 018-8v8z" /></svg>
        </button>
        <button onClick={handleComplete} title={node.completed ? "Mark as incomplete" : "Mark as complete"}>
          <CheckCircle className={`h-5 w-5 ${node.completed ? 'text-green-500' : 'text-gray-400'}`} />
        </button>
      </div>
      {node.detailedDescription ? (
        <div className="text-gray-700 text-base whitespace-pre-line mb-4">{node.detailedDescription}</div>
      ) : (
        <div className="text-gray-500 italic mb-4">No detailed information available for this topic.</div>
      )}
      
      {/* Visual Resource */}
      {node.image && (
        <div className="mb-4">
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={node.image.url} 
              alt={node.image.alt}
              className="w-full h-auto object-cover"
            />
            {node.image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                {node.image.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Example Code Snippet */}
      {node.codeExample && (
        <div className="mb-4">
          <div className="font-semibold text-gray-800 mb-1">Example Code</div>
          <pre className="bg-gray-900 text-green-200 rounded p-3 text-xs overflow-x-auto"><code>{node.codeExample}</code></pre>
        </div>
      )}
      {/* Difficulty/Time */}
      {(node.difficulty || node.estimatedStudyTime) && (
        <div className="mb-4 flex gap-4 text-xs text-gray-500">
          {node.difficulty && <span>Difficulty: <span className="font-semibold text-gray-700">{node.difficulty}</span></span>}
          {node.estimatedStudyTime && <span>Est. Time: <span className="font-semibold text-gray-700">{node.estimatedStudyTime}</span></span>}
        </div>
      )}
      {/* Show original text toggle */}
      {node.original && (
        <Button variant="ghost" size="sm" className="mb-2" onClick={() => setShowOriginal(v => !v)}>
          {showOriginal ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          {showOriginal ? 'Hide' : 'Show'} Original Text
        </Button>
      )}
      {showOriginal && node.original && (
        <div className="bg-white border rounded p-2 mb-2 text-xs text-gray-700 whitespace-pre-line">
          {node.original}
        </div>
      )}
      {node.hasChildren && (
        <Button 
          variant="outline"
          onClick={() => onExpandNode(node.id)} 
          className="mb-4 w-full"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Collapse Children
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Expand Children
            </>
          )}
        </Button>
      )}
      {/* Learning Resources Section - Modern UI */}
      {Array.isArray(node.resources) && node.resources.length > 0 ? (
        <div className="mt-6">
          {/* Free Resources */}
          {node.resources.some(r => r.free) && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 border border-green-400 rounded mr-2">
                  <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Free Resources
                </span>
                <div className="flex-1 border-t border-green-400 ml-2" />
              </div>
          <ul className="space-y-2">
                {node.resources.filter(r => r.free).map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {r.type === 'video' ? (
                      <span className="inline-flex justify-center items-center w-6 h-6 rounded text-xs font-semibold border border-gray-300">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <rect width="24" height="24" rx="4" fill="#fff"/>
                          <path d="M21.8 7.2a2.8 2.8 0 0 0-2-2C18 5 12 5 12 5s-6 0-7.8.2a2.8 2.8 0 0 0-2 2A29.9 29.9 0 0 0 2 12a29.9 29.9 0 0 0 .2 4.8 a 2.8 2.8 0 0 0 2 2C6 19 12 19 12 19s6 0 7.8-.2a 2.8 2.8 0 0 0 2-2A 29.9 29.9 0 0 0 22 12 a 29.9 29.9 0 0 0-.2-4.8zM 10 15V 9l 6 3-6 3z" fill="#FF0000"/>
                        </svg>
                      </span>
                    ) : r.type === 'article' ? (
                      <span className="inline-flex justify-center items-center w-6 h-6 rounded text-xs font-semibold border border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                          <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                          <path d="M10 9H8"/>
                          <path d="M16 13H8"/>
                          <path d="M16 17H8"/>
                        </svg>
                      </span>
                    ) : (
                      <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs font-semibold border border-gray-300">
                        {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                      </span>
                    )}
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-bold underline text-pathpdf-700 hover:text-pathpdf-900">
                      {r.label}
                    </a>
            </li>
                ))}
              </ul>
            </div>
          )}
          {/* Premium Resources */}
          {node.resources.some(r => !r.free) && (
            <div className="mb-2">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 border border-purple-400 rounded mr-2">
                  <svg className="w-3 h-3 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  Premium Resources
                </span>
                <div className="flex-1 border-t border-purple-400 ml-2" />
              </div>
              <ul className="space-y-2">
                {node.resources.filter(r => !r.free).map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={
                      r.type === 'course' ? 'bg-yellow-200 text-yellow-900' :
                      'bg-gray-200 text-gray-800'
                    + ' px-2 py-0.5 rounded text-xs font-semibold border border-gray-300'}>
                      {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                    </span>
                    {r.discount && (
                      <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-semibold border border-green-400">{r.discount}</span>
                    )}
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-bold underline text-pathpdf-700 hover:text-pathpdf-900">
                      {r.label}
                    </a>
            </li>
                ))}
          </ul>
              {/* Note on Premium Resources */}
              <div className="mt-4 bg-gray-100 border border-gray-300 rounded p-3 text-xs text-gray-700">
                <strong>Note on Premium Resources</strong><br />
                These are optional paid resources vetted by the roadmap team.<br />
                If you purchase a resource, we may receive a small commission at no extra cost to you. This helps us offset the costs of running this site and keep it free for everyone.
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 text-sm text-gray-500 italic">No resources available for this topic yet.</div>
      )}
    </div>
  );
};

export default NodeDetails;
