import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, ArrowRight, Trash2, Pencil, Search, Calendar, ArrowUpDown, Star, StarOff, Star as StarFilled } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RoadmapData } from "@/lib/gemini";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOrder = 'newest' | 'oldest' | 'title-asc' | 'title-desc';
type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState<{id: string, title: string, created_at: string, favorite: boolean}[]>([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<{id: string, title: string, created_at: string, favorite: boolean}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roadmapToEdit, setRoadmapToEdit] = useState<{id: string, title: string} | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('id, title, created_at, favorite')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setRoadmaps((data || []).map(rm => ({
          ...rm,
          favorite: !!rm.favorite
        })));
        setFilteredRoadmaps((data || []).map(rm => ({
          ...rm,
          favorite: !!rm.favorite
        })));
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  // Filter and sort roadmaps whenever search, sort, or date filter changes
  useEffect(() => {
    let filtered = [...roadmaps];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(rm => 
        rm.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply date filter
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(rm => {
          const created = new Date(rm.created_at);
          return created.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(rm => new Date(rm.created_at) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(rm => new Date(rm.created_at) >= monthAgo);
        break;
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        filtered = filtered.filter(rm => new Date(rm.created_at) >= yearAgo);
        break;
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(rm => rm.favorite);
    }

    // Apply sorting
    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    setFilteredRoadmaps(filtered);
  }, [roadmaps, searchQuery, sortOrder, dateFilter, showFavoritesOnly]);

  const handleViewRoadmap = (id: string) => {
    navigate(`/roadmap/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setRoadmapToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roadmapToDelete) return;

    try {
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmapToDelete);

      if (error) throw error;

      // Update local state to remove the deleted roadmap
      setRoadmaps(prev => prev.filter(rm => rm.id !== roadmapToDelete));
    } catch (error) {
      console.error("Error deleting roadmap:", error);
    } finally {
      setDeleteDialogOpen(false);
      setRoadmapToDelete(null);
    }
  };

  const handleEditClick = (roadmap: {id: string, title: string}) => {
    setRoadmapToEdit(roadmap);
    setNewTitle(roadmap.title);
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!roadmapToEdit || !newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('roadmaps')
        .update({ title: newTitle.trim() })
        .eq('id', roadmapToEdit.id);

      if (error) throw error;

      // Update local state
      setRoadmaps(prev => prev.map(rm => 
        rm.id === roadmapToEdit.id ? { ...rm, title: newTitle.trim() } : rm
      ));
    } catch (error) {
      console.error("Error updating roadmap:", error);
    } finally {
      setEditDialogOpen(false);
      setRoadmapToEdit(null);
      setNewTitle("");
    }
  };

  const handleToggleFavorite = async (id, currentFavorite) => {
    const { error } = await supabase
      .from('roadmaps')
      .update({ favorite: !currentFavorite })
      .eq('id', id);
    if (!error) {
      setRoadmaps(prev => prev.map(rm =>
        rm.id === id ? { ...rm, favorite: !currentFavorite } : rm
      ));
      setFilteredRoadmaps(prev => prev.map(rm =>
        rm.id === id ? { ...rm, favorite: !currentFavorite } : rm
      ));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white relative">
      <div className="absolute top-6 left-6 z-20">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')} className="">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Button>
      </div>
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Roadmaps</h1>
          <Button onClick={() => navigate('/upload')}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload New PDF
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search roadmaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
            <SelectTrigger>
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
            <SelectTrigger>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center justify-end">
            <Button
              variant={showFavoritesOnly ? "secondary" : "outline"}
              onClick={() => setShowFavoritesOnly(v => !v)}
              className="flex items-center gap-2"
            >
              <StarFilled className={showFavoritesOnly ? "text-yellow-400" : "text-gray-400"} />
              {showFavoritesOnly ? "Showing Favorites" : "Show Only Favorites"}
            </Button>
          </div>
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
        ) : filteredRoadmaps.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {roadmaps.length === 0 ? "No roadmaps yet" : "No matching roadmaps"}
            </h3>
            <p className="text-gray-500 mb-8">
              {roadmaps.length === 0 
                ? "Upload a PDF to generate your first learning roadmap"
                : "Try adjusting your search or filters"}
            </p>
            {roadmaps.length === 0 && (
              <Button onClick={() => navigate('/upload')}>
                <FileUp className="mr-2 h-4 w-4" />
                Upload PDF
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoadmaps.map((roadmap) => (
              <Card key={roadmap.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{roadmap.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Created on {new Date(roadmap.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleViewRoadmap(roadmap.id)}
                    >
                      View Roadmap
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(roadmap)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleFavorite(roadmap.id, roadmap.favorite)}
                      title={roadmap.favorite ? "Unfavorite" : "Favorite"}
                    >
                      {roadmap.favorite ? (
                        <Star className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(roadmap.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the roadmap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Roadmap Title</DialogTitle>
            <DialogDescription>
              Enter a new title for your roadmap.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter roadmap title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditConfirm}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roadmaps;
