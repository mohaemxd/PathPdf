// @ts-nocheck
// supabase/functions/notion-auth/index.ts
import { serve } from "std/server";

serve(async (req) => {
  try {
    // Get environment variables
    const clientId = Deno.env.get("NOTION_CLIENT_ID");
    const redirectUri = Deno.env.get("NOTION_REDIRECT_URI");

    if (!clientId || !redirectUri) {
      return new Response(
        JSON.stringify({ error: "Missing required environment variables" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse the request body to get state and custom redirect URI
    const { state, redirect_uri: customRedirectUri } = await req.json().catch(() => ({}));
    
    // Use custom redirect URI if provided, otherwise use the default
    const finalRedirectUri = customRedirectUri || redirectUri;

    // Construct the Notion OAuth URL with state parameter
    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&response_type=code${state ? `&state=${encodeURIComponent(state)}` : ''}`;

    // Return the URL instead of redirecting
    return new Response(
      JSON.stringify({ url: notionAuthUrl }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in auth:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});