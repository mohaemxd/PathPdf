import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import RoadmapView from '@/components/roadmap/RoadmapView';
import { Button } from '@/components/ui/button';

export default function ViewRoadmap() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState<{ content: any; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('roadmaps')
        .select('content, title')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Roadmap not found.');
      } else {
        setRoadmapData(data);
      }
      setLoading(false);
    };
    if (id) fetchRoadmap();
  }, [id]);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center h-full text-gray-500">Loading roadmap...</div>;
  }
  if (error) {
    return <div className="flex flex-1 flex-col items-center justify-center h-full text-gray-500">
      <div className="mb-4">{error}</div>
      <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
    </div>;
  }
  if (!roadmapData) {
    return <div className="flex flex-1 items-center justify-center h-full text-gray-500">No roadmap data.</div>;
  }
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-1 flex flex-col">
        <div className="bg-gradient-to-b from-white to-pathpdf-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {roadmapData.title || 'Roadmap'}
            </h1>
          </div>
        </div>
        <div className="w-full grow min-h-[400px]" style={{ height: 'calc(100vh - 64px - 96px)' }}>
          <RoadmapView roadmapData={roadmapData.content} />
        </div>
      </main>
    </div>
  );
} 