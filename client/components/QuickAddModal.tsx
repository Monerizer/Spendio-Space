import React, { useState } from "react";
import { useQuickAdd } from "@/context/QuickAddContext";
import { useSpendio } from "@/context/SpendioContext";
import { formatCurrency } from "@/utils/calculations";
import { canAddTransaction } from "@/utils/subscriptionUtils";
import { UpgradeModal } from "./UpgradeModal";
import { CustomSelect } from "./CustomSelect";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export function QuickAddModal() {
  const { user, updateUser } = useSpendio();
  const { isOpen, closeQuickAdd } = useQuickAdd();
  const [quickForm, setQuickForm] = useState({
    transactionType: "expense",
    category: "",
    subCategory: "",
    amount: 0,
    description: "",
  });
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    features: [] as string[],
  });

  if (!user || !isOpen) return null;

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      income: "Income",
      expense: "Expense",
      savings: "Savings",
      investing: "Investment",
      debt_payment: "Debt Payment",
    };
    return labels[type] || "Transaction";
  };

  const showUpgradeModal = (type: string) => {
    const typeLabel = getTypeLabel(type);
    setUpgradeModal({
      isOpen: true,
      title: `Upgrade to Add More ${typeLabel}`,
      description: `Your free plan allows 1 ${typeLabel.toLowerCase()} entry per month. Upgrade to Pro for unlimited entries.`,
      features: [
        "Unlimited transactions",
        "Unlimited AI advisor",
        "Full analytics & export",
        "Advanced financial insights"
      ],
    });
  };

  const handleQuickAdd = () => {
    if (!quickForm.amount || quickForm.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check subscription limit for free users
    if (!canAddTransaction(user, quickForm.transactionType)) {
      showUpgradeModal(quickForm.transactionType);
      return;
    }

    proceedWithTransaction();
  };

  const proceedWithTransaction = () => {
    const updated = { ...user };
    if (!updated.data.months[user.data.currentMonth].tx) {
      updated.data.months[user.data.currentMonth].tx = [];
    }

    switch (quickForm.transactionType) {
      case "income":
        if (!quickForm.category || !quickForm.subCategory) {
          toast.error("Please select income type and source");
          return;
        }
        updated.data.months[user.data.currentMonth].tx.push({
          id: Math.random().toString(16).slice(2),
          type: "income",
          date: new Date().toISOString().split("T")[0],
          cat: quickForm.category,
          subCat: quickForm.subCategory,
          name: quickForm.description || quickForm.subCategory,
          amt: quickForm.amount,
        });
        break;
      case "expense":
        if (!quickForm.category || !quickForm.subCategory) {
          toast.error("Please select expense category and type");
          return;
        }
        updated.data.months[user.data.currentMonth].tx.push({
          id: Math.random().toString(16).slice(2),
          type: "expense",
          date: new Date().toISOString().split("T")[0],
          cat: quickForm.category,
          subCat: quickForm.subCategory,
          name: quickForm.description || quickForm.subCategory,
          amt: quickForm.amount,
        });
        break;
      case "savings":
        updated.data.months[user.data.currentMonth].tx.push({
          id: Math.random().toString(16).slice(2),
          type: "savings",
          date: new Date().toISOString().split("T")[0],
          cat: "Savings",
          subCat: quickForm.description || "Transfer",
          name: quickForm.description || "Savings deposit",
          amt: quickForm.amount,
        });
        break;
      case "investing":
        updated.data.months[user.data.currentMonth].tx.push({
          id: Math.random().toString(16).slice(2),
          type: "investing",
          date: new Date().toISOString().split("T")[0],
          cat: "Investing",
          subCat: quickForm.description || "Investment",
          name: quickForm.description || "Investment",
          amt: quickForm.amount,
        });
        break;
      case "debt_payment":
        if (!quickForm.category) {
          toast.error("Please select a debt");
          return;
        }
        const debtName = updated.data.debts.find((d) => d.id === quickForm.category)?.name || "Debt Payment";
        updated.data.months[user.data.currentMonth].tx.push({
          id: Math.random().toString(16).slice(2),
          type: "debt_payment",
          date: new Date().toISOString().split("T")[0],
          cat: debtName,
          subCat: quickForm.description || "Payment",
          name: quickForm.description || `Payment to ${debtName}`,
          amt: quickForm.amount,
        });
        break;
    }

    // Recalculate totals and update breakdown maps
    const currentMonth = updated.data.months[user.data.currentMonth];
    const income = (currentMonth.tx || [])
      .filter((tx: any) => ["income", "salary", "business", "freelance", "investments", "side_hustle"].includes(tx.type.toLowerCase()))
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const expenses = (currentMonth.tx || [])
      .filter((tx: any) => tx.type.toLowerCase() === "expense")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const savings = (currentMonth.tx || [])
      .filter((tx: any) => tx.type === "savings")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const investing = (currentMonth.tx || [])
      .filter((tx: any) => tx.type === "investing")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const emergency = (currentMonth.tx || [])
      .filter((tx: any) => tx.type === "emergency_fund")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const debtPay = (currentMonth.tx || [])
      .filter((tx: any) => tx.type === "debt_payment")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    currentMonth.totals.income = income;
    currentMonth.totals.expenses = expenses;
    currentMonth.totals.savings = savings;
    currentMonth.totals.investing = investing;
    currentMonth.totals.debtPay = debtPay;

    // Rebuild breakdown maps
    currentMonth.incomeBreakdown = {};
    currentMonth.expenseBreakdown = {};

    (currentMonth.tx || []).forEach((tx: any) => {
      const key = tx.subCat ? `${tx.cat}:${tx.subCat}` : tx.cat;
      if (["income", "salary", "business", "freelance", "investments", "side_hustle"].includes(tx.type.toLowerCase())) {
        currentMonth.incomeBreakdown[key] = (currentMonth.incomeBreakdown[key] || 0) + tx.amt;
      } else if (tx.type.toLowerCase() === "expense") {
        currentMonth.expenseBreakdown[key] = (currentMonth.expenseBreakdown[key] || 0) + tx.amt;
      }
    });

    // Update balance snapshots for all transaction types
    if (!updated.data.snapshot) {
      updated.data.snapshot = { cash: 0, emergency: 0, savings: 0, investing: 0, debt: 0 };
    }

    if (quickForm.transactionType === "income") {
      updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) + quickForm.amount;
    } else if (quickForm.transactionType === "expense") {
      updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) - quickForm.amount;
    } else if (quickForm.transactionType === "savings") {
      updated.data.snapshot.savings = (updated.data.snapshot.savings || 0) + quickForm.amount;
    } else if (quickForm.transactionType === "investing") {
      updated.data.snapshot.investing = (updated.data.snapshot.investing || 0) + quickForm.amount;
    } else if (quickForm.transactionType === "debt_payment") {
      // Debt payment reduces cash
      updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) - quickForm.amount;
    }

    updateUser(updated);
    closeQuickAdd();

    // Show success toast based on transaction type
    const typeLabels: Record<string, string> = {
      income: "Income",
      expense: "Expense",
      savings: "Savings",
      investing: "Investment",
      debt_payment: "Debt Payment",
    };
    const label = typeLabels[quickForm.transactionType] || "Transaction";
    toast.success(`${label} added: ${formatCurrency(quickForm.amount)}`);

    setQuickForm({ transactionType: "expense", category: "", subCategory: "", amount: 0, description: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        title={upgradeModal.title}
        description={upgradeModal.description}
        features={upgradeModal.features}
        onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
      />

      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full max-h-[80vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Quick Add Transaction</h2>
            <p className="text-sm text-[#666666] mt-1">Add any type of transaction in one place</p>
          </div>
          <button
            onClick={closeQuickAdd}
            className="p-2 hover:bg-[#f3f3f3] rounded-lg transition text-[#666666]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Transaction Type */}
          <CustomSelect
            label="Transaction Type"
            value={quickForm.transactionType}
            onChange={(value) => {
              setQuickForm({ ...quickForm, transactionType: value as any, category: "", subCategory: "" });
            }}
            options={[
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
              { value: "savings", label: "Savings Deposit" },
              { value: "investing", label: "Investment" },
              { value: "debt_payment", label: "Debt Payment" },
            ]}
            placeholder="Select transaction type..."
          />

          {/* Category/Type Selection */}
          {quickForm.transactionType === "income" && (
            <CustomSelect
              label="Income Type"
              value={quickForm.category}
              onChange={(value) => {
                setQuickForm({ ...quickForm, category: value, subCategory: "" });
              }}
              options={[
                { value: "", label: "Select income type..." },
                ...(user.data.incomeTypes as any).map((type) => ({
                  value: type.name,
                  label: type.name,
                })),
              ]}
              placeholder="Select income type..."
            />
          )}

          {quickForm.transactionType === "income" && quickForm.category && (
            <CustomSelect
              label="Source"
              value={quickForm.subCategory}
              onChange={(value) => setQuickForm({ ...quickForm, subCategory: value })}
              options={[
                { value: "", label: "Select source..." },
                ...((user.data.incomeTypes as any)
                  .find((t) => t.name === quickForm.category)
                  ?.subCategories.map((sub) => ({
                    value: sub,
                    label: sub,
                  })) || []),
              ]}
              placeholder="Select source..."
            />
          )}

          {quickForm.transactionType === "expense" && (
            <CustomSelect
              label="Expense Category"
              value={quickForm.category}
              onChange={(value) => {
                setQuickForm({ ...quickForm, category: value, subCategory: "" });
              }}
              options={[
                { value: "", label: "Select category..." },
                ...user.data.expenseCategories.map((cat) => ({
                  value: cat.name,
                  label: cat.name,
                })),
              ]}
              placeholder="Select category..."
            />
          )}

          {quickForm.transactionType === "expense" && quickForm.category && (
            <CustomSelect
              label="Expense Type"
              value={quickForm.subCategory}
              onChange={(value) => setQuickForm({ ...quickForm, subCategory: value })}
              options={[
                { value: "", label: "Select type..." },
                ...(user.data.expenseCategories
                  .find((c) => c.name === quickForm.category)
                  ?.subCategories.map((sub) => ({
                    value: sub,
                    label: sub,
                  })) || []),
              ]}
              placeholder="Select type..."
            />
          )}

          {quickForm.transactionType === "debt_payment" && (
            <CustomSelect
              label="Select Debt"
              value={quickForm.category}
              onChange={(value) => setQuickForm({ ...quickForm, category: value })}
              options={[
                { value: "", label: "Select debt..." },
                ...user.data.debts.map((debt) => ({
                  value: debt.id,
                  label: `${debt.name} (${debt.type})`,
                })),
              ]}
              placeholder="Select debt..."
            />
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={quickForm.amount || ""}
              onChange={(e) => setQuickForm({ ...quickForm, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description (optional)</label>
            <textarea
              placeholder="Add notes about this transaction..."
              value={quickForm.description}
              onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-[#e5e5e5] bg-[#f9f9f9]">
          <button
            onClick={closeQuickAdd}
            className="px-4 py-2 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleQuickAdd}
            className="ml-auto px-6 py-2 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
          >
            Add Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
