import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface NotionIntegration {
  id: string;
  workspace_name: string;
  workspace_icon: string;
  created_at: string;
}

export function NotionIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [integration, setIntegration] = useState<NotionIntegration | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchIntegration();
      }
    };
    getUser();
  }, []);

  const fetchIntegration = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('notion_integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching Notion integration:', error);
      return;
    }

    setIntegration(data);
  };

  const handleConnect = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get the current URL for the redirect
      const redirectUri = `${window.location.origin}/api/notion/callback`;
      
      // Call the notion-auth function with the user's ID as state
      const response = await fetch('/functions/v1/notion-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: user.id,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Notion OAuth');
      }

      // The function will return a redirect URL
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error connecting to Notion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notion_integrations')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setIntegration(null);
    } catch (error) {
      console.error('Error disconnecting from Notion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Notion Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect your Notion workspace to sync your roadmaps
          </p>
        </div>
        {integration ? (
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Disconnect Notion'
            )}
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Notion'
            )}
          </Button>
        )}
      </div>

      {integration && (
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            {integration.workspace_icon && (
              <img
                src={integration.workspace_icon}
                alt={integration.workspace_name}
                className="h-8 w-8 rounded"
              />
            )}
            <div>
              <p className="font-medium">{integration.workspace_name}</p>
              <p className="text-sm text-muted-foreground">
                Connected on {new Date(integration.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 