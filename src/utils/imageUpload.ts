import fetch from 'node-fetch';
import { supabase } from '../integrations/supabase/client';

export async function fetchAndUploadImage(imageUrl: string, fileName: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Failed to fetch image');
  const buffer = await response.buffer();

  const { error } = await supabase.storage
    .from('roadmap-images')
    .upload(fileName, buffer, {
      contentType: response.headers.get('content-type') || 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { publicUrl } = supabase.storage.from('roadmap-images').getPublicUrl(fileName);
  return publicUrl;
} 