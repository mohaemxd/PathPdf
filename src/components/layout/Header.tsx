import { User, Settings, BookOpen, LogOut, Sun, Moon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import PathpdfLogo from '../../Assets/Pathpdf-Logo1_1.svg';

const themes = [
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
    <header className="border-b border-border bg-background dark:bg-gray-900 dark:border-gray-800 fixed top-0 left-0 z-20 w-full">
      <div className="relative flex h-14 items-center justify-center w-full px-8">
        <div className="absolute left-32 flex items-center justify-center gap-1">
          <img src={PathpdfLogo} alt="PathPDF Logo" style={{ width: 40, height: 40 }} />
          <Link to="/" className="font-medium text-4xl text-foreground tracking-tight" style={{ fontFamily: 'DM Mono, monospace' }}>PATHPDF</Link>
        </div>
        <nav className="hidden absolute md:flex items-center gap-10 left-1/2 -translate-x-1/2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 focus:outline-none">
                Features
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="max-w-[420px] flex bg-white rounded-lg p-0 mt-5 shadow-md border border-gray-200"
                sideOffset={10}
              >
                {/* Left column: All Features card */}
                <div className="flex flex-col justify-center items-start w-1/2 bg-gradient-to-br from-gray-50 to-white rounded-l-md p-6 border-r border-gray-100 min-h-[170px]">
                  <div className="font-semibold text-lg text-black mb-1">All Features</div>
                  <div className="text-sm text-gray-500">Convert PDFs and Notion pages into interactive roadmaps, and more.</div>
                </div>
                {/* Right column: Feature list */}
                <div className="flex flex-col w-1/2 divide-y divide-gray-100">
                  <DropdownMenu.Item className="flex items-start gap-3 px-4 py-3 hover:bg-gray-100 rounded-none cursor-pointer group">
                    <span className="mt-1 text-gray-500"><svg width='18' height='18' fill='none' stroke='currentColor' strokeWidth='1.5' viewBox='0 0 24 24'><rect x='3' y='4' width='18' height='16' rx='2'/><path d='M7 8h10M7 12h10M7 16h6'/></svg></span>
                    <div>
                      <div className="font-medium text-black">PDF to Roadmap</div>
                      <div className="text-xs text-gray-500">Instantly turn PDF content into structured, interactive roadmaps.</div>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex items-start gap-3 px-4 py-3 hover:bg-gray-100 rounded-none cursor-pointer group">
                    <span className="mt-1 text-gray-500"><svg width='18' height='18' fill='none' stroke='currentColor' strokeWidth='1.5' viewBox='0 0 24 24'><rect x='3' y='4' width='18' height='16' rx='2'/><path d='M8 8h8M8 12h8M8 16h4'/></svg></span>
                    <div>
                      <div className="font-medium text-black">Notion to Roadmap</div>
                      <div className="text-xs text-gray-500">Convert Notion pages into visual, actionable roadmaps.</div>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex items-start gap-3 px-4 py-3 hover:bg-gray-100 rounded-none cursor-pointer group">
                    <span className="mt-1 text-gray-500"><svg width='18' height='18' fill='none' stroke='currentColor' strokeWidth='1.5' viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='2'/><path d='M8 8h8M8 12h8M8 16h4'/></svg></span>
                    <div>
                      <div className="font-medium text-black">Roadmap Editor</div>
                      <div className="text-xs text-gray-500">Customize, edit, and organize your generated roadmaps.</div>
                    </div>
                  </DropdownMenu.Item>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Link to="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </nav>
        <div className="absolute right-32 top-1/2 -translate-y-1/2 flex items-center gap-0">
          <Button variant="outline" asChild>
            <Link to="/login">Sign in
              <span className="ml-2 inline-block align-middle">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
