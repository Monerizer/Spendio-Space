/**
 * EXAMPLE: How to integrate Supabase with AuthPage
 * 
 * This shows how you can update the existing AuthPage component
 * to support Supabase authentication alongside (or instead of) localStorage auth.
 * 
 * You can keep using the existing SpendioContext, or swap it for SupabaseAuthContext,
 * or use both in parallel for a gradual migration.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

// Option 1: Use Supabase auth
import { useSupabaseAuthContext } from "@/context/SupabaseAuthContext";

// Option 2: Use existing localStorage auth
import { useSpendio } from "@/context/SpendioContext";

interface AuthPageWithSupabaseProps {
  initialMode?: "signin" | "signup";
  onBack?: () => void;
  useSupabase?: boolean; // Toggle between Supabase and localStorage
}

/**
 * Example: AuthPage with Supabase integration
 */
export function AuthPageWithSupabase({
  initialMode = "signin",
  onBack,
  useSupabase = false, // Set to true to use Supabase
}: AuthPageWithSupabaseProps = {}) {
  const navigate = useNavigate();
  const supabaseAuth = useSupabaseAuthContext();
  const localAuth = useSpendio();

  // Choose which auth system to use
  const auth = useSupabase ? supabaseAuth : localAuth;

  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [loading, setLoading] = useState(false);

  // Sign in fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Sign up fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupError, setSignupError] = useState("");
  const [showSignupPass, setShowSignupPass] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      if (useSupabase) {
        // Use Supabase
        const result = await supabaseAuth.signIn(loginEmail, loginPass);
        if (result.success) {
          toast.success("Signed in successfully");
          navigate("/");
        } else {
          setLoginError(result.error || "Sign in failed");
        }
      } else {
        // Use localStorage (existing implementation)
        if (localAuth.signIn(loginEmail, loginPass)) {
          toast.success("Signed in successfully");
          navigate("/");
        } else {
          setLoginError("Wrong email or password");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignupError("");

    // Basic validation
    if (signupName.length < 2) {
      setSignupError("Name must be at least 2 characters");
      setLoading(false);
      return;
    }
    if (!signupEmail.includes("@")) {
      setSignupError("Please enter a valid email");
      setLoading(false);
      return;
    }
    if (signupPass.length < 4) {
      setSignupError("Password must be at least 4 characters");
      setLoading(false);
      return;
    }

    try {
      if (useSupabase) {
        // Use Supabase
        const result = await supabaseAuth.signUp(signupEmail, signupPass, signupName);
        if (result.success) {
          toast.success("Account created successfully!");
          navigate("/");
        } else {
          setSignupError(result.error || "Sign up failed");
        }
      } else {
        // Use localStorage (existing implementation)
        if (localAuth.signUp(signupName, signupEmail, signupPass)) {
          toast.success("Account created successfully!");
          navigate("/");
        } else {
          setSignupError("Username 2+, valid email, password 4+, or email already used");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setSignupError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 px-3 py-2 text-sm text-[#666666] font-medium hover:text-[#1a1a1a] hover:bg-[#f3f3f3] rounded-lg transition"
            aria-label="Go back"
          >
            ← Back
          </button>
        )}

        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0f8a56] to-[#1db584] flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <div className="text-left">
              <div className="font-bold text-2xl text-[#1a1a1a]">Spendio Space</div>
              <div className="text-sm text-[#666666]">Money clarity, without complexity</div>
            </div>
          </div>
          {/* Show which auth system is active */}
          <div className="text-xs text-[#999999] mt-2">
            Using {useSupabase ? "Supabase" : "Local Storage"} Authentication
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-md p-6">
          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Sign in</h2>
                <p className="text-sm text-[#666666]">Access your financial overview</p>
              </div>

              <div className="space-y-3 mt-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0f8a56] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0f8a56] disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1a1a1a]"
                    >
                      {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#0f8a56] to-[#1db584] text-white font-medium hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setLoginError("");
                }}
                className="w-full text-sm text-[#666666] font-medium hover:text-[#1a1a1a]"
              >
                Don't have an account? Create one
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Create account</h2>
                <p className="text-sm text-[#666666]">Start managing your finances</p>
              </div>

              <div className="space-y-3 mt-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0f8a56] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0f8a56] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showSignupPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupPass}
                      onChange={(e) => setSignupPass(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0f8a56] disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1a1a1a]"
                    >
                      {showSignupPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {signupError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {signupError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#0f8a56] to-[#1db584] text-white font-medium hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setSignupError("");
                }}
                className="w-full text-sm text-[#666666] font-medium hover:text-[#1a1a1a]"
              >
                Already have an account? Sign in
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <p className="text-xs text-[#999999] text-center">
              {useSupabase
                ? "Data securely stored in Supabase"
                : "Data stored locally on this device"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
