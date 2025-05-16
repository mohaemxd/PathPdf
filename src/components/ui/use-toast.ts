import { useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
}

export function useToast() {
  // Minimal placeholder: replace with a real toast library as needed
  const toast = useCallback(({ title, description }: ToastOptions) => {
    alert(`${title}\n${description || ''}`);
  }, []);
  return { toast };
} 