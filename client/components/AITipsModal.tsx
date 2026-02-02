import { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import { useSpendio } from "@/context/SpendioContext";
import { formatCurrency } from "@/utils/calculations";

interface AITipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AITipsModal({ isOpen, onClose }: AITipsModalProps) {
  const { user } = useSpendio();
  const [tips, setTips] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && user) {
      fetchTips();
    }
  }, [isOpen, user]);

  const generateLocalTips = (): string => {
    const currentMonth = user?.data.months[user.data.currentMonth];
    const currency = user?.currency || "EUR";

    if (!currentMonth) {
      return "📋 Setup Status:\nStart by adding your income and expenses to get personalized tips.\n\n💡 Quick Tips:\n• Track all your spending by category\n• Set savings goals\n• Review your budget monthly";
    }

    const totalIncome = currentMonth.totals.income || 0;
    const totalExpenses = currentMonth.totals.expenses || 0;
    const totalSavings = currentMonth.totals.savings || 0;
    const totalInvesting = currentMonth.totals.investing || 0;
    let tips = "";

    // Income status
    if (totalIncome === 0) {
      tips += "📋 Setup Status:\nNo income recorded yet. Add your monthly income to get started.\n\n";
    } else {
      tips += `📋 Setup Status:\nGreat! You've recorded ${formatCurrency(totalIncome, currency)} in income.\n\n`;
    }

    // Expense analysis
    if (totalExpenses > 0) {
      const expenseRatio = (totalExpenses / totalIncome * 100).toFixed(1);
      tips += "📊 Expense Analysis:\n";
      tips += `• Total spending: ${formatCurrency(totalExpenses, currency)} (${expenseRatio}% of income)\n`;

      // Top categories
      const categoryBreakdown: Record<string, number> = {};
      Object.entries(currentMonth.expenseBreakdown || {}).forEach(([key, value]) => {
        const category = key.split(":")[0];
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + value;
      });

      const sortedCategories = Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      if (sortedCategories.length > 0) {
        tips += "• Top spending categories:\n";
        sortedCategories.forEach(([category, amount]) => {
          const pct = ((amount / totalExpenses) * 100).toFixed(0);
          tips += `  - ${category}: ${formatCurrency(amount, currency)} (${pct}%)\n`;
        });
      }
      tips += "\n";
    }

    // Savings advice
    if (totalIncome > 0) {
      const savingsRate = ((totalSavings + totalInvesting) / totalIncome * 100).toFixed(1);
      tips += "💰 Savings & Investing:\n";
      if (totalSavings + totalInvesting === 0) {
        tips += "• No savings or investing this month. Try to save at least 10-20% of income.\n";
      } else {
        tips += `• Current savings rate: ${savingsRate}%\n`;
        if (parseFloat(savingsRate) < 10) {
          tips += "• Consider increasing savings to 10-20% of income.\n";
        }
      }
      tips += "\n";
    }

    // Debt advice
    if (user?.data.debts && user.data.debts.length > 0) {
      tips += "💳 Debt Management:\n";
      const totalMonthlyDebt = user.data.debts.reduce((sum, debt) => sum + (debt.monthly || 0), 0);
      if (totalMonthlyDebt > 0 && totalIncome > 0) {
        const debtRatio = (totalMonthlyDebt / totalIncome * 100).toFixed(1);
        tips += `• Monthly debt payments: ${formatCurrency(totalMonthlyDebt, currency)} (${debtRatio}% of income)\n`;
        if (parseFloat(debtRatio) > 30) {
          tips += "• Consider accelerating debt payoff to reduce financial stress.\n";
        } else {
          tips += "• Your debt level is manageable. Keep up the payments.\n";
        }
      }
      tips += "\n";
    }

    // General recommendations
    tips += "💡 Recommendations:\n";
    if (totalExpenses > totalIncome * 0.85) {
      tips += "• Your spending is high relative to income. Review and reduce non-essential expenses.\n";
    } else {
      tips += "• Good cashflow! Consider increasing savings or investing.\n";
    }

    if (!user?.data.snapshot?.emergency || user.data.snapshot.emergency < totalExpenses) {
      tips += "• Build an emergency fund (3-6 months of expenses).\n";
    }

    if (user?.data.targets?.savings === 0 && user?.data.targets?.investing === 0) {
      tips += "• Set savings and investing targets in the Wealth section.\n";
    }

    return tips;
  };

  const fetchTips = async () => {
    setLoading(true);
    setError("");
    setTips("");

    try {
      const currentMonth = user?.data.months[user.data.currentMonth];

      // Build detailed expense breakdown for AI analysis
      const expensesByCategory: Record<string, number> = {};
      const expensesBySubCategory: Record<string, number> = {};

      Object.entries(currentMonth?.expenseBreakdown || {}).forEach(([key, value]) => {
        const parts = key.split(":");
        const category = parts[0];
        const subCategory = parts.length > 1 ? parts[1] : "General";

        expensesByCategory[category] = (expensesByCategory[category] || 0) + value;
        expensesBySubCategory[key] = value;
      });

      // Build detailed income breakdown for AI analysis
      const incomeByType: Record<string, number> = {};
      const incomeBySource: Record<string, number> = {};

      Object.entries(currentMonth?.incomeBreakdown || {}).forEach(([key, value]) => {
        const parts = key.split(":");
        const type = parts[0];
        const source = parts.length > 1 ? parts[1] : "General";

        incomeByType[type] = (incomeByType[type] || 0) + value;
        incomeBySource[key] = value;
      });

      const payload = {
        now_month: user?.data.currentMonth,
        snapshot: user?.data.snapshot,
        debts: user?.data.debts,
        targets: user?.data.targets,
        month: currentMonth,
        // Add detailed breakdown for AI analysis
        expensesByCategory,
        expensesBySubCategory,
        incomeByType,
        incomeBySource,
        // Include expense categories for better context
        expenseCategories: user?.data.expenseCategories,
        incomeTypes: user?.data.incomeTypes,
      };

      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check if response is ok
      if (!response.ok) {
        // API not available, use local fallback
        const localTips = generateLocalTips();
        setTips(localTips);
        return;
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Invalid response type, use local fallback
        const localTips = generateLocalTips();
        setTips(localTips);
        return;
      }

      const responseText = await response.text();
      if (!responseText) {
        // Empty response, use local fallback
        const localTips = generateLocalTips();
        setTips(localTips);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        // JSON parse error, use local fallback
        const localTips = generateLocalTips();
        setTips(localTips);
        return;
      }

      if (data.error) {
        // API returned an error, use local fallback
        const localTips = generateLocalTips();
        setTips(localTips);
        return;
      }

      // Format the AI response with insights about specific expenses
      let formattedTips = "";

      if (data.setup?.message) {
        formattedTips += `📋 Setup Status:\n${data.setup.message}\n\n`;
      }

      // Add expense insights based on breakdown
      const totalExpenses = currentMonth?.totals.expenses || 0;

      if (totalExpenses > 0 && currentMonth?.expenseBreakdown) {
        const categoryBreakdown: Record<string, number> = {};
        Object.entries(currentMonth.expenseBreakdown).forEach(([key, value]) => {
          const category = key.split(":")[0];
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + value;
        });

        const sortedCategories = Object.entries(categoryBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);

        if (sortedCategories.length > 0) {
          formattedTips += "📊 Top Expense Categories:\n";
          sortedCategories.forEach(([category, amount], idx) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            formattedTips += `${idx + 1}. ${category}: €${amount.toFixed(2)} (${percentage}% of total)\n`;
          });
          formattedTips += "\n";
        }
      }

      if (data.actions?.items && data.actions.items.length > 0) {
        formattedTips += "💡 Recommended Actions:\n";
        data.actions.items.forEach((item: any, idx: number) => {
          formattedTips += `\n${idx + 1}. ${item.title}\n   ${item.reason}\n`;
        });
      }

      setTips(formattedTips || "No tips available at this time. Complete your setup to get personalized recommendations.");
    } catch (err) {
      // Network error or other issue, use local fallback
      const localTips = generateLocalTips();
      setTips(localTips);
      console.error("Error fetching tips:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">AI Tips & Insights</h2>
            <p className="text-sm text-[#666666] mt-1">Personalized recommendations based on your finances</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f3f3f3] rounded-lg transition text-[#666666]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader size={32} className="animate-spin text-[#1db584] mb-4" />
              <p className="text-[#666666]">Analyzing your finances...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">⚠️ {error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tips ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-[#1a1a1a] leading-relaxed">
                    {tips}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#666666]">No tips available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-[#e5e5e5] bg-[#f9f9f9]">
          <button
            onClick={fetchTips}
            disabled={loading}
            className="px-4 py-2 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-6 py-2 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
