import { FileUp, BookOpen, Route, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import PathpdfLogo from '../Assets/Pathpdf-Logo1_1.svg';
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const themes = [
  { name: "Light", value: "light", icon: <Sun className="h-7 w-7" /> },
  { name: "Dark", value: "light", icon: <Sun className="h-7 w-7" /> },
  { name: "System", value: "light", icon: <Sun className="h-7 w-7" /> },
];

const Index = () => { 
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">    
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20 px-4 text-center">
          <div className="container mx-auto">
          <div className="container mx-auto" style={{display:'flex',justifyContent:'center'}}>
            <img src={PathpdfLogo} alt="PathPDF Logo" style={{ width: 50, height: 50 , justifyContent:'center'}} />
          </div>
            <h1 className="text-2xl md:text-7xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg mb-6">
              Transform PDFs into Interactive Learning Roadmaps
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
              Upload any educational PDF and PathPDF will generate a customized, interactive learning path to help you master the content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <div className="group relative inline-block p-[2px] rounded-lg bg-gradient-to-r from-blue-600 via-blue-400 to-gray-400 animate-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105">
                <Button size="lg" className="relative z-10 px-8 py-5 min-w-[180px] bg-pathpdf-600 hover:bg-pathpdf-700 rounded-lg font-bold text-white shadow transition-all duration-300" asChild>
                <Link to="/upload">
                  <FileUp className="mr-2 h-7 w-10" />
                  Upload PDF
                </Link>
              </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 cursor-pointer">
                <div className="bg-pathpdf-100 rounded-full p-3 mb-4">
                  <FileUp className="h-6 w-6 text-pathpdf-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload PDF</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload any educational PDF document to get started. Our system will extract and analyze the content.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 cursor-pointer">
                <div className="bg-pathpdf-100 rounded-full p-3 mb-4">
                  <Route className="h-6 w-6 text-pathpdf-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate Roadmap</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI analyzes your document and creates a hierarchical roadmap of concepts and learning objectives.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 cursor-pointer">
                <div className="bg-pathpdf-100 rounded-full p-3 mb-4">
                  <BookOpen className="h-6 w-6 text-pathpdf-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Learn Interactively</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Navigate through your interactive roadmap, expanding topics and tracking your progress as you learn.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="bg-pathpdf-600 dark:bg-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your learning?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Sign up for free and start creating learning roadmaps from your educational materials.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Get Started for Free</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2025 PathPDF. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
