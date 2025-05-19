import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Github } from "lucide-react";

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
      <main className="flex-1 flex items-center justify-center bg-white py-12 px-4 relative">
        {/* Gradient Shadow Behind Container */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[380px] pointer-events-none z-0" aria-hidden="true">
          <div className="w-full h-full rounded-2xl blur-2xl opacity-60 bg-gradient-to-tr from-gray-200 via-white to-gray-100"></div>
        </div>
        <div className="w-full max-w-md z-10">
          <div className="p-[3px] rounded-2xl bg-gradient-to-tr from-gray-200 via-white to-white shadow-2xl">
            <div className="bg-white rounded-2xl w-full h-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>Enter your email below to create your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <Button variant="outline" className="w-1/2 flex items-center justify-center gap-2">
                      <Github className="w-5 h-5" /> GitHub
                    </Button>
                    <Button variant="outline" className="w-1/2 flex items-center justify-center gap-2">
                      <span className="w-5 h-5 inline-block align-middle">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                          <g clipPath="url(#clip0_17_40)">
                            <path d="M23.766 12.276c0-.818-.074-1.604-.213-2.356H12.24v4.451h6.484a5.54 5.54 0 0 1-2.4 3.637v3.017h3.877c2.27-2.09 3.565-5.17 3.565-8.749z" fill="#4285F4"/>
                            <path d="M12.24 24c3.24 0 5.963-1.07 7.95-2.91l-3.877-3.017c-1.08.726-2.46 1.16-4.073 1.16-3.13 0-5.78-2.11-6.73-4.946H1.53v3.09A11.997 11.997 0 0 0 12.24 24z" fill="#34A853"/>
                            <path d="M5.51 14.287a7.19 7.19 0 0 1 0-4.574V6.623H1.53a12.004 12.004 0 0 0 0 10.754l3.98-3.09z" fill="#FBBC05"/>
                            <path d="M12.24 4.771c1.76 0 3.33.605 4.57 1.793l3.42-3.42C18.2 1.07 15.48 0 12.24 0A11.997 11.997 0 0 0 1.53 6.623l3.98 3.09c.95-2.836 3.6-4.946 6.73-4.946z" fill="#EA4335"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_17_40">
                              <path fill="#fff" d="M0 0h24v24H0z"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                      Google
                    </Button>
                  </div>
                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t" />
                    <span className="mx-2 text-xs text-gray-400">OR CONTINUE WITH</span>
                    <div className="flex-grow border-t" />
                  </div>
                  <form onSubmit={handleRegister} className="flex flex-col gap-6">
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
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-black hover:bg-gray-800">
                      Create account
                    </Button>
                  </form>
                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 