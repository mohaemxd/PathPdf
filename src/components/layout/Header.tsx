import { User, Settings, BookOpen, LogOut, Sun, Moon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import PathpdfLogo from '../../Assets/Pathpdf-Logo1_1.svg';const themes = [
  { name: "Light", value: "light", icon: <Sun className="h-7 w-7" /> },
  { name: "Dark", value: "dark", icon: <Moon className="h-7 w-7" /> },
  { name: "System", value: "system", icon: <User className="h-7 w-7" /> },
];

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
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

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="border-b border-border bg-background dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={PathpdfLogo} alt="PathPDF Logo" style={{ width: 35, height: 35 }} />          
          <Link to="/" className="font-bold text-5xl text-foreground">
            PathPDF
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/roadmaps" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Roadmaps
            </Link>
          </nav>
          
          {!user ? (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button className="bg-pathpdf-600 hover:bg-pathpdf-700" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Account menu">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="rounded-full h-8 w-8 object-cover" />
                  ) : (
                    <div className="rounded-full bg-pathpdf-100 flex items-center justify-center h-8 w-8 text-pathpdf-600 font-bold text-lg">
                      {user.email[0].toUpperCase()}
                    </div>
                  )}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 min-w-[240px] z-50 border dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="rounded-full h-10 w-10 object-cover" />
                  ) : (
                    <div className="rounded-full bg-pathpdf-100 flex items-center justify-center h-10 w-10 text-pathpdf-600 font-bold text-lg">
                      {user.email[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold dark:text-white">{user.email}</div>
                  </div>
                </div>
                <DropdownMenu.Separator className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
                <DropdownMenu.Item asChild>
                  <Link to="/account" className="flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <Settings className="h-4 w-4" /> Account settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link to="/roadmaps" className="flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <BookOpen className="h-4 w-4" /> My Roadmaps
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  <HelpCircle className="h-4 w-4" /> Help
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex flex-col gap-1 px-2 py-2">
                  <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1"><Sun className="h-4 w-4" /> Theme:</span>
                  <div className="flex gap-2">
                    {themes.map(t => (
                      <button
                        key={t.value}
                        className={`text-xs px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === t.value ? 'bg-pathpdf-100 dark:bg-gray-800 font-bold' : ''}`}
                        onClick={() => setTheme(t.value)}
                        type="button"
                      >
                        {t.icon} {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                <DropdownMenu.Separator className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
                <DropdownMenu.Item className="flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-red-600" onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}>
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
