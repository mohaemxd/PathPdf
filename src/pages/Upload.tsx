
import { useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
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
  
  const handleProcessPdf = () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing steps
    const simulateProcessing = () => {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            // Redirect to roadmap view after processing (in real app)
            setTimeout(() => {
              toast({
                title: "PDF processed successfully",
                description: "Your roadmap has been generated!",
              });
              // In a real app, we would redirect to the roadmap view here
            }, 500);
            return 100;
          }
          return newProgress;
        });
      }, 300);
    };
    
    simulateProcessing();
  };
  
  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Upload PDF</h1>
          
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
                        <Upload className="mr-2 h-4 w-4" />
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
