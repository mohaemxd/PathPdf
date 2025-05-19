import { useState, useEffect } from "react";
import { FileUp, UploadIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { generateRoadmap, RoadmapData } from "@/lib/gemini";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { supabase } from "@/integrations/supabase/client";

// Use the local worker file in public/
const { GlobalWorkerOptions } = pdfjsLib;
GlobalWorkerOptions.workerSrc = '/src/pages/pdf.worker.min.js';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [roadmapLimitReached, setRoadmapLimitReached] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check auth state and roadmap count on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      
      if (user) {
        const { count, error } = await supabase
          .from('roadmaps')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (!error && (count || 0) >= 5) {
          setRoadmapLimitReached(true);
        } else {
          setRoadmapLimitReached(false);
        }
      }
    };
    checkAuth();
  }, []);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleProcessPdf = async () => {
    console.log('handleProcessPdf called');
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('File selected:', file);
    setIsProcessing(true);
    setProgress(0);
    try {
      console.log('Processing PDF...');
      // Check if user already has 5 roadmaps
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count, error: countError } = await supabase
          .from('roadmaps')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (countError) throw countError;
        if ((count || 0) >= 5) {
          toast({
            title: "Roadmap limit reached",
            description: "You can only create up to 5 roadmaps. Please delete an existing roadmap to add a new one.",
            variant: "destructive",
          });
          setRoadmapLimitReached(true);
          setIsProcessing(false);
          return;
        } else {
          setRoadmapLimitReached(false);
        }
      }
      // Extract structured content from PDF
      console.log('About to extract text from PDF:', file);
      let pdfContent;
      try {
        pdfContent = await extractTextFromPdf(file);
      } catch (err) {
        console.error('extractTextFromPdf threw:', err);
        throw err;
      }
      console.log('PDF content extracted:', pdfContent);
      setProgress(30);
      // Generate roadmap data from structured content
      const roadmapData = await generateRoadmap(pdfContent, file.name.replace('.pdf', ''));
      console.log('Roadmap data generated:', roadmapData);
      setProgress(70);
      // Save roadmap to Supabase
      if (user) {
        const { error } = await supabase.from('roadmaps').insert({
          user_id: user.id,
          title: roadmapData.title,
          content: JSON.parse(JSON.stringify(roadmapData)),
        });
        if (!error) {
          // Insert into pdfs table for accurate dashboard stats
          await supabase.from('pdfs').insert({
            user_id: user.id,
            file_name: file.name,
            uploaded_at: new Date().toISOString(),
          });
        }
        if (error) {
          toast({
            title: "Failed to save roadmap",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Roadmap saved!",
            description: "Your roadmap has been saved to your account.",
          });
        }
      }
      // Store the roadmap in local storage for now
      localStorage.setItem('currentRoadmap', JSON.stringify(roadmapData));
      setProgress(100);
      toast({
        title: "PDF processed successfully",
        description: "Your roadmap has been generated!",
      });
      setTimeout(() => {
        navigate('/demo');
      }, 500);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  // Improved extraction: returns structured content
  const extractTextFromPdf = async (pdfFile: File): Promise<Array<{type: string, text: string}>> => {
    console.log('Starting PDF text extraction...');
    const arrayBuffer = await pdfFile.arrayBuffer();
    console.log('ArrayBuffer obtained:', arrayBuffer);
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let structured: Array<{type: string, text: string}> = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        let lastFontSize = 0;
        let paragraph = '';
        for (const item of content.items) {
          // @ts-ignore
          const str = item.str;
          // @ts-ignore
          const fontSize = item.transform ? Math.abs(item.transform[0]) : 10;
          // Heuristic: large font = heading, else paragraph
          if (fontSize > 16) {
            if (paragraph.trim()) {
              structured.push({ type: 'paragraph', text: paragraph.trim() });
              paragraph = '';
            }
            structured.push({ type: 'heading', text: str.trim() });
          } else {
            paragraph += str + ' ';
          }
          lastFontSize = fontSize;
        }
        if (paragraph.trim()) {
          structured.push({ type: 'paragraph', text: paragraph.trim() });
        }
      }
      console.log('PDF text extraction completed:', structured);
      return structured;
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw error;
    }
  };
  
  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setIsProcessing(false);
  };

  const handleBack = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="fixed top-5 left-5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm z-10"
        title="Back"
      >
        <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>

      <main className="flex-1 container pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {!isProcessing ? (
              <div 
                className={`p-8 border-2 border-dashed rounded-lg ${
                  isDragging 
                    ? "border-pathpdf-500 bg-pathpdf-50" 
                    : "border-gray-300 bg-gray-50"
                } transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!file ? (
                  <div className="text-center">
                    <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drag and drop your PDF here
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      or click to browse files (max 10MB)
                    </p>
                    
                    <Button variant="outline" asChild>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="application/pdf"
                          onChange={handleFileChange}
                        />
                        Browse Files
                      </label>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-pathpdf-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FileUp className="h-8 w-8 text-pathpdf-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    
                    <div className="flex gap-3 justify-center">
                      <Button onClick={handleProcessPdf} className="bg-pathpdf-600 hover:bg-pathpdf-700">
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Process PDF
                      </Button>
                      <Button variant="outline" onClick={resetUpload}>
                        Change File
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Processing your PDF
                </h3>
                <Progress value={progress} className="mb-4" />
                
                <div className="text-sm text-gray-500">
                  {progress < 20 && "Uploading PDF..."}
                  {progress >= 20 && progress < 40 && "Extracting text..."}
                  {progress >= 40 && progress < 60 && "Analyzing content..."}
                  {progress >= 60 && progress < 80 && "Generating roadmap..."}
                  {progress >= 80 && progress < 100 && "Finalizing..."}
                  {progress === 100 && "Complete!"}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">How it works</h3>
            <p className="text-gray-600 mb-4">
              When you upload a PDF, PathPDF will:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Extract all text content from your document</li>
              <li>Analyze the content structure and identify key concepts</li>
              <li>Generate a hierarchical roadmap of topics and subtopics</li>
              <li>Create an interactive visualization you can navigate</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
