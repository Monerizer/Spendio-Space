import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSpendio } from "@/context/SpendioContext";
import { useQuickAdd } from "@/context/QuickAddContext";
import { Menu, X, LogOut, Settings, BarChart3, MessageCircle, Home, FileText, TrendingUp, BookOpen, HelpCircle, Clock, Mic } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export function Layout({ children, currentPage = "home" }: LayoutProps) {
  const { user, logout } = useSpendio();
  const { openQuickAdd } = useQuickAdd();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleVoiceChat = () => {
    navigate("/advisor");
    setDrawerOpen(false);
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/data", label: "Financial Data", icon: FileText },
    { path: "/wealth", label: "Wealth", icon: TrendingUp },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/history", label: "Transaction History", icon: Clock },
    { path: "/advisor", label: "🤖 Copilot", icon: MessageCircle },
    { path: "/guides", label: "Guides", icon: BookOpen },
    { path: "/support", label: "Support", icon: HelpCircle },
  ];

  // Bottom nav items (exclude Guides - shown in drawer only)
  const bottomNavItems = navItems.slice(0, 5);

  return (
    <div className="flex flex-col h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5] shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3" aria-label="Spendio Space home">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f8a56] to-[#1db584] flex items-center justify-center text-white font-bold text-lg" aria-hidden="true">
              SS
            </div>
            <div>
              <div className="font-semibold text-sm">Spendio Space</div>
              <div className="text-xs text-[#666666]">Money clarity</div>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={openQuickAdd}
              className="hidden sm:block px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#1db584] hover:bg-[#0f8a56] transition"
              aria-label="Add new transaction"
            >
              + Add Transaction
            </button>
            <button
              onClick={openQuickAdd}
              className="sm:hidden w-9 h-9 rounded-lg bg-[#1db584] text-white hover:bg-[#0f8a56] transition flex items-center justify-center"
              aria-label="Add new transaction"
              title="Add Transaction"
            >
              +
            </button>
            <button
              onClick={handleVoiceChat}
              className="hidden sm:flex px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition items-center gap-2"
              aria-label="Speak with Copilot"
              title="Speak with Copilot"
            >
              <Mic size={16} aria-hidden="true" />
              <span>Speak with Copilot</span>
            </button>
            <button
              onClick={handleVoiceChat}
              className="sm:hidden w-9 h-9 rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition flex items-center justify-center"
              aria-label="Speak with Copilot"
              title="Copilot"
            >
              <Mic size={16} aria-hidden="true" />
            </button>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-[#e5e5e5] flex items-center justify-center hover:bg-[#f3f3f3] transition"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              aria-controls="navigation-drawer"
            >
              {drawerOpen ? <X size={18} className="sm:w-5 sm:h-5" aria-hidden="true" /> : <Menu size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Drawer - Works on all screen sizes */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setDrawerOpen(false)} aria-hidden="true">
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div
              id="navigation-drawer"
              className="absolute right-0 top-0 h-full w-64 bg-white border-l border-[#e5e5e5] shadow-lg flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="navigation"
              aria-label="Main navigation menu"
            >
              <div className="p-4 space-y-2 flex flex-col h-full overflow-y-auto">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-medium transition ${
                        currentPage === item.path.slice(1) || (item.path === "/" && currentPage === "home")
                          ? "bg-[#1db584] text-white"
                          : "text-[#1a1a1a] hover:bg-[#f3f3f3]"
                      }`}
                      aria-current={
                        currentPage === item.path.slice(1) || (item.path === "/" && currentPage === "home")
                          ? "page"
                          : undefined
                      }
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-[#e5e5e5] my-2" />

                <div className="space-y-2">
                  <Link
                    to="/settings"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-[#1a1a1a] rounded-lg hover:bg-[#f3f3f3] transition"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  <Link
                    to="/billing"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-[#1a1a1a] rounded-lg hover:bg-[#f3f3f3] transition"
                  >
                    <span>💳</span>
                    <span>Billing & Plans</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </div>

                {/* Footer Links - Spacer to push to bottom */}
                <div className="flex-1" />

                <div className="border-t border-[#e5e5e5] pt-3 pb-20">
                  <p className="text-xs font-semibold text-[#666666] px-4 mb-2">COMPANY</p>
                  <div className="space-y-2">
                    <Link
                      to="/terms"
                      onClick={() => setDrawerOpen(false)}
                      className="block px-4 py-2 text-xs text-[#666666] hover:text-[#1db584] transition"
                    >
                      Terms & Conditions
                    </Link>
                    <Link
                      to="/privacy"
                      onClick={() => setDrawerOpen(false)}
                      className="block px-4 py-2 text-xs text-[#666666] hover:text-[#1db584] transition"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      to="/refund"
                      onClick={() => setDrawerOpen(false)}
                      className="block px-4 py-2 text-xs text-[#666666] hover:text-[#1db584] transition"
                    >
                      Refund Policy
                    </Link>
                    <Link
                      to="/accessibility"
                      onClick={() => setDrawerOpen(false)}
                      className="block px-4 py-2 text-xs text-[#666666] hover:text-[#1db584] transition"
                    >
                      Accessibility
                    </Link>
                  </div>
                  <p className="text-xs text-[#999999] px-4 mt-3 pt-3 border-t border-[#e5e5e5]">
                    © 2026 Spendio Space
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e5e5] flex shadow-lg" aria-label="Bottom navigation">
        {bottomNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-semibold transition ${
              currentPage === item.path.slice(1) || (item.path === "/" && currentPage === "home")
                ? "text-[#1db584]"
                : "text-[#999999]"
            }`}
            aria-current={
              currentPage === item.path.slice(1) || (item.path === "/" && currentPage === "home")
                ? "page"
                : undefined
            }
          >
            <item.icon size={20} className="mb-1" aria-hidden="true" />
            {item.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
