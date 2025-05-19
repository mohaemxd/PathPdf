import { FileUp, BookOpen, Route, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import PathpdfLogo from '../Assets/Pathpdf-Logo1_1.svg';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const themes = [
  { name: "Light", value: "light", icon: <Sun className="h-7 w-7" /> },
  { name: "Dark", value: "light", icon: <Sun className="h-7 w-7" /> },
  { name: "System", value: "light", icon: <Sun className="h-7 w-7" /> },
];

const Index = () => { 
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative pt-24 pb-32">
        {/* Headline */}
        <h1 className="text-3xl md:text-6xl font-normal text-center mb-4 leading-tight" style={{ fontFamily: 'Prompt, sans-serif', fontWeight: 400 }}>
          Navigate Knowledge, <br className='hidden md:block'/>Not Just Pages
        </h1>
        {/* Subheading */}
        <p className="mt-2 text-base md:text-lg text-center text-gray-700 dark:text-gray-200 max-w-2xl mx-auto mb-8">
          PathPDF instantly converts your PDFs and Notion pages into interactive, visual learning roadmaps. Fast, accurate, and easy to use.
        </p>
        {/* Get Started Button */}
        <div className="flex justify-center mb-8">
          <Button size="lg" className="bg-white text-black hover:bg-gray-100 border border-gray-300 px-8 py-5 rounded-lg font-bold shadow transition-all duration-300 flex items-center gap-2" asChild>
            <Link to="/upload">
              Get Started
              <span className="inline-block align-middle">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </Link>
          </Button>
        </div>
        {/* Gradient Swoosh Background */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[220px] pointer-events-none z-0" aria-hidden="true">
          <div className="w-full h-full rounded-full blur-3xl opacity-60 bg-gradient-to-tr from-blue-200 via-gray-100 to-blue-400"></div>
        </div>
        {/* App Screenshot/Card Placeholder */}
        <div className="relative z-10 mt-12 w-full flex justify-center">
          {/* Gradient Glow Behind Screenshot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[260px] pointer-events-none z-0" aria-hidden="true">
            <div className="w-full h-full rounded-full blur-3xl opacity-70 bg-gradient-to-tr from-blue-200 via-purple-100 to-pink-200"></div>
          </div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 max-w-6xl w-full flex items-center justify-center min-h-[320px] z-10"
            style={{ backgroundImage: 'url(public/gradii-1920x1080.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="p-[3px] rounded-2xl bg-gradient-to-tr from-blue-200 via-gray-200 to-blue-500 opacity-80">
              <div className="relative w-full">
                <img src="/dashboard-screenshot.png" alt="App Screenshot" className="rounded-xl shadow-lg w-full h-auto object-contain bg-white/90" style={{maxHeight: 440}} />
                {/* Right fade overlay */}
                <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 rounded-xl"
                  style={{
                    background: 'linear-gradient(to right, transparent 60%, #fff 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Features Section */}
      <section className="relative py-24 px-4 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Elevate your learning</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
            Discover how PathPDF transforms your documents into actionable, interactive roadmaps and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div className="relative rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-start text-left overflow-hidden bg-[#fafafa] h-[28rem]">
              <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-70 rounded-full blur-2xl opacity-40 bg-gradient-to-tr from-blue-200 via-gray-100 to-blue-400"></div>
              <div className="p-[3px] rounded-xl bg-gradient-to-tr from-gray-200 via-white to-white mb-2 w-full h-[80%] flex items-center justify-center">
                <div className="bg-[#fafafa] rounded-lg w-full h-full flex items-center justify-center">
                  <img src="/feature1.png" alt="PDF to Roadmap" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">PDF to Roadmap</h3>
              <p className="text-gray-600 dark:text-gray-300">Turn any PDF into a structured, interactive learning roadmap in seconds.</p>
            </div>
            {/* Feature 2 */}
            <div className="relative rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-start text-left overflow-hidden bg-[#fafafa] h-[28rem]">
              <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 rounded-full blur-2xl opacity-40 bg-gradient-to-tr from-pink-200 via-gray-100 to-yellow-200"></div>
              <div className="p-[3px] rounded-xl bg-gradient-to-tr from-gray-200 via-white to-white mb-2 w-full h-[80%] flex items-center justify-center">
                <div className="bg-[#fafafa] rounded-lg w-full h-full flex items-center justify-center">
                  <img src="/feature-notion-roadmap.png" alt="Notion to Roadmap" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Notion to Roadmap</h3>
              <p className="text-gray-600 dark:text-gray-300">Convert Notion pages into visual, actionable roadmaps for your projects or studies.</p>
            </div>
            {/* Feature 3 */}
            <div className="relative rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-start text-left overflow-hidden bg-[#fafafa] h-[28rem]">
              <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 rounded-full blur-2xl opacity-40 bg-gradient-to-tr from-green-200 via-gray-100 to-blue-200"></div>
              <div className="p-[3px] rounded-xl bg-gradient-to-tr from-gray-200 via-white to-white mb-2 w-full h-[80%] flex items-center justify-center">
                <div className="bg-[#fafafa] rounded-lg w-full h-full flex items-center justify-center">
                  <img src="/feature-editor.png" alt="Roadmap Editor" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Roadmap Editor</h3>
              <p className="text-gray-600 dark:text-gray-300">Easily customize, edit, and organize your generated roadmaps to fit your needs.</p>
            </div>
            {/* Feature 4 */}
            <div className="relative rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-start text-left overflow-hidden bg-[#fafafa] h-[28rem]">
              <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 rounded-full blur-2xl opacity-40 bg-gradient-to-tr from-yellow-200 via-gray-100 to-pink-200"></div>
              <div className="p-[3px] rounded-xl bg-gradient-to-tr from-gray-200 via-white to-white mb-2 w-full h-[80%] flex items-center justify-center">
                <div className="bg-[#fafafa] rounded-lg w-full h-full flex items-center justify-center">
                  <img src="/feature-progress.png" alt="Progress Tracking" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">Track your learning journey and see your progress as you complete roadmap steps.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="relative py-24 px-4 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Pricing</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">Choose the plan that fits your needs.</p>
          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${billingPeriod === 'monthly' ? 'bg-white dark:bg-gray-900 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${billingPeriod === 'yearly' ? 'bg-white dark:bg-gray-900 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => setBillingPeriod('yearly')}
              >
                Yearly
              </button>
            </div>
          </div>
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 justify-center">
            {/* Free Plan */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 flex flex-col shadow-xl items-center max-w-md">
              <div className="font-bold text-lg mb-1">Free</div>
              <div className="text-3xl font-bold mb-1">$0</div>
              <div className="text-gray-500 text-sm mb-6">/month</div>
              <Button asChild className="w-full px-4 py-2 rounded bg-white border border-gray-300 text-black font-semibold hover:bg-gray-100 transition mb-6">
                <Link to="/register">Start Free</Link>
              </Button>
              <ul className="text-left space-y-2 text-sm w-full">
                <li className="flex items-center gap-2 font-semibold text-gray-700">Basic features</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Up to 3 roadmaps per user</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>PDF size limit: 5MB per upload</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Basic roadmap visualization</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Up to 3 depth levels in hierarchy</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Standard resources only</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Default node customization</li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-gray-400">–</span>No export options</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Basic progress tracking</li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-gray-400">–</span>No collaborative features</li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-gray-400">–</span>Ad-supported experience</li>
              </ul>
            </div>
            {/* Pro Plan (Recommended) */}
            <div className="relative rounded-2xl border-2 border-yellow-400 bg-white dark:bg-gray-950 p-8 flex flex-col shadow-2xl items-center scale-105 z-10 max-w-md">
              <div className="absolute -top-4 right-6"><span className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Recommended</span></div>
              <div className="font-bold text-lg mb-1">Pro</div>
              {billingPeriod === 'monthly' ? (
                <>
                  <div className="text-3xl font-bold mb-1">$5.99</div>
                  <div className="text-gray-500 text-sm">/month</div>
                  <div className="text-xs text-gray-500 mb-6">Billed monthly</div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold mb-1">$71.88</div>
                  <div className="text-gray-500 text-sm">/year</div>
                  <div className="text-xs text-gray-500 mb-6">($5.99/month, save ~33%)</div>
                </>
              )}
              <button className="w-full px-4 py-2 rounded bg-black text-white font-semibold hover:bg-gray-900 transition mb-6">Get Pro</button>
              <ul className="text-left space-y-2 text-sm w-full">
                {/* Core Upgrades */}
                <li className="flex items-center gap-2 font-semibold text-gray-700">Core Upgrades</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Unlimited roadmaps</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>PDF size limit: 25MB</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Unlimited hierarchy depth</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Full roadmap editing</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Premium resource recommendations</li>
                {/* Advanced Features */}
                <li className="flex items-center gap-2 font-semibold text-gray-700 mt-2">Advanced Features</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Custom node styling & themes</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Export as PDF, PNG, SVG, HTML</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Google Drive, Notion & more integrations</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Detailed progress analytics</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Priority AI processing</li>
                {/* Collaboration Tools */}
                <li className="flex items-center gap-2 font-semibold text-gray-700 mt-2">Collaboration Tools</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Team sharing & collaborative editing</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Comments & discussion threads</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Custom access controls</li>
                {/* Learning Enhancements */}
                <li className="flex items-center gap-2 font-semibold text-gray-700 mt-2">Learning Enhancements</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Spaced repetition reminders</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Auto-generated quizzes</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Advanced bookmarks & notes</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>AI-powered content summaries</li>
                {/* User Experience */}
                <li className="flex items-center gap-2 font-semibold text-gray-700 mt-2">User Experience</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Ad-free experience</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Priority support</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span>Early access to new features</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
