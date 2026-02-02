import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpendio } from "@/context/SpendioContext";
import Landing from "./Landing";
import { Layout } from "@/components/Layout";
import { AITipsModal } from "@/components/AITipsModal";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { calculateMoneyHealthScore, computeNet, formatCurrency, getScoreColor, getScoreLabel, getRecommendedActions } from "@/utils/calculations";
import { calculateAIHealthScore } from "@/services/aiHealthScoreService";
import { AlertCircle, TrendingUp, Zap, AlertTriangle, CheckCircle, Lock, Check, X as XIcon, Sparkles } from "lucide-react";
import { isFreePlan } from "@/utils/subscriptionUtils";
import { UpgradeModal } from "@/components/UpgradeModal";

interface ScoreResult {
  score: number;
  components: {
    cashflow: number;
    discipline: number;
    debt: number;
    trend: number;
  };
  breakdown: any;
}

interface AIHealthScoreAnalysis {
  score: number;
  rating: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  insights: string;
  benchmarkComparison?: string;
  trendAnalysis?: string;
  personalizedGoals?: string[];
  riskFactors?: string[];
  opportunityAreas?: string[];
}

export default function Index() {
  const { user, session, loading } = useSpendio();
  const navigate = useNavigate();
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [aiScore, setAIScore] = useState<AIHealthScoreAnalysis | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [tipsModalOpen, setTipsModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      // Calculate traditional health score
      const result = calculateMoneyHealthScore(user);
      setScoreResult(result);

      // Calculate AI health score (non-blocking)
      setAILoading(true);
      calculateAIHealthScore(user)
        .then((analysis) => {
          // Check if we got AI analysis or fallback
          if (analysis.benchmarkComparison || analysis.trendAnalysis) {
            console.log("✅ AI analysis loaded successfully");
          } else {
            console.log("⚠️ Using fallback health score (API unavailable)");
          }
          setAIScore(analysis);
        })
        .catch((error) => {
          console.error("Error calculating AI health score:", error);
          setAIScore(null);
        })
        .finally(() => {
          setAILoading(false);
        });

      // Show onboarding for new users with no data
      const currentMonth = user.data.months[user.data.currentMonth];
      const hasSetupData =
        (user.data.snapshot?.cash || 0) > 0 ||
        (user.data.snapshot?.emergency || 0) > 0 ||
        (currentMonth?.totals.income || 0) > 0;

      if (!hasSetupData && !showOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#e5e5e5] border-t-[#1db584] rounded-full mx-auto mb-4" />
          <p className="text-[#666666]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <Landing />;
  }

  const currentMonth = user.data.months[user.data.currentMonth];
  const t = currentMonth?.totals || {
    income: 0,
    expenses: 0,
    savings: 0,
    investing: 0,
    debtPay: 0,
  };

  const net = computeNet(t);
  const score = scoreResult?.score || 0;
  const progressPercent = Math.round((score / 100) * 100);
  const circumference = 2 * Math.PI * 48;
  const strokeDashoffset = circumference * (1 - score / 100);

  const recommendations = scoreResult ? getRecommendedActions(scoreResult, user.data.snapshot || {}) : [];

  // Check setup completion
  const setupChecklist = {
    currentBalances:
      (user.data.snapshot?.cash || 0) > 0 ||
      (user.data.snapshot?.emergency || 0) > 0 ||
      (user.data.snapshot?.savings || 0) > 0 ||
      (user.data.snapshot?.investing || 0) > 0,
    monthlyIncome: (currentMonth?.totals.income || 0) > 0,
    monthlyExpenses: (currentMonth?.totals.expenses || 0) > 0,
    savingsOrInvestingTarget:
      (user.data.targets?.savings || 0) > 0 || (user.data.targets?.investing || 0) > 0,
  };

  const isSetupComplete = Object.values(setupChecklist).every((item) => item === true);
  const completionCount = Object.values(setupChecklist).filter((item) => item === true).length;
  const completionPercentage = (completionCount / Object.values(setupChecklist).length) * 100;

  return (
    <Layout currentPage="home">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-slide-up { animation: slideInUp 0.5s ease-out; }
        .animate-slide-down { animation: slideInDown 0.5s ease-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-scale-in { animation: scaleIn 0.4s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Setup Card */}
        {!isSetupComplete && (
          <div className="bg-gradient-to-r from-[#dcfce7] to-[#bbf7d0] border border-[#86efac] rounded-2xl p-4 md:p-6 animate-slide-up card-hover">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-bold text-[#1db584] uppercase tracking-wider">Get Started</div>
                <h3 className="text-lg font-bold text-[#0f8a56] mt-1">Complete your setup</h3>
                <p className="text-sm text-[#0f8a56] mt-2">
                  {completionCount} of {Object.keys(setupChecklist).length} steps completed
                </p>
              </div>
              <button
                onClick={() => navigate("/data")}
                className="px-4 py-2 rounded-lg bg-[#1db584] text-white font-semibold text-sm hover:bg-[#0f8a56] transition whitespace-nowrap"
              >
                Go to Setup
              </button>
            </div>

            {/* Checklist */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3">
                {setupChecklist.currentBalances ? (
                  <Check size={18} className="text-[#22c55e] flex-shrink-0" />
                ) : (
                  <XIcon size={18} className="text-[#ef4444] flex-shrink-0" />
                )}
                <span className={`text-sm ${setupChecklist.currentBalances ? "text-[#0f8a56]" : "text-[#666666]"}`}>
                  Add current account balances
                </span>
              </div>

              <div className="flex items-center gap-3">
                {setupChecklist.monthlyIncome ? (
                  <Check size={18} className="text-[#22c55e] flex-shrink-0" />
                ) : (
                  <XIcon size={18} className="text-[#ef4444] flex-shrink-0" />
                )}
                <span className={`text-sm ${setupChecklist.monthlyIncome ? "text-[#0f8a56]" : "text-[#666666]"}`}>
                  Add monthly income
                </span>
              </div>

              <div className="flex items-center gap-3">
                {setupChecklist.monthlyExpenses ? (
                  <Check size={18} className="text-[#22c55e] flex-shrink-0" />
                ) : (
                  <XIcon size={18} className="text-[#ef4444] flex-shrink-0" />
                )}
                <span className={`text-sm ${setupChecklist.monthlyExpenses ? "text-[#0f8a56]" : "text-[#666666]"}`}>
                  Add monthly expenses
                </span>
              </div>

              <div className="flex items-center gap-3">
                {setupChecklist.savingsOrInvestingTarget ? (
                  <Check size={18} className="text-[#22c55e] flex-shrink-0" />
                ) : (
                  <XIcon size={18} className="text-[#ef4444] flex-shrink-0" />
                )}
                <span className={`text-sm ${setupChecklist.savingsOrInvestingTarget ? "text-[#0f8a56]" : "text-[#666666]"}`}>
                  Set savings or investing target
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1db584] to-[#4dd4a4] transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Setup Completed Banner */}
        {isSetupComplete && score === 100 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-2xl p-4 md:p-6 animate-slide-up card-hover">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-[#22c55e] flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-[#065f46]">Setup completed!</h3>
                <p className="text-sm text-[#047857] mt-1">Your financial profile is ready. Keep tracking to improve your score.</p>
              </div>
            </div>
          </div>
        )}

        {/* Money Health Score Card */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm animate-slide-up card-hover" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Money Health Score</h2>
              <p className="text-sm text-[#666666] mt-1">{getScoreLabel(score)}</p>
            </div>
            <button
              onClick={() => setTipsModalOpen(true)}
              className="px-4 py-2 rounded-lg border border-[#e5e5e5] text-[#1a1a1a] font-semibold text-sm hover:bg-[#f3f3f3] transition"
            >
              Get tips
            </button>
          </div>

          <div className="grid md:grid-cols-[180px_1fr] gap-8">
            {/* Score Ring */}
            <div className="flex justify-center md:justify-start">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f3f3" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke={getScoreColor(score)}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-[#1a1a1a]">{score}</div>
                  <div className="text-xs text-[#666666] mt-1">/ 100</div>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="space-y-4">
              {/* AI Insight */}
              <div className="border border-[#86efac] bg-gradient-to-br from-[#dcfce7] to-[#f0fdf4] rounded-xl p-4">
                <div className="flex items-start gap-2">
                  {aiLoading ? (
                    <div className="flex items-center gap-2 w-full">
                      <Sparkles size={16} className="text-[#1db584] flex-shrink-0 mt-0.5 animate-spin" />
                      <div>
                        <div className="font-semibold text-sm text-[#0f8a56]">AI Analysis</div>
                        <p className="text-sm text-[#1a1a1a] mt-1">Analyzing your finances...</p>
                      </div>
                    </div>
                  ) : aiScore ? (
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={16} className="text-[#1db584] flex-shrink-0" />
                        <div className="font-semibold text-sm text-[#0f8a56]">AI Analysis - {aiScore.rating}</div>
                      </div>
                      <p className="text-sm text-[#1a1a1a] mt-2 mb-3">{aiScore.summary}</p>

                      {/* Trend Analysis */}
                      {aiScore.trendAnalysis && (
                        <div className="text-xs mb-2 p-2 bg-white/50 rounded">
                          <div className="font-medium text-[#0f8a56] mb-0.5">📈 Trend:</div>
                          <p className="text-[#1a1a1a] line-clamp-2">{aiScore.trendAnalysis}</p>
                        </div>
                      )}

                      {/* Benchmark Comparison */}
                      {aiScore.benchmarkComparison && (
                        <div className="text-xs mb-2 p-2 bg-white/50 rounded">
                          <div className="font-medium text-[#0f8a56] mb-0.5">📊 vs Average:</div>
                          <p className="text-[#1a1a1a] line-clamp-2">{aiScore.benchmarkComparison}</p>
                        </div>
                      )}

                      {aiScore.strengths.length > 0 && (
                        <div className="text-xs mb-2">
                          <div className="font-medium text-[#0f8a56] mb-1">✓ Strengths:</div>
                          <ul className="text-[#1a1a1a] list-disc list-inside space-y-0.5">
                            {aiScore.strengths.slice(0, 2).map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiScore.personalizedGoals && aiScore.personalizedGoals.length > 0 && (
                        <div className="text-xs mb-2">
                          <div className="font-medium text-[#0f8a56] mb-1">🎯 AI-Recommended Goals:</div>
                          <ul className="text-[#1a1a1a] list-disc list-inside space-y-0.5">
                            {aiScore.personalizedGoals.slice(0, 2).map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiScore.recommendations.length > 0 && (
                        <div className="text-xs">
                          <div className="font-medium text-[#0f8a56] mb-1">💡 Top Action:</div>
                          <p className="text-[#1a1a1a]">{aiScore.recommendations[0]}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-sm text-[#0f8a56]">AI Insight</div>
                      <p className="text-sm text-[#1a1a1a] mt-1">
                        {score === 0
                          ? "Add your financial data to get personalized insights"
                          : score >= 75
                            ? "Great job! You're in excellent control of your finances."
                            : score >= 50
                              ? "You're on track. Focus on building your savings rate."
                              : "Consider reviewing your spending and creating a plan."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Totals */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f3f3f3] rounded-lg p-3">
                  <div className="text-xs text-[#666666] font-medium">Monthly Net</div>
                  <div className={`text-xl font-bold mt-1 ${net >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                    {formatCurrency(net, user.currency || "EUR")}
                  </div>
                </div>
                <div className="bg-[#f3f3f3] rounded-lg p-3">
                  <div className="text-xs text-[#666666] font-medium">Spent</div>
                  <div className="text-xl font-bold text-[#1a1a1a] mt-1">{formatCurrency(t.expenses, user.currency || "EUR")}</div>
                </div>
                <div className="bg-[#f3f3f3] rounded-lg p-3">
                  <div className="text-xs text-[#666666] font-medium">Saved</div>
                  <div className="text-xl font-bold text-[#1db584] mt-1">{formatCurrency(t.savings, user.currency || "EUR")}</div>
                </div>
                <div className="bg-[#f3f3f3] rounded-lg p-3">
                  <div className="text-xs text-[#666666] font-medium">Invested</div>
                  <div className="text-xl font-bold text-[#1db584] mt-1">{formatCurrency(t.investing, user.currency || "EUR")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Balances */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm animate-slide-up card-hover" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1a1a1a]">Current Balances</h3>
            <button
              onClick={() => navigate("/data")}
              className="px-3 py-1 rounded-lg border border-[#e5e5e5] text-[#1a1a1a] font-medium text-sm hover:bg-[#f3f3f3] transition"
            >
              Edit
            </button>
          </div>

          {user.data.snapshot ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#f3f3f3] rounded-lg p-3">
                <div className="text-xs text-[#666666] font-medium">Cash</div>
                <div className="text-lg font-bold text-[#1a1a1a] mt-1">
                  {formatCurrency(user.data.snapshot.cash, user.currency || "EUR")}
                </div>
              </div>
              <div className="bg-[#f3f3f3] rounded-lg p-3">
                <div className="text-xs text-[#666666] font-medium">Emergency</div>
                <div className="text-lg font-bold text-[#1a1a1a] mt-1">
                  {formatCurrency(user.data.snapshot.emergency, user.currency || "EUR")}
                </div>
              </div>
              <div className="bg-[#f3f3f3] rounded-lg p-3">
                <div className="text-xs text-[#666666] font-medium">Savings</div>
                <div className="text-lg font-bold text-[#1a1a1a] mt-1">
                  {formatCurrency(user.data.snapshot.savings, user.currency || "EUR")}
                </div>
              </div>
              <div className="bg-[#f3f3f3] rounded-lg p-3">
                <div className="text-xs text-[#666666] font-medium">Investing</div>
                <div className="text-lg font-bold text-[#1a1a1a] mt-1">
                  {formatCurrency(user.data.snapshot.investing, user.currency || "EUR")}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-[#fef3c7] border border-[#fde047] rounded-lg">
              <AlertCircle size={18} className="text-[#f97316] flex-shrink-0" />
              <p className="text-sm text-[#92400e]">Add your current balances to improve your score</p>
            </div>
          )}
        </div>

        {/* This Month Summary */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm animate-slide-up card-hover" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1a1a1a]">This Month</h3>
            <button
              onClick={() => navigate("/data")}
              className="px-3 py-1 rounded-lg border border-[#e5e5e5] text-[#1a1a1a] font-medium text-sm hover:bg-[#f3f3f3] transition"
            >
              Update
            </button>
          </div>

          <div className="space-y-3">
            {[
              { label: "Income", value: t.income, icon: "📥" },
              { label: "Expenses", value: t.expenses, icon: "📤" },
              { label: "Savings", value: t.savings, icon: "💾" },
              { label: "Investing", value: t.investing, icon: "📈" },
              { label: "Debt Payments", value: t.debtPay, icon: "💳" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#e5e5e5] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-[#1a1a1a]">{item.label}</span>
                </div>
                <span className="font-bold text-[#1a1a1a]">{formatCurrency(item.value, user.currency || "EUR")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Breakdown */}
        {scoreResult && score > 0 && (
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm animate-slide-up card-hover" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {/* Cashflow */}
              <div className="border-l-4 border-[#1db584] pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-[#1a1a1a]">Cashflow Stability</div>
                  <div className="text-sm font-bold text-[#1db584]">{scoreResult.components.cashflow}/40</div>
                </div>
                <p className="text-sm text-[#666666]">{scoreResult.breakdown.cashflowExplanation}</p>
              </div>

              {/* Discipline */}
              <div className="border-l-4 border-[#3b82f6] pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-[#1a1a1a]">Savings Discipline</div>
                  <div className="text-sm font-bold text-[#3b82f6]">{scoreResult.components.discipline}/25</div>
                </div>
                <p className="text-sm text-[#666666]">{scoreResult.breakdown.wealthExplanation}</p>
              </div>

              {/* Debt */}
              <div className="border-l-4 border-[#f97316] pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-[#1a1a1a]">Debt Management</div>
                  <div className="text-sm font-bold text-[#f97316]">{scoreResult.components.debt}/25</div>
                </div>
                <p className="text-sm text-[#666666]">{scoreResult.breakdown.debtExplanation}</p>
              </div>

              {/* Trend */}
              <div className="border-l-4 border-[#8b5cf6] pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-[#1a1a1a]">Trend & Consistency</div>
                  <div className="text-sm font-bold text-[#8b5cf6]">{scoreResult.components.trend}/10</div>
                </div>
                <p className="text-sm text-[#666666]">{scoreResult.breakdown.trendExplanation}</p>
              </div>

              {/* Emergency Fund */}
              {scoreResult.breakdown.emergencyFundMonths > 0 && (
                <div className="border-l-4 border-[#ec4899] pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-[#1a1a1a]">Emergency Fund</div>
                    <div className="text-sm font-bold text-[#ec4899]">{scoreResult.breakdown.emergencyFundMonths} months</div>
                  </div>
                  <p className="text-sm text-[#666666]">You have {Math.round(scoreResult.breakdown.emergencyFundMonths * 10) / 10} months of expenses saved.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommended Actions / Advanced Insights */}
        {recommendations.length > 0 && (
          <div className={`bg-white border rounded-2xl p-6 shadow-sm animate-slide-up card-hover ${
            isFreePlan(user) ? "border-[#fbbf24] relative overflow-hidden" : "border-[#e5e5e5]"
          }`} style={{ animationDelay: "0.5s" }}>
            {isFreePlan(user) && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-transparent pointer-events-none" />
            )}

            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-lg font-bold text-[#1a1a1a]">
                {isFreePlan(user) ? "Advanced Insights (Premium)" : "Recommended Actions"}
              </h3>
              {isFreePlan(user) && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
                  <Lock size={14} className="text-[#d97706]" />
                  <span className="text-xs font-semibold text-[#d97706]">Premium Only</span>
                </div>
              )}
            </div>

            {isFreePlan(user) ? (
              <div className="relative z-10 space-y-4">
                <p className="text-[#666666]">
                  Unlock detailed financial analysis and personalized recommendations to optimize your money management.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm opacity-60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#1db584] rounded-full" />
                    Smart spending insights
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#1db584] rounded-full" />
                    Debt optimization tips
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#1db584] rounded-full" />
                    Savings growth plans
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#1db584] rounded-full" />
                    Investment guidance
                  </div>
                </div>
                <button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="w-full mt-4 bg-gradient-to-r from-[#1db584] to-[#0f8a56] text-white font-semibold py-2 rounded-lg hover:shadow-lg transition"
                >
                  Unlock Premium Plan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((action, idx) => {
                  const iconColor =
                    action.priority === "red"
                      ? "text-[#ef4444]"
                      : action.priority === "yellow"
                        ? "text-[#f97316]"
                        : "text-[#22c55e]";
                  const borderColor =
                    action.priority === "red"
                      ? "border-l-[#ef4444]"
                      : action.priority === "yellow"
                        ? "border-l-[#f97316]"
                        : "border-l-[#22c55e]";
                  const IconComponent =
                    action.priority === "red" ? AlertTriangle : action.priority === "yellow" ? AlertCircle : CheckCircle;

                  return (
                    <div key={idx} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                      <div className="flex items-start gap-3">
                        <IconComponent size={20} className={`${iconColor} flex-shrink-0 mt-0.5`} />
                        <div>
                          <div className="font-semibold text-[#1a1a1a]">{action.title}</div>
                          <p className="text-sm text-[#666666] mt-1">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <AITipsModal isOpen={tipsModalOpen} onClose={() => setTipsModalOpen(false)} />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Unlock Advanced Financial Insights"
        description="Get personalized recommendations to optimize your spending, savings, and investment strategy."
        features={[
          "AI-powered financial analysis",
          "Personalized action plans",
          "Unlimited AI advisor access",
          "Full analytics & export",
        ]}
        onUpgradeClick={() => navigate("/billing")}
      />

      {showOnboarding && (
        <OnboardingWizard
          completedSteps={[
            setupChecklist.currentBalances ? 1 : 0,
            setupChecklist.monthlyIncome ? 2 : 0,
            setupChecklist.monthlyExpenses ? 3 : 0,
            setupChecklist.savingsOrInvestingTarget ? 4 : 0,
          ].filter(x => x > 0)}
          onClose={() => {
            setShowOnboarding(false);
          }}
        />
      )}
    </Layout>
  );
}
