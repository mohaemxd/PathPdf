import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

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
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center bg-white py-12 px-4 relative">
        {/* Gradient Shadow Behind Container */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[340px] pointer-events-none z-0" aria-hidden="true">
          <div className="w-full h-full rounded-2xl blur-2xl opacity-60 bg-gradient-to-tr from-gray-200 via-white to-gray-100"></div>
        </div>
        <div className="w-full max-w-md z-10">
          <div className="p-[3px] rounded-2xl bg-gradient-to-tr from-gray-200 via-white to-white shadow-2xl">
            <div className="bg-white rounded-2xl w-full h-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Login</CardTitle>
                  <CardDescription>Enter your email below to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showReset ? (
                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                          <button
                            type="button"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-black"
                            onClick={() => setShowReset(true)}
                          >
                            Forgot your password?
                          </button>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-black hover:bg-gray-800">
                        Login
                      </Button>
                      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                      <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="underline underline-offset-4">
                          Sign up
                        </Link>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleReset} className="flex flex-col gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="resetEmail">Email</Label>
                        <Input
                          id="resetEmail"
                          type="email"
                          placeholder="Enter your email"
                          required
                          value={resetEmail}
                          onChange={e => setResetEmail(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-pathpdf-600 hover:bg-pathpdf-700">
                        Send Reset Email
                      </Button>
                      <button
                        type="button"
                        className="text-pathpdf-600 hover:underline w-full"
                        onClick={() => setShowReset(false)}
                      >
                        Back to Login
                      </button>
                      {resetMsg && <div className="text-center text-sm mt-2" style={{ color: resetMsg.includes('sent') ? 'green' : 'red' }}>{resetMsg}</div>}
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}   