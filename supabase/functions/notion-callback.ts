   // supabase/functions/notion-callback/index.ts
     // @ts-nocheck
   import { serve } from "std/server";
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

   serve(async (req) => {
     try {
       const url = new URL(req.url);
       const code = url.searchParams.get("code");
       const state = url.searchParams.get("state"); // Get the state parameter

       if (!code) {
         return new Response("No code provided", { status: 400 });
       }

       // Get environment variables
       const clientId = Deno.env.get("NOTION_CLIENT_ID");
       const clientSecret = Deno.env.get("NOTION_CLIENT_SECRET");
       const redirectUri = Deno.env.get("NOTION_REDIRECT_URI");
       const supabaseUrl = Deno.env.get("SUPABASE_URL");
       const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

       if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !supabaseServiceKey) {
         return new Response(
           JSON.stringify({ error: "Missing required environment variables" }),
           { status: 500, headers: { "Content-Type": "application/json" } }
         );
       }

       // Exchange code for access token
       const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           grant_type: "authorization_code",
           code,
           redirect_uri: redirectUri,
           client_id: clientId,
           client_secret: clientSecret,
         }),
       });

       if (!tokenRes.ok) {
         const error = await tokenRes.json();
         return new Response(
           JSON.stringify({ error: "Failed to exchange code for token", details: error }),
           { status: 400, headers: { "Content-Type": "application/json" } }
         );
       }

       const tokenData = await tokenRes.json();

       // Initialize Supabase client
       const supabase = createClient(supabaseUrl, supabaseServiceKey);

       // If state parameter exists, it should be the user's ID
       if (state) {
         // Store the Notion integration data in your database
         const { error } = await supabase
           .from("notion_integrations")
           .upsert({
             user_id: state,
             access_token: tokenData.access_token,
             workspace_id: tokenData.workspace_id,
             workspace_name: tokenData.workspace_name,
             workspace_icon: tokenData.workspace_icon,
             bot_id: tokenData.bot_id,
             updated_at: new Date().toISOString(),
           });

         if (error) {
           console.error("Error saving Notion integration:", error);
           return new Response(
             JSON.stringify({ error: "Failed to save integration data" }),
             { status: 500, headers: { "Content-Type": "application/json" } }
           );
         }
       }

       // Redirect back to your app with success message
       return new Response(null, {
         status: 302,
         headers: {
           Location: `${redirectUri.split("/api")[0]}/settings?notion=success`,
         },
       });
     } catch (error) {
       console.error("Error in callback:", error);
       return new Response(
         JSON.stringify({ error: "Internal server error" }),
         { status: 500, headers: { "Content-Type": "application/json" } }
       );
     }
   });