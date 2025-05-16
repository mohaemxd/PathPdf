import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { generateRoadmap } from '@/lib/gemini';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Upload = () => {
  const [_file, _setFile] = useState<File | null>(null);
  const [_isDragging, _setIsDragging] = useState(false);
  const [_isProcessing, _setIsProcessing] = useState(false);
  const [_progress, _setProgress] = useState(0);
  const { toast: _toast } = useToast();
  const navigate = useNavigate();

  const _handleProcessPdf = async () => {
    if (!_file) return;
    try {
      // Extract text from PDF
      const arrayBuffer = await _file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      
      // Generate roadmap using the extracted text
      const roadmapData = await generateRoadmap(text, _file.name.replace('.pdf', ''));
      
      // Store the roadmap in localStorage
      localStorage.setItem('currentRoadmap', JSON.stringify(roadmapData));
      
      // Insert the roadmap into Supabase and get the new ID
      const { data, error } = await supabase
        .from('roadmaps')
        .insert({ title: _file.name.replace('.pdf', ''), content: roadmapData })
        .select('id')
        .single();
      if (error || !data) {
        throw error || new Error('Failed to save roadmap');
      }
      
      // Show success toast
      _toast({
        title: 'PDF processed successfully',
        description: 'Your roadmap has been generated!',
      });
      
      // Navigate to the roadmap view page
      navigate(`/roadmap/${data.id}`);
    } catch (error) {
      console.error('Error processing PDF:', error);
      _toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div>
      <h1>Upload PDF</h1>
      <input type="file" accept=".pdf" onChange={(e) => { if (e.target.files?.[0]) { _setFile(e.target.files[0]); } }} />
      {_file && ( <button onClick={_handleProcessPdf}>Process PDF (Generate Roadmap) </button> )}
    </div>
  );
};

export default Upload; 