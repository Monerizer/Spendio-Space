import React, { useState } from "react";
import { useSpendio } from "@/context/SpendioContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface AuthPageProps {
  initialMode?: "signin" | "signup";
  onBack?: () => void;
}

export function AuthPage({ initialMode = "signin", onBack }: AuthPageProps = {}) {
  const { signUp, signIn } = useSpendio();
  const navigate = useNavigate();
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

    // Basic validation
    if (!loginEmail.trim()) {
      setLoginError("Email is required");
      setLoading(false);
      return;
    }
    if (!loginPass) {
      setLoginError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const success = await signIn(loginEmail, loginPass);
      if (success) {
        toast.success("Welcome back! 👋");
        navigate("/");
      } else {
        setLoginError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error) {
        // Show error messages as-is since we're handling them in SpendioContext
        setLoginError(error.message);
      } else {
        setLoginError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignupError("");

    // Client-side validation
    const nameError = validateName(signupName);
    if (nameError) {
      setSignupError(nameError);
      setLoading(false);
      return;
    }

    const emailError = validateEmail(signupEmail);
    if (emailError) {
      setSignupError(emailError);
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(signupPass);
    if (passwordError) {
      setSignupError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const success = await signUp(signupName, signupEmail, signupPass);
      if (success) {
        toast.success("Account created! Welcome to Spendio Space 🎉");
        // Give toast time to show before navigating
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setSignupError("Unable to create account. Please try again.");
      }
    } catch (error) {
      // Show error messages from validation and Supabase
      if (error instanceof Error) {
        const message = error.message;

        // Check if this is an email confirmation message (not an error, but a notice)
        if (message.includes("Account created") && message.includes("email")) {
          // This is actually a success - email confirmation is required
          toast.info(message);
          setSignupError(""); // Clear any error state
        } else if (message.includes("already registered") || message.includes("already in use")) {
          // Auto-switch to sign in mode and pre-fill email
          setSignupError(""); // Clear error
          setIsSignUp(false); // Switch to sign in mode
          setLoginEmail(signupEmail); // Pre-fill email
          toast.info("This email is already registered. Switching to sign in...");
        } else {
          // This is a real error
          setSignupError(message);
        }
      } else {
        setSignupError("Unable to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Validation helper functions
  const validateName = (name: string): string | null => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return "Name is required";
    }
    if (trimmed.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (trimmed.length > 50) {
      return "Name must be less than 50 characters";
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length === 0) {
      return "Email is required";
    }

    // More permissive email validation
    // This regex allows: user@domain.com, user+tag@domain.co.uk, user_name@domain.com, etc.
    // Pattern: local-part@domain
    // - local-part: alphanumeric, dots, hyphens, underscores, plus signs
    // - domain: alphanumeric, hyphens, dots with at least one dot
    const emailRegex = /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address";
    }

    // Additional length check
    if (trimmed.length > 254) {
      return "Email address is too long";
    }

    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (password.length === 0) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (password.length > 128) {
      return "Password must be less than 128 characters";
    }
    return null;
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
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPass}
                      onChange={(e) => {
                        setLoginPass(e.target.value);
                        setLoginError("");
                      }}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                        loginError ? "border-red-500 focus:ring-red-500" : "border-[#e5e5e5] focus:ring-[#1db584]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1a1a1a] transition"
                      aria-label={showLoginPass ? "Hide password" : "Show password"}
                    >
                      {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-2 px-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e5e5e5]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[#999999]">New to Spendio Space?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="w-full py-2 px-4 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
              >
                Create account
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Create account</h2>
                <p className="text-sm text-[#666666]">Start tracking your finances</p>
              </div>

              <div className="space-y-3 mt-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. Beka"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showSignupPass ? "text" : "password"}
                      placeholder="Create a password (6+ chars)"
                      value={signupPass}
                      onChange={(e) => {
                        setSignupPass(e.target.value);
                        setSignupError("");
                      }}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                        signupError ? "border-red-500 focus:ring-red-500" : "border-[#e5e5e5] focus:ring-[#1db584]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1a1a1a] transition"
                      aria-label={showSignupPass ? "Hide password" : "Show password"}
                    >
                      {showSignupPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {signupError && <p className="text-red-500 text-sm mt-1">{signupError}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-2 px-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="w-full py-2 px-4 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
              >
                Back to sign in
              </button>

              <p className="text-xs text-[#999999] text-center mt-4">
                Data securely stored in Supabase
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
