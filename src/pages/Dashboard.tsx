import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileUp, LayoutDashboard, BookOpen, User, BarChart2, Star, PlusCircle } from "lucide-react";
import MiniRoadmapView from '@/components/roadmap/MiniRoadmapView';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRoadmaps, setUserRoadmaps] = useState<any[]>([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [pdfCount, setPdfCount] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
      } else {
        // Fetch user details
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData.user);
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    const fetchUserRoadmaps = async () => {
      setLoadingRoadmaps(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('id, title, created_at, content')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setUserRoadmaps(data);
        }
      }
      setLoadingRoadmaps(false);
    };
    fetchUserRoadmaps();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Roadmaps count
        const { count: roadmapCount } = await supabase
          .from('roadmaps')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setRoadmapCount(roadmapCount || 0);

        // PDFs count
        const { count: pdfCount } = await supabase
          .from('pdfs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setPdfCount(pdfCount || 0);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-pathpdf-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-6 gap-6">
        <div className="flex items-center gap-2 mb-8">
          <LayoutDashboard className="h-6 w-6 text-pathpdf-600" />
          <span className="font-bold text-xl text-pathpdf-700">Dashboard</span>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/roadmaps" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-pathpdf-100 dark:hover:bg-gray-800 font-medium text-pathpdf-700">
            <BookOpen className="h-5 w-5" /> My Roadmaps
          </Link>
          <Link to="/account" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-pathpdf-100 dark:hover:bg-gray-800 font-medium text-pathpdf-700">
            <User className="h-5 w-5" /> Account
          </Link>
        </nav>
        <div className="mt-auto">
          <Button className="w-full bg-pathpdf-600 hover:bg-pathpdf-700" asChild>
            <Link to="/upload">
              <FileUp className="mr-2 h-5 w-5" /> Upload New PDF
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        {/* Center Content */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Welcome/Empty State */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 flex flex-col items-center justify-center min-h-[220px] text-center">
            <h2 className="text-2xl font-bold mb-2 text-pathpdf-700">Welcome to PathPDF!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Get started by uploading a PDF or exploring your learning roadmaps.</p>
            <div className="flex gap-3">
              <Button asChild className="bg-pathpdf-600 hover:bg-pathpdf-700">
                <Link to="/upload"><FileUp className="mr-2 h-5 w-5" />Upload PDF</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/roadmaps"><BookOpen className="mr-2 h-5 w-5" />My Roadmaps</Link>
              </Button>
            </div>
          </div>

          {/* My Roadmaps (single real/placeholder card) */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-pathpdf-700 flex items-center gap-2"><BookOpen className="h-5 w-5" />Recent Roadmaps</h3>
              <Button asChild size="sm" variant="ghost"><Link to="/roadmaps">View All</Link></Button>
            </div>
            {loadingRoadmaps ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : userRoadmaps.length === 0 ? (
              <div className="text-center text-gray-500">No roadmaps yet. Upload a PDF to get started!</div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {userRoadmaps.slice(0, 3).map((rm) => (
                  <div key={rm.id} className="min-w-[220px] bg-pathpdf-100 dark:bg-gray-900 rounded-lg p-4 flex flex-col gap-2 shadow hover:shadow-lg transition">
                    <MiniRoadmapView roadmapData={rm.content} />
                    <div className="font-semibold text-pathpdf-700">{rm.title}</div>
                    <div className="text-xs text-gray-500">Created: {new Date(rm.created_at).toLocaleDateString()}</div>
                    <Button size="sm" variant="secondary" className="mt-2" onClick={() => {
                      localStorage.setItem('currentRoadmap', JSON.stringify(rm.content));
                      window.location.href = '/demo';
                    }}>Open</Button>
                  </div>
                ))}
              </div>
            )}                                                                  
          </div>

          {/* PDF Library (placeholder grid) */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-pathpdf-700 flex items-center gap-2"><FileUp className="h-5 w-5" />My Roadmaps</h3>
              <Button asChild size="sm" variant="ghost"><Link to="/upload">Upload New</Link></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userRoadmaps.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No PDFs uploaded yet.</div>
              ) : (
                userRoadmaps.map((rm) => (
                  <div key={rm.id} className="bg-pathpdf-100 dark:bg-gray-900 rounded-lg p-4 flex flex-col gap-2 shadow hover:shadow-lg transition">
                    <MiniRoadmapView roadmapData={rm.content} />
                    <div className="font-semibold text-pathpdf-700">{rm.title}</div>
                    <div className="text-xs text-gray-500">Uploaded: {new Date(rm.created_at).toLocaleDateString()}</div>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                      localStorage.setItem('currentRoadmap', JSON.stringify(rm.content));
                      window.location.href = '/demo';
                    }}>Open</Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Sidebar: Quick Stats (placeholder) */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
            <h4 className="font-semibold text-pathpdf-700 mb-2 flex items-center gap-2"><BarChart2 className="h-4 w-4" />Quick Stats</h4>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between"><span>Active Roadmaps</span><span className="font-bold">{roadmapCount}</span></div>
              <div className="flex items-center justify-between"><span>PDFs Uploaded</span><span className="font-bold">{pdfCount}</span></div>
              <div className="flex items-center justify-between"><span>Completion</span><span className="font-bold">0%</span></div>
              <div className="flex items-center justify-between"><span>Favorites</span><span className="font-bold">0</span></div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
} 