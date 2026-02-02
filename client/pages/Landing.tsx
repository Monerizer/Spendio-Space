import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthPage } from "@/components/AuthPage";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { TrendingUp, BarChart3, Zap, Lock, ArrowRight, CheckCircle, Users, Globe } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  useScrollToTop();

  // Check if signup query parameter is present
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setShowAuth(true);
      setAuthMode("signup");
    }
  }, [searchParams]);

  const handleGetStarted = () => {
    setAuthMode("signup");
    setShowAuth(true);
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuth(true);
  };

  if (showAuth) {
    return <AuthPage initialMode={authMode} onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#e5e5e5] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f8a56] to-[#1db584] flex items-center justify-center text-white font-bold text-sm">
              SS
            </div>
            <div className="text-xl font-bold text-[#1a1a1a]">Spendio Space</div>
          </div>
          <button
            onClick={handleSignIn}
            className="px-6 py-2 rounded-lg text-[#1db584] font-semibold hover:bg-[#f3f3f3] transition"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-[#1a1a1a] mb-6 leading-tight">
              Take Control of Your <span className="text-[#1db584]">Financial Future</span>
            </h1>
            <p className="text-xl text-[#666666] mb-8 leading-relaxed">
              Spendio Space gives you complete clarity about your money. Track income, expenses, savings, and investments all in one place. No bank connections. No server storage. 100% private.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition flex items-center justify-center gap-2"
              >
                Get Started Free <ArrowRight size={20} />
              </button>
              <button
                onClick={handleSignIn}
                className="px-8 py-4 border-2 border-[#1db584] text-[#1db584] font-semibold rounded-lg hover:bg-[#f0fdf4] transition"
              >
                Sign In
              </button>
            </div>
            <p className="text-sm text-[#999999] mt-4">✓ 7-day free trial • ✓ Full feature access • ✓ Cancel anytime</p>
          </div>

          {/* Hero Illustration */}
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
                <div className="bg-gradient-to-r from-[#1db584]/10 to-[#8b5cf6]/10 rounded-lg p-4">
                  <div className="text-sm font-semibold text-[#1a1a1a] mb-2">Your Money Health Score</div>
                  <div className="text-3xl font-bold text-[#1db584]">78/100</div>
                  <div className="text-xs text-[#666666] mt-1">Good financial health</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f0fdf4] rounded-lg p-3">
                    <div className="text-xs text-[#666666]">Income</div>
                    <div className="text-lg font-bold text-[#1db584]">$5,200</div>
                  </div>
                  <div className="bg-[#fef2f2] rounded-lg p-3">
                    <div className="text-xs text-[#666666]">Expenses</div>
                    <div className="text-lg font-bold text-red-600">$2,100</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f0f9ff] rounded-lg p-3">
                    <div className="text-xs text-[#666666]">Savings</div>
                    <div className="text-lg font-bold text-blue-600">$1,500</div>
                  </div>
                  <div className="bg-[#f3e8ff] rounded-lg p-3">
                    <div className="text-xs text-[#666666]">Investing</div>
                    <div className="text-lg font-bold text-purple-600">$800</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-4">Everything You Need</h2>
            <p className="text-xl text-[#666666]">Simple, powerful tools to understand your money</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 border border-[#e5e5e5] rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#1db584]/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-[#1db584]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Track Everything</h3>
              <p className="text-[#666666]">
                Monitor income, expenses, savings, investments, and debt all in one dashboard. Get a complete picture of your finances.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border border-[#e5e5e5] rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#8b5cf6]/10 rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} className="text-[#8b5cf6]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">AI Copilot</h3>
              <p className="text-[#666666]">
                Get personalized financial advice from our AI advisor. Ask questions, get recommendations, and improve your financial health.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border border-[#e5e5e5] rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#06b6d4]/10 rounded-lg flex items-center justify-center mb-4">
                <Lock size={24} className="text-[#06b6d4]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">100% Private</h3>
              <p className="text-[#666666]">
                Your data stays on your device. We never connect to your banks, and we never store your data on our servers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 border border-[#e5e5e5] rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Smart Analytics</h3>
              <p className="text-[#666666]">
                Beautiful charts and insights show spending patterns, trends, and financial health scores over time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 border border-[#e5e5e5] rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-600/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle size={24} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Set Goals</h3>
              <p className="text-[#666666]">
                Define savings and investing targets. Track progress towards your financial goals and celebrate milestones.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 border border-[#e5e5e5] rounded-2xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center mb-4">
                <Globe size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Multi-Currency</h3>
              <p className="text-[#666666]">
                Support for 20+ currencies worldwide. Perfect for managing finances in any country or currency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#1a1a1a] mb-8">Why Choose Spendio Space?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <CheckCircle size={24} className="text-[#1db584] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">7-Day Free Trial</h3>
                    <p className="text-[#666666]">Try all premium features free for 7 days. No credit card required. Cancel anytime.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle size={24} className="text-[#1db584] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">100% Anonymous</h3>
                    <p className="text-[#666666]">Sign in with just a username and email. No sensitive data collected. Your identity is completely protected.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle size={24} className="text-[#1db584] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">AI-Powered Advice</h3>
                    <p className="text-[#666666]">Get personalized financial recommendations powered by advanced AI. Available 24/7.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle size={24} className="text-[#1db584] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">Easy to Use</h3>
                    <p className="text-[#666666]">Beautiful, intuitive interface. Get started in seconds. No complex setup required.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-[#1db584]/5 to-[#8b5cf6]/5 rounded-2xl p-12">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#1db584]">100K+</div>
                    <div className="text-[#666666] mt-2">People managing their finances</div>
                  </div>
                  <div className="border-t border-[#e5e5e5]"></div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#8b5cf6]">4.9/5</div>
                    <div className="text-[#666666] mt-2">Average user rating</div>
                  </div>
                  <div className="border-t border-[#e5e5e5]"></div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-600">$500M+</div>
                    <div className="text-[#666666] mt-2">Tracked and managed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#1db584]/10 to-[#8b5cf6]/10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">Ready to Take Control?</h2>
          <p className="text-xl text-[#666666] mb-8">
            Join thousands of people who have already simplified their financial lives with Spendio Space.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-10 py-4 bg-[#1db584] text-white font-semibold text-lg rounded-lg hover:bg-[#0f8a56] transition inline-flex items-center gap-2"
          >
            Get Started Free Today <ArrowRight size={24} />
          </button>
          <p className="text-sm text-[#999999] mt-4">✓ 7-day free trial • ✓ Full feature access • ✓ Takes 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e5e5e5] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-[#1a1a1a] mb-4">Spendio Space</div>
              <p className="text-sm text-[#666666]">Money clarity, without complexity.</p>
            </div>
            <div>
              <div className="font-semibold text-[#1a1a1a] mb-4">Product</div>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li><button onClick={() => navigate('/features')} className="hover:text-[#1db584] cursor-pointer text-left">Features</button></li>
                <li><button onClick={() => navigate('/billing')} className="hover:text-[#1db584] cursor-pointer text-left">Pricing</button></li>
                <li><button onClick={() => navigate('/security')} className="hover:text-[#1db584] cursor-pointer text-left">Security</button></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[#1a1a1a] mb-4">Company</div>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li><button onClick={() => navigate('/about')} className="hover:text-[#1db584] cursor-pointer text-left">About</button></li>
                <li><button onClick={() => navigate('/support')} className="hover:text-[#1db584] cursor-pointer text-left">Support</button></li>
                <li><button onClick={() => navigate('/support')} className="hover:text-[#1db584] cursor-pointer text-left">Contact</button></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-[#1a1a1a] mb-4">Legal</div>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li><button onClick={() => navigate('/privacy')} className="hover:text-[#1db584] cursor-pointer text-left">Privacy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-[#1db584] cursor-pointer text-left">Terms</button></li>
                <li><button onClick={() => navigate('/accessibility')} className="hover:text-[#1db584] cursor-pointer text-left">Accessibility</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#e5e5e5] pt-8 text-center text-sm text-[#999999]">
            <p>&copy; 2026 Spendio Space. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
