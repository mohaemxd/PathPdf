
import { FileUp, BookOpen, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-white to-pathpdf-50 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transform PDFs into Interactive Learning Roadmaps
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Upload any educational PDF and PathPDF will generate a customized, interactive learning path to help you master the content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-pathpdf-600 hover:bg-pathpdf-700" asChild>
                <Link to="/upload">
                  <FileUp className="mr-2 h-5 w-5" />
                  Upload PDF
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Try Demo
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
                <div className="bg-pathpdf-100 rounded-full p-3 mb-4">
                  <FileUp className="h-6 w-6 text-pathpdf-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload PDF</h3>
                <p className="text-gray-600">
                  Upload any educational PDF document to get started. Our system will extract and analyze the content.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
                <div className="bg-pathpdf-100 rounded-full p-3 mb-4">
                  <Route className="h-6 w-6 text-pathpdf-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate Roadmap</h3>
                <p className="text-gray-600">
                  Our AI analyzes your document and creates a hierarchical roadmap of concepts and learning objectives.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
                <div className="bg-pathpdf-100 rounded-full p-3 mb-4">
                  <BookOpen className="h-6 w-6 text-pathpdf-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Learn Interactively</h3>
                <p className="text-gray-600">
                  Navigate through your interactive roadmap, expanding topics and tracking your progress as you learn.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="bg-pathpdf-600 text-white py-16 px-4 sm:px-6 lg:px-8">
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
      
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 PathPDF. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
