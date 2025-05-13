import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Star, StarOff, CheckCircle, Eye, EyeOff, Brain } from "lucide-react";

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
    resources?: {
      label: string;
      url: string;
      free: boolean;
      type: string;
      discount?: string;
    }[];
  };
  isExpanded: boolean;
  onExpandNode: (nodeId: string) => void;
  getBreadcrumbs?: (nodeId: string) => { id: string; title: string }[];
  onStatusChange?: () => void;
  focusMode?: boolean;
  setFocusMode?: (v: boolean) => void;
}

const NodeDetails = ({ node, isExpanded, onExpandNode, getBreadcrumbs, onStatusChange, focusMode, setFocusMode }: NodeDetailsProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [completed, setCompleted] = useState(() => {
    return localStorage.getItem(`node-complete-${node.id}`) === 'true';
  });
  const [inProgress, setInProgress] = useState(() => {
    return localStorage.getItem(`node-inprogress-${node.id}`) === 'true';
  });
  const [bookmarked, setBookmarked] = useState(() => {
    return localStorage.getItem(`node-bookmark-${node.id}`) === 'true';
  });

  const handleComplete = () => {
    localStorage.setItem(`node-complete-${node.id}`, String(!completed));
    setCompleted(!completed);
    if (!completed) {
      localStorage.setItem(`node-inprogress-${node.id}`, 'false');
      setInProgress(false);
    }
    if (onStatusChange) onStatusChange();
  };
  const handleInProgress = () => {
    localStorage.setItem(`node-inprogress-${node.id}`, String(!inProgress));
    setInProgress(!inProgress);
    if (!inProgress) {
      localStorage.setItem(`node-complete-${node.id}`, 'false');
      setCompleted(false);
    }
    if (onStatusChange) onStatusChange();
  };
  const handleBookmark = () => {
    localStorage.setItem(`node-bookmark-${node.id}`, String(!bookmarked));
    setBookmarked(!bookmarked);
  };

  // Breadcrumbs
  const breadcrumbs = getBreadcrumbs ? getBreadcrumbs(node.id) : [];

  if (!node) {
    return null;
  }

  return (
    <div className="w-90 border-l border-gray-200 bg-gray-50 p-4 overflow-auto">
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
        <h2 className="text-xl font-semibold flex-1">{node.title}</h2>
        <button onClick={handleBookmark} title={bookmarked ? "Remove bookmark" : "Bookmark"}>
          {bookmarked ? <Star className="h-5 w-5 text-yellow-400" /> : <StarOff className="h-5 w-5 text-gray-400" />}
        </button>
        <button onClick={handleInProgress} title={inProgress ? "Mark as not in progress" : "Mark as in progress"}>
          <svg className={`h-5 w-5 ${inProgress ? 'text-yellow-500' : 'text-gray-400'} ${inProgress ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" /><path className="opacity-75" d="M4 12a8 8 0 018-8v8z" /></svg>
        </button>
        <button onClick={handleComplete} title={completed ? "Mark as incomplete" : "Mark as complete"}>
          <CheckCircle className={`h-5 w-5 ${completed ? 'text-green-500' : 'text-gray-400'}`} />
        </button>
      </div>
      <p className="text-gray-600 mb-4">{node.description}</p>
      {/* Detailed Description Section */}
      {node.detailedDescription && (
        <details className="mb-4 group" open={node.detailedDescription.length < 300}>
          <summary className="font-semibold text-gray-800 cursor-pointer select-none mb-1 group-open:mb-2">More Details</summary>
          <div className="text-gray-700 text-sm whitespace-pre-line">{node.detailedDescription}</div>
        </details>
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
                    <span className={
                      r.type === 'article' ? 'bg-yellow-300 text-yellow-900' :
                      r.type === 'video' ? 'bg-purple-200 text-purple-900' :
                      'bg-gray-200 text-gray-800'
                    + ' px-2 py-0.5 rounded text-xs font-semibold border border-gray-300'}>
                      {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                    </span>
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
