// Supabase Edge Function: send-feedback
// Accepts POST with { type, subject, message, email, user_id }, saves to feedback table, and sends email via Gmail SMTP
  // @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// SMTP email sending
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FEEDBACK_EMAIL = "nacemohamed19@gmail.com";
const GMAIL_USER = Deno.env.get("GMAIL_USER")!; // your Gmail address
const GMAIL_PASS = Deno.env.get("GMAIL_PASS")!; // your Gmail app password

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { type, subject, message, email, user_id } = await req.json();
  if (!type || !subject || !message) {
    return new Response("Missing fields", { status: 400 });
  }
  // Save to feedback table
  const { error } = await supabase.from("feedback").insert({
    type, subject, message, email, user_id
  });
  if (error) {
    return new Response("Failed to save feedback", { status: 500 });
  }
  // Send email
  try {
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: GMAIL_USER,
      password: GMAIL_PASS,
    });
    await client.send({
      from: GMAIL_USER,
      to: FEEDBACK_EMAIL,
      subject: `[PathPDF Feedback] ${subject}`,
      content: `Type: ${type}\nFrom: ${email || "Anonymous"}\n\n${message}`,
    });
    await client.close();
  } catch (e) {
    return new Response("Feedback saved, but failed to send email: " + e, { status: 500 });
  }
  return new Response("Feedback sent!", { status: 200 });
}); 