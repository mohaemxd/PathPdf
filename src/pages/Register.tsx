import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else window.location.href = "/dashboard";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center bg-pathpdf-50 py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pathpdf-600" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pathpdf-600" />
            <Button type="submit" className="w-full bg-pathpdf-600 hover:bg-pathpdf-700">Sign Up</Button>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          </form>
        </div>
      </main>
    </div>
  );
} 