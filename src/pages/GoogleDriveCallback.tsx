import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function GoogleDriveCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the access token from the URL hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (accessToken) {
      // Save the token or a flag to Supabase user metadata
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          await supabase.auth.updateUser({
            data: { google_drive_connected: true, google_drive_token: accessToken }
          });
          // Force refresh user session
          await supabase.auth.getUser();
        }
        // Reload the page to ensure session is up to date
        window.location.replace("/account?drive=connected");
      });
    } else {
      // Handle error or redirect
      window.location.replace("/account?drive=error");
    }
  }, []);

  return <div>Connecting to Google Drive...</div>;
} 