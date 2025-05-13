import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = "/dashboard";
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    if (error) setResetMsg(error.message);
    else setResetMsg("Password reset email sent! Check your inbox.");
  };

  return (
    <>
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center bg-pathpdf-50 py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Hello</h2>
          {!showReset ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pathpdf-600" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pathpdf-600" />
              <Button type="submit" className="w-full bg-pathpdf-600 hover:bg-pathpdf-700">Sign In</Button>
              <div className="flex justify-between text-sm mt-2">
                <button type="button" className="text-pathpdf-600 hover:underline" onClick={() => setShowReset(true)}>
                  Forgot password?
                </button>
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Enter your email" required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pathpdf-600" />
              <Button type="submit" className="w-full bg-pathpdf-600 hover:bg-pathpdf-700">Send Reset Email</Button>
              <button type="button" className="text-pathpdf-600 hover:underline w-full" onClick={() => setShowReset(false)}>
                Back to Sign In
              </button>
              {resetMsg && <div className="text-center text-sm mt-2" style={{ color: resetMsg.includes('sent') ? 'green' : 'red' }}>{resetMsg}</div>}
            </form>
          )}
        </div>
      </main>
    </div>
    </>
  );
}   