import React, { useState, useMemo } from "react";
import { useSpendio } from "@/context/SpendioContext";
import { Layout } from "@/components/Layout";
import { formatCurrency } from "@/utils/calculations";
import { CustomSelect } from "@/components/CustomSelect";
import { Trash2, Search, Filter, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  month: string;
}

export default function TransactionHistory() {
  const { user, updateUser } = useSpendio();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!user) return null;

  // Collect all transactions from all months
  const allTransactions: Transaction[] = useMemo(() => {
    const transactions: Transaction[] = [];

    const getTypeLabel = (type: string) => {
      switch (type) {
        case "debt_payment":
          return "Debt Payment";
        default:
          return type.charAt(0).toUpperCase() + type.slice(1);
      }
    };

    Object.entries(user.data.months).forEach(([monthKey, monthData]) => {
      // Read from unified tx array (all transaction types are stored here)
      (monthData.tx || []).forEach((tx: any) => {
        transactions.push({
          id: tx.id || Math.random().toString(16),
          description: tx.name || tx.desc || getTypeLabel(tx.type),
          amount: tx.amt || 0,
          type: tx.type || "expense",
          category: tx.cat || "General",
          date: new Date(tx.date || `${monthKey}-01`).toISOString(),
          month: monthKey,
        });
      });
    });

    return transactions;
  }, [user]);

  // Filter and search
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(term) ||
          tx.category.toLowerCase().includes(term) ||
          tx.amount.toString().includes(term)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((tx) => tx.category === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTransactions, searchTerm, typeFilter, categoryFilter, sortBy]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(allTransactions.map((tx) => tx.category))).sort();
  }, [allTransactions]);

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "#22c55e";
      case "expense":
        return "#ef4444";
      case "savings":
        return "#3b82f6";
      case "investing":
        return "#8b5cf6";
      case "debt_payment":
        return "#f97316";
      default:
        return "#666666";
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "debt_payment":
        return "Debt Payment";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Clear all transactions
  const handleClearAllTransactions = () => {
    if (!user) return;

    const updatedMonths = { ...user.data.months };
    Object.keys(updatedMonths).forEach((monthKey) => {
      updatedMonths[monthKey] = {
        ...updatedMonths[monthKey],
        tx: [], // Clear the unified transaction array
        totals: {
          income: 0,
          expenses: 0,
          savings: 0,
          investing: 0,
          debtPay: 0,
        },
        incomeBreakdown: {},
        expenseBreakdown: {},
      };
    });

    updateUser({
      ...user,
      data: { ...user.data, months: updatedMonths },
    });

    setShowClearConfirm(false);
    toast.success("All transactions cleared!");
  };

  return (
    <Layout currentPage="history">
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
        .animate-slide-up { animation: slideInUp 0.5s ease-out; }
        .animate-slide-down { animation: slideInDown 0.5s ease-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .tx-row { transition: all 0.3s ease; }
        .tx-row:hover { background-color: #f9f9f9; transform: translateX(4px); }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a]">Transaction History</h1>
            <p className="text-sm text-[#666666] mt-1">All your financial transactions in one place</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-[#f0f0f0] text-sm font-semibold text-[#1a1a1a] rounded-lg">
              {filteredTransactions.length} transactions
            </div>
            {allTransactions.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a1a]">Clear All Transactions?</h2>
              </div>
              <p className="text-[#666666]">This action will permanently delete all {allTransactions.length} transactions. This cannot be undone.</p>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllTransactions}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 space-y-4 animate-slide-up">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Search by description, category, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1db584] focus:border-transparent transition"
            />
          </div>

          {/* Filter & Sort Controls */}
          <div className="grid md:grid-cols-3 gap-3">
            {/* Type Filter */}
            <CustomSelect
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "All Types" },
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
                { value: "savings", label: "Savings" },
                { value: "investing", label: "Investing" },
                { value: "debt_payment", label: "Debt Payment" },
              ]}
              placeholder="All Types"
              className="text-sm"
            />

            {/* Category Filter */}
            <CustomSelect
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "all", label: "All Categories" },
                ...uniqueCategories.map((cat) => ({
                  value: cat,
                  label: cat,
                })),
              ]}
              placeholder="All Categories"
              className="text-sm"
            />

            {/* Sort */}
            <CustomSelect
              label="Sort By"
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              options={[
                { value: "date-desc", label: "Newest First" },
                { value: "date-asc", label: "Oldest First" },
                { value: "amount-desc", label: "Highest Amount" },
                { value: "amount-asc", label: "Lowest Amount" },
              ]}
              placeholder="Newest First"
              className="text-sm"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-[#e5e5e5]">
              {filteredTransactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="tx-row p-4 flex items-center justify-between animate-fade-in"
                  style={{ animationDelay: `${idx * 0.02}s` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getTypeColor(tx.type) }}
                      />
                      <div>
                        <h4 className="font-semibold text-[#1a1a1a]">{tx.description}</h4>
                        <div className="text-xs text-[#666666] space-x-3 mt-1">
                          <span>
                            <strong>Type:</strong> {getTypeLabel(tx.type)}
                          </span>
                          <span>
                            <strong>Category:</strong> {tx.category}
                          </span>
                          <span>
                            <strong>Date:</strong> {new Date(tx.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div
                      className="text-lg font-bold"
                      style={{ color: getTypeColor(tx.type) }}
                    >
                      {tx.type === "expense" || tx.type === "debt_payment" ? "-" : "+"}
                      {formatCurrency(Math.abs(tx.amount))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center animate-fade-in">
              <Filter size={48} className="text-[#e5e5e5] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">No transactions found</h3>
              <p className="text-[#666666]">
                {allTransactions.length === 0
                  ? "Start by adding your first transaction in Financial Data"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {filteredTransactions.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4 animate-slide-up">
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-4">
              <div className="text-xs text-[#666666] font-medium">Total Transactions</div>
              <div className="text-2xl font-bold text-[#1a1a1a] mt-2">
                {filteredTransactions.length}
              </div>
            </div>
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-4">
              <div className="text-xs text-[#666666] font-medium">Total Income</div>
              <div className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(
                  filteredTransactions
                    .filter((tx) => tx.type === "income")
                    .reduce((sum, tx) => sum + tx.amount, 0)
                )}
              </div>
            </div>
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-4">
              <div className="text-xs text-[#666666] font-medium">Total Expenses</div>
              <div className="text-2xl font-bold text-red-600 mt-2">
                {formatCurrency(
                  filteredTransactions
                    .filter((tx) => tx.type === "expense")
                    .reduce((sum, tx) => sum + tx.amount, 0)
                )}
              </div>
            </div>
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-4">
              <div className="text-xs text-[#666666] font-medium">Net</div>
              <div
                className="text-2xl font-bold mt-2"
                style={{
                  color:
                    filteredTransactions.reduce((sum, tx) => {
                      if (tx.type === "income" || tx.type === "savings" || tx.type === "investing") return sum + tx.amount;
                      return sum - tx.amount;
                    }, 0) >= 0
                      ? "#22c55e"
                      : "#ef4444",
                }}
              >
                {formatCurrency(
                  filteredTransactions.reduce((sum, tx) => {
                    if (tx.type === "income" || tx.type === "savings" || tx.type === "investing") return sum + tx.amount;
                    return sum - tx.amount;
                  }, 0)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
