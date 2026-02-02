import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpendio } from "@/context/SpendioContext";
import { AuthPage } from "@/components/AuthPage";
import { Layout } from "@/components/Layout";
import { ChevronDown, CheckCircle, AlertCircle, TrendingUp, Lightbulb } from "lucide-react";

export default function Guides() {
  const { user, session, loading } = useSpendio();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>("getting-started");

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
    return <AuthPage />;
  }

  interface GuideSection {
    id: string;
    title: string;
    description: string;
    content: (string | { type: string; text: string })[];
  }

  const sections: GuideSection[] = [
    {
      id: "getting-started",
      title: "🚀 Getting Started",
      description: "The recommended first steps to set up your Spendio Space account",
      content: [
        "Welcome to Spendio Space! Here's the best way to get started:",
        {
          type: "step",
          text: "1. Go to Financial Data page\n→ Enter your current account balances (Cash, Savings, Emergency Fund, Investing)\n→ This gives Spendio Space a baseline to calculate your Money Health Score",
        },
        {
          type: "step",
          text: "2. Add this month's transactions\n→ Record all your income (salary, freelance, bonuses, etc.)\n→ List all your expenses (housing, food, utilities, subscriptions)\n→ Add any savings or investments you made\n→ Include debt payments if applicable",
        },
        {
          type: "step",
          text: "3. Check your Money Health Score\n→ Go to Home page\n→ Your score appears at the top with a detailed breakdown\n→ Green = Good, Orange = Needs attention, Red = Critical",
        },
        {
          type: "step",
          text: "4. Set your Wealth Targets\n→ Go to Wealth page\n→ Set monthly savings goal (e.g., 10% of income)\n→ Set monthly investing goal (e.g., 5% of income)\n→ These targets help calculate your Money Health Score",
        },
        "Once you've done these 4 steps, you'll have a complete financial picture!",
      ],
    },
    {
      id: "understanding-score",
      title: "📊 Understanding Your Money Health Score",
      description: "What the score measures and how to improve it",
      content: [
        "Your Money Health Score (0-100) measures four key areas:",
        {
          type: "metric",
          text: "Cashflow Stability (40 pts)\n• Shows if you're spending more than you earn\n• Ideal: Spend 70% or less of your income\n• Improve: Cut unnecessary expenses or increase income",
        },
        {
          type: "metric",
          text: "Savings Discipline (25 pts)\n• Measures how much you save/invest\n• Target: Save at least 10% of income\n• Improve: Move money to savings account or invest regularly",
        },
        {
          type: "metric",
          text: "Debt Management (25 pts)\n• Tracks how much income goes to debt payments\n• Safe level: Less than 20% of income\n• Improve: Pay down debt or increase income",
        },
        {
          type: "metric",
          text: "Trend & Consistency (10 pts)\n• Compares this month to previous months\n• Improve: Maintain or improve your habits month-to-month",
        },
        "Bonus: Emergency Fund (5-10 pts)\n• Have 1+ months of expenses saved = +5 pts\n• Have 3+ months of expenses saved = +10 pts",
      ],
    },
    {
      id: "best-practices",
      title: "✅ Best Practices",
      description: "Tips for accurate tracking and better financial health",
      content: [
        "1. Be Honest with Your Numbers\n→ Don't round or guess amounts\n→ Include ALL expenses, even small ones\n→ Coffee ☕, subscriptions, and impulse purchases add up!\n\n",
        "2. Enter Data Weekly\n→ Don't wait until month-end to record transactions\n→ Weekly entries keep data accurate and fresh\n→ Easier to remember what you spent\n\n",
        "3. Categorize Your Spending\n→ Use sub-categories for clarity\n→ Example: Housing → Rent vs. Mortgage\n→ Better categories = better insights from AI Advisor\n\n",
        "4. Review & Adjust Monthly\n→ Check your Money Health Score each month\n→ Compare to previous months\n→ Identify patterns and problem areas\n\n",
        "5. Use AI Advisor\n→ Ask about your spending patterns\n→ Get recommendations for improvement\n→ Ask: 'How can I save more?' or 'Why is my score low?'\n\n",
        "6. Keep Emergency Fund Growing\n→ Target: 3-6 months of expenses\n→ This is your financial safety net\n→ Build it gradually if you're starting from scratch\n\n",
        "7. Set Realistic Targets\n→ Don't aim to save 50% if you can only do 10%\n→ Better to achieve 10% than fail at 50%\n→ Increase targets as your income grows",
      ],
    },
    {
      id: "features-guide",
      title: "🎯 Feature Guide",
      description: "Detailed overview of each page and its purpose",
      content: [
        {
          type: "feature",
          text: "HOME PAGE\n• Your financial summary at a glance\n• Money Health Score with breakdown\n• Current account balances\n• This month's totals (Income, Expenses, Savings, etc.)\n→ Visit daily to stay aware of your finances",
        },
        {
          type: "feature",
          text: "FINANCIAL DATA\n• Enter all your transactions\n• Manage income, expenses, savings, investing, debt\n• View transaction history\n• Supports transaction editing and deletion\n→ Go here to add daily/weekly transactions",
        },
        {
          type: "feature",
          text: "WEALTH PAGE\n• Set your savings targets\n• Set your investing targets\n• Track progress toward goals\n→ Update targets when your goals change",
        },
        {
          type: "feature",
          text: "ANALYTICS\n• View charts of your spending patterns\n• See income vs. expenses breakdown\n• Identify which categories you spend the most on\n→ Use this to find areas to cut costs",
        },
        {
          type: "feature",
          text: "AI ADVISOR (Coming Soon)\n• Ask questions about your finances\n• Get personalized recommendations\n• Understand your spending patterns\n→ Your personal financial coach!",
        },
        {
          type: "feature",
          text: "QUICK ADD BUTTON (Top Right)\n• Fast way to add transactions from anywhere\n• Available on every page\n• Perfect for quick entries on-the-go\n→ Use this for impulse spending to track immediately",
        },
      ],
    },
    {
      id: "common-mistakes",
      title: "⚠️ Common Mistakes to Avoid",
      description: "Learn from others' mistakes",
      content: [
        "❌ NOT UPDATING REGULARLY\n→ Updating once a month makes it easy to forget expenses\n→ Update at least weekly for accuracy\n\n",
        "❌ IGNORING SMALL EXPENSES\n→ A €5 coffee 5 days a week = €100/month\n→ Small expenses add up quickly\n→ Track everything, no matter how small\n\n",
        "❌ BEING TOO AMBITIOUS WITH TARGETS\n→ Setting unrealistic savings goals leads to failure\n→ Start small: 5% savings, then increase to 10%\n→ Celebrate small wins!\n\n",
        "❌ NOT REVIEWING YOUR DATA\n→ Just entering data isn't enough\n→ Review your Money Health Score monthly\n→ Look for patterns (which months are harder?)\n\n",
        "❌ FORGETTING ANNUAL EXPENSES\n→ Insurance, car registration, gifts are easy to forget\n→ Spread them across months for accurate tracking\n→ Example: €1,200/year insurance = €100/month\n\n",
        "❌ MIXING PERSONAL & BUSINESS FINANCES\n→ Keep separate if you have a side business\n→ This makes taxes easier and tracking clearer",
      ],
    },
    {
      id: "quick-tips",
      title: "💡 Quick Tips",
      description: "Fast wins for immediate improvement",
      content: [
        "• AUDIT YOUR SUBSCRIPTIONS\n→ Cancel what you don't use (Netflix, gym, apps)\n→ Save €50-200+ per month instantly\n\n",
        "• ROUND EXPENSES UP\n→ Record €5.50 as €6\n→ Creates buffer in your calculations\n\n",
        "• AUTOMATE YOUR SAVINGS\n→ Transfer to savings account right after payday\n→ 'Pay yourself first' mentality\n\n",
        "• SET SPENDING LIMITS BY CATEGORY\n→ Use your targets as limits\n→ Don't exceed them each month\n\n",
        "• USE CASH FOR DISCRETIONARY SPENDING\n→ Easier to track and limits impulse buys\n→ You physically see money leaving\n\n",
        "• FIND AN ACCOUNTABILITY PARTNER\n→ Share your goals with someone\n→ Weekly check-ins increase success\n\n",
        "• CELEBRATE SMALL WINS\n→ Hit your savings target? Celebrate!\n→ Motivation keeps you consistent",
      ],
    },
  ];

  const ToggleSection = ({ sectionId, title, description }: { sectionId: string; title: string; description: string }) => (
    <button
      onClick={() => setExpandedSection(expandedSection === sectionId ? null : sectionId)}
      className="w-full text-left bg-white border border-[#e5e5e5] rounded-lg p-4 hover:border-[#1db584] transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#1a1a1a]">{title}</h3>
          <p className="text-sm text-[#666666] mt-1">{description}</p>
        </div>
        <ChevronDown
          size={20}
          className={`text-[#1db584] transition-transform ${expandedSection === sectionId ? "rotate-180" : ""}`}
        />
      </div>
    </button>
  );

  return (
    <Layout currentPage="guides">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1db584] to-[#0f8a56] flex items-center justify-center text-white text-xl">
              📚
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1a1a1a]">Spendio Guides</h1>
              <p className="text-[#666666] mt-2">
                Learn how to get the most out of Spendio and build better financial habits
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-semibold text-green-900">Setup Time</span>
            </div>
            <p className="text-sm text-green-800">10-15 minutes to get started</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-900">Avg Improvement</span>
            </div>
            <p className="text-sm text-blue-800">+15 points on Money Health Score</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={20} className="text-orange-600" />
              <span className="font-semibold text-orange-900">Pro Tip</span>
            </div>
            <p className="text-sm text-orange-800">Update weekly for best results</p>
          </div>
        </div>

        {/* Guide Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id}>
              <ToggleSection sectionId={section.id} title={section.title} description={section.description} />

              {expandedSection === section.id && (
                <div className="bg-[#f9f9f9] border border-[#e5e5e5] border-t-0 rounded-b-lg p-6 space-y-4">
                  {section.content.map((item, idx) => {
                    if (typeof item === "string") {
                      return (
                        <p key={idx} className="text-[#1a1a1a] whitespace-pre-line leading-relaxed">
                          {item}
                        </p>
                      );
                    }

                    if (item.type === "step") {
                      return (
                        <div key={idx} className="bg-white border-l-4 border-[#1db584] pl-4 py-3 rounded">
                          <p className="text-[#1a1a1a] whitespace-pre-line leading-relaxed font-medium">{item.text}</p>
                        </div>
                      );
                    }

                    if (item.type === "metric") {
                      return (
                        <div key={idx} className="bg-white border border-[#e5e5e5] p-4 rounded-lg">
                          <p className="text-[#1a1a1a] whitespace-pre-line leading-relaxed text-sm">{item.text}</p>
                        </div>
                      );
                    }

                    if (item.type === "feature") {
                      return (
                        <div key={idx} className="bg-white border-l-4 border-blue-500 pl-4 py-3">
                          <p className="text-[#1a1a1a] whitespace-pre-line leading-relaxed text-sm font-medium">{item.text}</p>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#1db584] to-[#0f8a56] rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
          <p className="mb-4">Follow the 4-step setup above and you'll have your financial picture in 15 minutes.</p>
          <button
            onClick={() => navigate("/data")}
            className="px-4 py-2 bg-white text-[#1db584] font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Go to Financial Data
          </button>
        </div>
      </div>
    </Layout>
  );
}
