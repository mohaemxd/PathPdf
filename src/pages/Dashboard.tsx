import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileUp, BookOpen, User, BarChart2, Star, PlusCircle, FileText, ChevronDown, ChevronUp, Bell, Moon, LogOut, Settings } from "lucide-react";
import MiniRoadmapView from '@/components/roadmap/MiniRoadmapView';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRoadmaps, setUserRoadmaps] = useState<any[]>([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [pdfCount, setPdfCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [fullName, setFullName] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const userInfoRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

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
    const fetchFullName = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setFullName(data.full_name);
        }
      }
    };
    fetchFullName();
  }, [user]);

  useEffect(() => {
    const fetchUserRoadmaps = async () => {
      setLoadingRoadmaps(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('id, title, created_at, content, favorite')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setUserRoadmaps(data);
          setFavoriteCount(data.filter(rm => !!rm.favorite).length);
        }
      }
      setLoadingRoadmaps(false);
    };
    fetchUserRoadmaps();
  }, []);

  // Move fetchStats outside useEffect for reuse
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

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userInfoRef.current && !userInfoRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "system") {
      document.documentElement.classList.remove("dark");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    } else if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#fff' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-70 h-screen pb-2 border-r border-gray-200" style={{ backgroundColor: '#fafafa', paddingTop: '1.5rem' }}>
        <div>
          {/* Logo and App Name (like 'Slugy') */}
          <div className="flex items-center gap-3 mb-8 ml-4">
            <img src="/Pathpdf-Logo1_white_bg.svg" alt="PathPdf Logo" className="h-7 w-7" />
            <span className="font-medium text-xl text-black" style={{ fontFamily: 'DM Mono, monospace' }}>PATHPDF</span>
          </div>
          {/* Navigation */}
          <nav className="flex flex-col gap-2 ml-2">
            <Link to="/roadmaps" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 font-normal text-black">
              <BookOpen className="h-5 w-5 text-black" /> My Roadmaps
            </Link>
            <Link to="/account" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 font-normal text-black">
              <User className="h-5 w-5 text-black" /> Account
            </Link>
            <Link to="/account" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 font-normal text-black">
              <Settings className="h-5 w-5 text-black" /> Settings
            </Link>
          </nav>
        </div>
        {/* Usage Stats and User Info at the very bottom */}
        <div className="flex flex-col gap-2 mt-auto mb-0.5">
          <div className="mx-2 p-3 bg-white border border-gray-200 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 font-medium">Roadmaps</span>
              <span className="text-xs text-gray-600 font-medium">{roadmapCount} / 5</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-black rounded-full transition-all duration-300"
                style={{ width: `${Math.min((roadmapCount / 5) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-[8px] text-gray-400 mt-0.5 text-center">Upgrade to Pro for <span className="inline-block align-middle text-[10px]">&#8734;</span></div>
          </div>
          {/* User Info Section at the bottom */}
          <div className="relative" ref={userInfoRef}>
            <div
              className={
                "flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm mb-2 ml-2 mr-2 transition-colors cursor-pointer hover:bg-gray-100"
              }
              style={{ minHeight: '43px' }}
              onClick={() => setShowDropdown((v) => !v)}
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User Avatar"
                  className="h-9 w-9 rounded-full border object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-pathpdf-100 flex items-center justify-center text-pathpdf-600 font-bold text-lg border">
                  {user?.email ? user.email[0].toUpperCase() : '?'}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm text-gray-900 truncate">{user?.user_metadata?.full_name || "Mohamed Nacer"}</span>
                <span className="text-xs text-gray-500 truncate">{user?.email || "nacemohamed19@gmail.com"}</span>
              </div>
              <div className="flex flex-col items-center justify-center ml-auto">
                <ChevronUp className="w-4 h-4 text-gray-400" />
                <ChevronDown className="w-4 h-4 text-gray-400 -mt-1" />
              </div>
            </div>
            {showDropdown && (
              <div className="absolute left-full bottom-0 ml-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-2 animate-fade-in" style={{ backgroundColor: '#fafafa' }}>
                <div className="flex items-center gap-3 p-3 border-b">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="User Avatar"
                      className="h-10 w-10 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-pathpdf-100 flex items-center justify-center text-pathpdf-600 font-bold text-lg border">
                      {user?.email ? user.email[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-gray-900 truncate">{user?.user_metadata?.full_name || "Mohamed Nacer"}</span>
                    <span className="text-xs text-gray-500 truncate">{user?.email || "nacemohamed19@gmail.com"}</span>
                  </div>
                </div>
                <div className="flex flex-col py-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-black font-medium text-sm" onClick={() => {/* Upgrade to Pro action */}}>
                    <Star className="h-4 w-4" /> Upgrade to Pro
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-black font-medium text-sm" onClick={() => navigate('/account')}>
                    <User className="h-4 w-4" /> Account
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-black font-medium text-sm" onClick={() => {/* Notifications action */}}>
                    <Bell className="h-4 w-4" /> Notifications
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-black font-medium text-sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <Moon className="h-4 w-4" /> Dark Mode
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded hover:bg-red-50 text-red-600 font-medium text-sm mt-2" onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/login";
                  }}>
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        {/* Center Content */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Welcome/Empty State */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-8 flex flex-col items-center justify-center min-h-[220px] text-center" style={{ backgroundColor: '#fafafa' }}>
            <h2 className="text-4xl font-bold mb-2 text-black">
              {`How are we doing${fullName ? ", " + fullName : user?.email ? ", " + user.email : ""}!`}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Get started by uploading a PDF or exploring your learning roadmaps.</p>
            <div className="flex gap-3">
              <Button asChild className="bg-black hover:bg-gray-900">
                <Link to="/upload"><FileUp className="mr-2 h-5 w-5" />Upload PDF</Link>
              </Button>
              <Button asChild variant="outline" className="bg-black hover:bg-gray-900 text-white border-black hover:text-white">
                <Link to="/roadmaps"><BookOpen className="mr-2 h-5 w-5" />My Roadmaps</Link>
              </Button>
            </div>
          </div>

          {/* My Roadmaps (single real/placeholder card) */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6" style={{ backgroundColor: '#fafafa' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2"><BookOpen className="h-5 w-5" />Recent Roadmaps</h3>
              <Button asChild size="sm" variant="ghost" className="bg-black hover:bg-gray-900 text-white hover:text-white"><Link to="/roadmaps">View All</Link></Button>
            </div>
            {loadingRoadmaps ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : userRoadmaps.length === 0 ? (
              <div className="text-center text-gray-500">No roadmaps yet. Upload a PDF to get started!</div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {userRoadmaps.slice(0, 3).map((rm) => (
                  <div key={rm.id} className="min-w-[220px] bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex flex-col gap-2 shadow hover:shadow-xl transition-all duration-200 border border-gray-300">
                    <MiniRoadmapView roadmapData={rm.content} />
                    <div className="font-semibold text-black">{rm.title}</div>
                    <div className="text-xs text-gray-500">Created: {new Date(rm.created_at).toLocaleDateString()}</div>
                    <Button size="sm" variant="secondary" className="mt-2 bg-black hover:bg-gray-900 text-white border-black" onClick={() => {
                      navigate(`/roadmap/${rm.id}`);
                    }}>Open</Button>
                  </div>
                ))}
              </div>
            )}                                                                  
          </div>
        </section>

        {/* Right Sidebar: Quick Stats (placeholder) */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6" style={{ backgroundColor: '#fafafa' }}>
            <h4 className="font-semibold text-black mb-2 flex items-center gap-2"><BarChart2 className="h-4 w-4 text-black" />Quick Stats</h4>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between"><span>Active Roadmaps</span><span className="font-bold">{roadmapCount}</span></div>
              <div className="flex items-center justify-between"><span>Favorites</span><span className="font-bold">{favoriteCount}</span></div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
} 