import React, { useState, useEffect } from "react";
import { useSpendio } from "@/context/SpendioContext";
import { useQuickAdd } from "@/context/QuickAddContext";
import { Layout } from "@/components/Layout";
import { CustomSelect } from "@/components/CustomSelect";
import { formatCurrency, computeNet, calculateMoneyHealthScore } from "@/utils/calculations";
import { UpgradeModal } from "@/components/UpgradeModal";
import { canAddTransaction, getTransactionCount, isFreePlan } from "@/utils/subscriptionUtils";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface TransactionEntry {
  id: string;
  type: "income" | "expense";
  category: string;
  subCategory: string;
  amount: number;
  description?: string;
  date: string;
}

export default function FinancialData() {
  const { user, updateUser } = useSpendio();
  const { isOpen: quickAddOpen, closeQuickAdd, openQuickAdd } = useQuickAdd();
  const [activeTab, setActiveTab] = useState<"income" | "expenses" | "savings" | "investing" | "debts" | "balances" | "categories">("balances");
  const [newCategory, setNewCategory] = useState("");

  // Form state for adding income/expenses
  const [incomeForm, setIncomeForm] = useState({ type: "", subType: "", amount: 0, description: "" });
  const [expenseForm, setExpenseForm] = useState({ category: "", subCategory: "", amount: 0, description: "" });

  // Form state for savings/investing/debt
  const [savingsForm, setSavingsForm] = useState({ amount: 0, description: "", type: "savings" });
  const [investingForm, setInvestingForm] = useState({ amount: 0, description: "", type: "investing" });
  const [debtForm2, setDebtForm2] = useState({ amount: 0, description: "", debtId: "", type: "debt_payment" });

  // Balance form state - initialize and sync with user data
  const [balanceForm, setBalanceForm] = useState(() => ({
    cash: user.data.snapshot?.cash || 0,
    emergency: user.data.snapshot?.emergency || 0,
    savings: user.data.snapshot?.savings || 0,
    investing: user.data.snapshot?.investing || 0,
  }));
  const [emergencyFundForm, setEmergencyFundForm] = useState({ amount: 0, description: "" });
  const [cashForm, setCashForm] = useState({ amount: 0, description: "" });

  // Loan handling state
  const [showLoanFields, setShowLoanFields] = useState(false);
  const [loanPaymentType, setLoanPaymentType] = useState<"monthly" | "full">("monthly");
  const [loanMonthlyAmount, setLoanMonthlyAmount] = useState(0);
  const [selectedDebtForLoan, setSelectedDebtForLoan] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ amount: 0, description: "" });
  const [quickForm, setQuickForm] = useState({
    transactionType: "expense", // expense, income, savings, investing, debt_payment
    category: "",
    subCategory: "",
    amount: 0,
    description: "",
  });

  // AI assessment state
  const [aiAssessmentOpen, setAiAssessmentOpen] = useState(false);
  const [aiAssessmentLoading, setAiAssessmentLoading] = useState(false);
  const [aiAssessmentResult, setAiAssessmentResult] = useState<string>("");
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

  // Upgrade modal state
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    features: [] as string[],
    category: null as string | null,
  });

  // State for mobile label visibility
  const [visibleLabel, setVisibleLabel] = useState<string | null>(null);

  if (!user) return null;

  // Sync balanceForm with user snapshot whenever it changes (from transactions, etc)
  useEffect(() => {
    setBalanceForm({
      cash: user.data.snapshot?.cash || 0,
      emergency: user.data.snapshot?.emergency || 0,
      savings: user.data.snapshot?.savings || 0,
      investing: user.data.snapshot?.investing || 0,
    });
  }, [user.data.snapshot?.cash, user.data.snapshot?.savings, user.data.snapshot?.emergency, user.data.snapshot?.investing]);

  // Sync snapshot when transactions change to ensure consistency
  useEffect(() => {
    const month = user.data.months[user.data.currentMonth];
    if (!month?.tx || month.tx.length === 0) return;

    // Check if there's been a change to transactions
    // This ensures snapshot stays in sync with the actual data
    const currentMonth = user.data.months[user.data.currentMonth];
    setBalanceForm({
      cash: user.data.snapshot?.cash || 0,
      emergency: user.data.snapshot?.emergency || 0,
      savings: user.data.snapshot?.savings || 0,
      investing: user.data.snapshot?.investing || 0,
    });
  }, [user.data.months[user.data.currentMonth]?.tx?.length, user]);

  const currentMonth = user.data.months[user.data.currentMonth];
  const t = currentMonth.totals;

  // Function to recalculate totals from transactions
  const recalculateTotals = (month: any) => {
    // Recalculate totals from transactions
    const income = (month.tx || [])
      .filter((tx: any) => ["income", "salary", "business", "freelance", "investments", "side_hustle"].includes(tx.type.toLowerCase()))
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const expenses = (month.tx || [])
      .filter((tx: any) => tx.type.toLowerCase() === "expense")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const savings = (month.tx || [])
      .filter((tx: any) => tx.type === "savings")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const investing = (month.tx || [])
      .filter((tx: any) => tx.type === "investing")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    const debtPay = (month.tx || [])
      .filter((tx: any) => tx.type === "debt_payment")
      .reduce((sum: number, tx: any) => sum + tx.amt, 0);

    month.totals.income = income;
    month.totals.expenses = expenses;
    month.totals.savings = savings;
    month.totals.investing = investing;
    month.totals.debtPay = debtPay;

    // Rebuild breakdown maps
    month.incomeBreakdown = {};
    month.expenseBreakdown = {};

    (month.tx || []).forEach((tx: any) => {
      const key = tx.subCat ? `${tx.cat}:${tx.subCat}` : tx.cat;
      if (["income", "salary", "business", "freelance", "investments", "side_hustle"].includes(tx.type.toLowerCase())) {
        month.incomeBreakdown[key] = (month.incomeBreakdown[key] || 0) + tx.amt;
      } else if (tx.type.toLowerCase() === "expense") {
        month.expenseBreakdown[key] = (month.expenseBreakdown[key] || 0) + tx.amt;
      }
    });
  };

  // Get all transactions for current month
  const getTransactions = (type: "income" | "expense"): TransactionEntry[] => {
    return (currentMonth.tx || []).filter((tx: any) => {
      if (type === "income") return ["income", "salary", "business", "freelance", "investments", "side_hustle"].includes(tx.type.toLowerCase());
      return tx.type.toLowerCase() === "expense";
    }).map((tx: any) => ({
      id: tx.id,
      type: type,
      category: tx.cat,
      subCategory: tx.subCat || "General",
      amount: tx.amt,
      description: tx.name,
      date: tx.date || new Date().toISOString().split("T")[0],
    }));
  };

  const incomeTransactions = getTransactions("income");
  const expenseTransactions = getTransactions("expense");

  // Helper to show upgrade modal
  const showUpgradeModal = (categoryType: "income" | "expenses" | "savings" | "investing" | "debt") => {
    const categoryLabels = {
      income: "Income",
      expenses: "Expenses",
      savings: "Savings",
      investing: "Investing",
      debt: "Debt Payments",
    };

    setUpgradeModal({
      isOpen: true,
      title: `Upgrade to Add More ${categoryLabels[categoryType]}`,
      description: `Your free plan allows 1 ${categoryLabels[categoryType]} entry per month. Upgrade to Pro for unlimited entries.`,
      features: [
        "Unlimited transactions",
        "Unlimited AI advisor",
        "Full analytics & export",
        "Advanced financial insights",
      ],
      category: categoryType,
    });
  };

  // Add income
  const handleAddIncome = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    // Check subscription limit - show upgrade modal on 2nd transaction
    if (!canAddTransaction(user, "income")) {
      setUpgradeModal({
        isOpen: true,
        title: "Upgrade to Add More Income",
        description: "Your free plan allows 1 Income entry per month. Upgrade to Pro for unlimited entries.",
        features: [
          "Unlimited transactions",
          "Unlimited AI advisor",
          "Full analytics & export",
          "Advanced financial insights"
        ],
        category: "income",
      });
      return;
    }

    if (!incomeForm.type || !incomeForm.subType || incomeForm.amount <= 0) {
      toast.error("Please fill all fields");
      return;
    }
    const updated = { ...user };
    if (!updated.data.months[user.data.currentMonth].tx) {
      updated.data.months[user.data.currentMonth].tx = [];
    }
    updated.data.months[user.data.currentMonth].tx.push({
      id: Math.random().toString(16).slice(2),
      type: "income",
      date: new Date().toISOString().split("T")[0],
      cat: incomeForm.type,
      subCat: incomeForm.subType,
      name: incomeForm.description || incomeForm.subType,
      amt: incomeForm.amount,
    });
    recalculateTotals(updated.data.months[user.data.currentMonth]);
    // Auto-update cash balance when adding income
    if (!updated.data.snapshot) {
      updated.data.snapshot = { cash: 0, emergency: 0, savings: 0, investing: 0, debt: 0 };
    }
    updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) + incomeForm.amount;
    updateUser(updated);
    setIncomeForm({ type: "", subType: "", amount: 0, description: "" });
    toast.success(`${formatCurrency(incomeForm.amount, user.currency || "EUR")} income added successfully!`);
  };

  // Add expense
  const handleAddExpense = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    // Check subscription limit - show upgrade modal on 2nd transaction
    if (!canAddTransaction(user, "expenses")) {
      setUpgradeModal({
        isOpen: true,
        title: "Upgrade to Add More Expenses",
        description: "Your free plan allows 1 Expense entry per month. Upgrade to Pro for unlimited entries.",
        features: [
          "Unlimited transactions",
          "Unlimited AI advisor",
          "Full analytics & export",
          "Advanced financial insights"
        ],
        category: "expenses",
      });
      return;
    }

    if (!expenseForm.category || !expenseForm.subCategory || expenseForm.amount <= 0) {
      toast.error("Please fill all fields");
      return;
    }

    // Special validation for loan payments
    if (expenseForm.category === "Loan" && !selectedDebtForLoan) {
      toast.error("Please select a debt to apply this loan payment to");
      return;
    }

    const updated = { ...user };
    if (!updated.data.months[user.data.currentMonth].tx) {
      updated.data.months[user.data.currentMonth].tx = [];
    }

    // Add the expense transaction
    updated.data.months[user.data.currentMonth].tx.push({
      id: Math.random().toString(16).slice(2),
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      cat: expenseForm.category,
      subCat: expenseForm.subCategory,
      name: expenseForm.description || expenseForm.subCategory,
      amt: expenseForm.amount,
    });

    // Handle loan payment - update debt status
    if (expenseForm.category === "Loan" && selectedDebtForLoan) {
      const debtIndex = updated.data.debts.findIndex((d) => d.id === selectedDebtForLoan);
      if (debtIndex !== -1) {
        if (loanPaymentType === "full") {
          // Full repayment - deduct from total debt
          updated.data.debts[debtIndex].total = Math.max(0, updated.data.debts[debtIndex].total - expenseForm.amount);
        } else {
          // Monthly installment - update monthly payment amount
          updated.data.debts[debtIndex].monthly = loanMonthlyAmount > 0 ? loanMonthlyAmount : expenseForm.amount;
        }
      }
    }

    recalculateTotals(updated.data.months[user.data.currentMonth]);
    // Auto-update cash balance when adding expense (deduct from cash)
    if (!updated.data.snapshot) {
      updated.data.snapshot = { cash: 0, emergency: 0, savings: 0, investing: 0, debt: 0 };
    }
    updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) - expenseForm.amount;
    updateUser(updated);

    // Reset forms
    setExpenseForm({ category: "", subCategory: "", amount: 0, description: "" });
    setShowLoanFields(false);
    setSelectedDebtForLoan("");
    setLoanPaymentType("monthly");
    setLoanMonthlyAmount(0);
    toast.success(`${formatCurrency(expenseForm.amount, user.currency || "EUR")} expense added successfully!`);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    const updated = { ...user };
    const txToDelete = updated.data.months[user.data.currentMonth].tx?.find((t: any) => t.id === id);

    // Update snapshot balances based on transaction type
    if (txToDelete) {
      if (txToDelete.type === "income") {
        updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) - txToDelete.amt;
      } else if (txToDelete.type === "expense") {
        updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) + txToDelete.amt;
      } else if (txToDelete.type === "savings") {
        updated.data.snapshot.savings = (updated.data.snapshot.savings || 0) - txToDelete.amt;
      } else if (txToDelete.type === "investing") {
        updated.data.snapshot.investing = (updated.data.snapshot.investing || 0) - txToDelete.amt;
      } else if (txToDelete.type === "emergency_fund") {
        updated.data.snapshot.emergency = (updated.data.snapshot.emergency || 0) - txToDelete.amt;
      } else if (txToDelete.type === "cash_adjustment") {
        updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) - txToDelete.amt;
      }
    }

    updated.data.months[user.data.currentMonth].tx = (updated.data.months[user.data.currentMonth].tx || []).filter(
      (tx: any) => tx.id !== id
    );
    recalculateTotals(updated.data.months[user.data.currentMonth]);
    updateUser(updated);
    toast.success("Transaction deleted successfully!");
  };

  // Edit transaction
  const handleEditTransaction = (id: string, newAmount: number, newDescription: string) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    const updated = { ...user };
    const tx = updated.data.months[user.data.currentMonth].tx?.find((t: any) => t.id === id);
    if (tx) {
      const oldAmount = tx.amt;
      const difference = newAmount - oldAmount;

      // Update snapshot balances based on transaction type
      if (tx.type === "income") {
        updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) + difference;
      } else if (tx.type === "expense") {
        updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) - difference;
      } else if (tx.type === "savings") {
        updated.data.snapshot.savings = (updated.data.snapshot.savings || 0) + difference;
      } else if (tx.type === "investing") {
        updated.data.snapshot.investing = (updated.data.snapshot.investing || 0) + difference;
      } else if (tx.type === "emergency_fund") {
        updated.data.snapshot.emergency = (updated.data.snapshot.emergency || 0) + difference;
      } else if (tx.type === "cash_adjustment") {
        updated.data.snapshot.cash = (updated.data.snapshot.cash || 0) + difference;
      }

      tx.amt = newAmount;
      tx.name = newDescription || tx.subCat;
    }
    recalculateTotals(updated.data.months[user.data.currentMonth]);
    updateUser(updated);
    setEditingId(null);
    toast.success("Transaction updated successfully!");
  };

  const handleAddCategory = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    if (!newCategory.trim()) return;
    const catName = newCategory.trim();
    if ((user.data.expenseCategories as any).find((c) => c.name === catName)) {
      toast.error("Category already exists");
      return;
    }
    const updated = { ...user };
    (updated.data.expenseCategories as any).push({
      name: catName,
      subCategories: ["General", "Other"],
    });
    updateUser(updated);
    setNewCategory("");
    toast.success(`Category "${catName}" added successfully!`);
  };

  const handleRemoveCategory = (category: string) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    const updated = { ...user };
    updated.data.expenseCategories = (updated.data.expenseCategories as any).filter((c) => c.name !== category);
    updateUser(updated);
  };

  const handleSaveWealthTarget = (type: "savings" | "investing") => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    const value = Number((document.getElementById(`target-${type}`) as HTMLInputElement)?.value) || 0;
    const updated = { ...user };
    updated.data.targets[type] = value;
    updateUser(updated);
  };

  // Add savings transaction
  const handleAddSavings = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    // Check subscription limit - show upgrade modal on 2nd transaction
    if (!canAddTransaction(user, "savings")) {
      setUpgradeModal({
        isOpen: true,
        title: "Upgrade to Add More Savings",
        description: "Your free plan allows 1 Savings entry per month. Upgrade to Pro for unlimited entries.",
        features: [
          "Unlimited transactions",
          "Unlimited AI advisor",
          "Full analytics & export",
          "Advanced financial insights"
        ],
        category: "savings",
      });
      return;
    }

    if (savingsForm.amount <= 0) {
      toast.error("Please enter a savings amount");
      return;
    }
    const updated = { ...user };
    if (!updated.data.months[user.data.currentMonth].tx) {
      updated.data.months[user.data.currentMonth].tx = [];
    }
    updated.data.months[user.data.currentMonth].tx.push({
      id: Math.random().toString(16).slice(2),
      type: "savings",
      date: new Date().toISOString().split("T")[0],
      cat: "Savings",
      subCat: savingsForm.description || "Transfer",
      name: savingsForm.description || "Savings deposit",
      amt: savingsForm.amount,
    });
    recalculateTotals(updated.data.months[user.data.currentMonth]);
    // Also update the balance snapshot
    updated.data.snapshot.savings = (updated.data.snapshot.savings || 0) + savingsForm.amount;
    updateUser(updated);
    setSavingsForm({ amount: 0, description: "", type: "savings" });
    // Update balance form to reflect the new balance
    setBalanceForm({ ...balanceForm, savings: updated.data.snapshot.savings });
    toast.success(`${formatCurrency(savingsForm.amount, user.currency || "EUR")} savings recorded!`);
  };

  // Add investing transaction
  const handleAddInvesting = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    // Check subscription limit - show upgrade modal on 2nd transaction
    if (!canAddTransaction(user, "investing")) {
      setUpgradeModal({
        isOpen: true,
        title: "Upgrade to Add More Investments",
        description: "Your free plan allows 1 Investing entry per month. Upgrade to Pro for unlimited entries.",
        features: [
          "Unlimited transactions",
          "Unlimited AI advisor",
          "Full analytics & export",
          "Advanced financial insights"
        ],
        category: "investing",
      });
      return;
    }

    if (investingForm.amount <= 0) {
      toast.error("Please enter an investing amount");
      return;
    }
    const updated = { ...user };
    if (!updated.data.months[user.data.currentMonth].tx) {
      updated.data.months[user.data.currentMonth].tx = [];
    }
    updated.data.months[user.data.currentMonth].tx.push({
      id: Math.random().toString(16).slice(2),
      type: "investing",
      date: new Date().toISOString().split("T")[0],
      cat: "Investing",
      subCat: investingForm.description || "Investment",
      name: investingForm.description || "Investment",
      amt: investingForm.amount,
    });
    recalculateTotals(updated.data.months[user.data.currentMonth]);
    // Also update the balance snapshot
    updated.data.snapshot.investing = (updated.data.snapshot.investing || 0) + investingForm.amount;
    updateUser(updated);
    setInvestingForm({ amount: 0, description: "", type: "investing" });
    // Update balance form to reflect the new balance
    setBalanceForm({ ...balanceForm, investing: updated.data.snapshot.investing });
    toast.success(`${formatCurrency(investingForm.amount, user.currency || "EUR")} investment recorded!`);
  };

  // Add debt payment transaction
  const handleAddDebtPayment = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    // Check subscription limit - show upgrade modal on 2nd transaction
    if (!canAddTransaction(user, "debt")) {
      setUpgradeModal({
        isOpen: true,
        title: "Upgrade to Add More Debt Payments",
        description: "Your free plan allows 1 Debt Payment entry per month. Upgrade to Pro for unlimited entries.",
        features: [
          "Unlimited transactions",
          "Unlimited AI advisor",
          "Full analytics & export",
          "Advanced financial insights"
        ],
        category: "debt",
      });
      return;
    }

    if (debtForm2.amount <= 0) {
      toast.error("Please enter a payment amount");
      return;
    }
    const updated = { ...user };
    if (!updated.data.months[user.data.currentMonth].tx) {
      updated.data.months[user.data.currentMonth].tx = [];
    }
    const debtName = updated.data.debts.find((d) => d.id === debtForm2.debtId)?.name || "Debt Payment";
    updated.data.months[user.data.currentMonth].tx.push({
      id: Math.random().toString(16).slice(2),
      type: "debt_payment",
      date: new Date().toISOString().split("T")[0],
      cat: debtName,
      subCat: debtForm2.description || "Payment",
      name: debtForm2.description || `Payment to ${debtName}`,
      amt: debtForm2.amount,
    });
    recalculateTotals(updated.data.months[user.data.currentMonth]);
    updateUser(updated);
    setDebtForm2({ amount: 0, description: "", debtId: "", type: "debt_payment" });
    toast.success(`${formatCurrency(debtForm2.amount, user.currency || "EUR")} debt payment recorded!`);
  };

  // Get savings/investing/debt transactions
  const getSavingsTransactions = () => {
    return (currentMonth.tx || []).filter((tx: any) => tx.type === "savings");
  };

  const getInvestingTransactions = () => {
    return (currentMonth.tx || []).filter((tx: any) => tx.type === "investing");
  };

  const getDebtPaymentTransactions = () => {
    return (currentMonth.tx || []).filter((tx: any) => tx.type === "debt_payment");
  };

  // AI assess transaction
  const handleAssessTransaction = async (transactionData: any) => {
    setAiAssessmentLoading(true);
    setAiAssessmentResult("");

    try {
      const currentMonth = user?.data.months[user.data.currentMonth];

      const payload = {
        transaction: transactionData,
        currentMonth: user?.data.currentMonth,
        snapshot: user?.data.snapshot,
        debts: user?.data.debts,
        targets: user?.data.targets,
        monthData: currentMonth,
      };

      const response = await fetch("/api/ai/assess-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        setAiAssessmentResult("AI assessment unavailable. You can still add this transaction.");
        return;
      }

      setAiAssessmentResult(data.assessment || "No assessment available");
    } catch (err) {
      setAiAssessmentResult("AI service is temporarily unavailable. You can still add this transaction.");
      console.error("Error getting AI assessment:", err);
    } finally {
      setAiAssessmentLoading(false);
    }
  };

  // Quick add transaction handler
  const handleQuickAdd = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    // Check subscription limit for this transaction type
    const typeMap: Record<string, "income" | "expenses" | "savings" | "investing" | "debt"> = {
      income: "income",
      expense: "expenses",
      savings: "savings",
      investing: "investing",
      debt_payment: "debt",
    };

    if (!canAddTransaction(user, typeMap[quickForm.transactionType])) {
      showUpgradeModal(typeMap[quickForm.transactionType]);
      return;
    }

    if (!quickForm.amount || quickForm.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const updated = { ...user };
    if (!updated.data.months[user.data.currentMonth].tx) {
      updated.data.months[user.data.currentMonth].tx = [];
    }

    switch (quickForm.transactionType) {
      case "income":
        if (!quickForm.category || !quickForm.subCategory) {
          alert("Please select income type and source");
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
          alert("Please select expense category and type");
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
          alert("Please select a debt");
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

    recalculateTotals(updated.data.months[user.data.currentMonth]);
    updateUser(updated);
    closeQuickAdd();
    setQuickForm({ transactionType: "expense", category: "", subCategory: "", amount: 0, description: "" });
  };

  // Debt handlers
  const [debtForm, setDebtForm] = useState({ type: "Bank loan", name: "", total: 0, monthly: 0 });

  const handleAddDebt = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    if (!debtForm.name || (debtForm.total === 0 && debtForm.monthly === 0)) {
      alert("Enter debt name and either total or monthly payment");
      return;
    }
    const updated = { ...user };
    updated.data.debts.push({
      id: Math.random().toString(16).slice(2),
      type: debtForm.type,
      name: debtForm.name,
      total: debtForm.total,
      monthly: debtForm.monthly,
    });
    updateUser(updated);
    setDebtForm({ type: "Bank loan", name: "", total: 0, monthly: 0 });
  };

  const handleRemoveDebt = (id: string) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    const updated = { ...user };
    updated.data.debts = updated.data.debts.filter((d) => d.id !== id);
    updateUser(updated);
  };

  // Balances handlers
  const handleSaveBalances = () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    const updated = { ...user };
    updated.data.snapshot = {
      cash: balanceForm.cash,
      emergency: balanceForm.emergency,
      savings: balanceForm.savings,
      investing: balanceForm.investing,
    };
    updateUser(updated);
    // Sync form with saved data
    setBalanceForm({
      cash: balanceForm.cash,
      emergency: balanceForm.emergency,
      savings: balanceForm.savings,
      investing: balanceForm.investing,
    });
    toast.success("Account balances updated!");
  };


  // Add emergency fund transaction
  const handleAddEmergencyFund = () => {
    if (emergencyFundForm.amount <= 0) {
      toast.error("Please enter an amount");
      return;
    }
    const updated = { ...user };
    if (!updated.data.months[user.data.currentMonth].tx) {
      updated.data.months[user.data.currentMonth].tx = [];
    }
    updated.data.months[user.data.currentMonth].tx.push({
      id: Math.random().toString(16).slice(2),
      type: "emergency_fund",
      date: new Date().toISOString().split("T")[0],
      cat: "Emergency Fund",
      subCat: emergencyFundForm.description || "Transfer",
      name: emergencyFundForm.description || "Emergency fund adjustment",
      amt: emergencyFundForm.amount,
    });
    // Also update the balance snapshot
    updated.data.snapshot.emergency = (updated.data.snapshot.emergency || 0) + emergencyFundForm.amount;
    updateUser(updated);
    setEmergencyFundForm({ amount: 0, description: "" });
    // Update balance form to reflect the new balance
    setBalanceForm({ ...balanceForm, emergency: updated.data.snapshot.emergency });
    toast.success(`${formatCurrency(emergencyFundForm.amount, user.currency || "EUR")} added to emergency fund!`);
  };

  // Get emergency fund transactions
  const getEmergencyFundTransactions = () => {
    return (currentMonth.tx || []).filter((tx: any) => tx.type === "emergency_fund");
  };


  return (
    <Layout currentPage="data">
      <div className="max-w-6xl mx-auto px-2 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4">
        <div className="bg-white border border-[#e5e5e5] rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-2">Financial Data Entry</h2>
              <p className="text-xs md:text-sm text-[#666666]">
                Enter your financial information for the month. Select types/categories when adding income and expenses.
              </p>
            </div>
            <button
              onClick={openQuickAdd}
              className="flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 bg-[#1db584] text-white font-semibold text-sm rounded-lg hover:bg-[#0f8a56] transition whitespace-nowrap"
            >
              <Plus size={18} />
              Quick Add
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-0.5 sm:gap-1 md:gap-2 mb-4 md:mb-6 border-b border-[#e5e5e5]">
            {[
              { key: "balances", emoji: "💵", label: "Current Balances", short: "Balances" },
              { key: "income", emoji: "💰", label: "Income", short: "Income" },
              { key: "expenses", emoji: "📊", label: "Expenses", short: "Expenses" },
              { key: "savings", emoji: "💾", label: "Savings", short: "Savings" },
              { key: "investing", emoji: "📈", label: "Investing", short: "Investing" },
              { key: "debts", emoji: "💳", label: "Debts", short: "Debts" },
              { key: "categories", emoji: "🏷️", label: "Categories", short: "Categories" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setVisibleLabel(`tab-${tab.key}`);
                }}
                className={`relative px-2 sm:px-2 md:px-4 py-2 md:py-3 font-semibold text-xs sm:text-[10px] md:text-sm transition border-b-2 flex-shrink-0 whitespace-nowrap flex items-center gap-1 ${
                  activeTab === tab.key
                    ? "text-[#1db584] border-[#1db584]"
                    : "text-[#666666] border-transparent hover:text-[#1a1a1a]"
                }`}
              >
                {/* Emoji icon - larger on tablet */}
                <span className="text-xl sm:text-2xl md:text-2xl">{tab.emoji}</span>
                {/* Hide text on mobile and tablet, show only on desktop */}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* INCOME TAB */}
          {activeTab === "income" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-[#1a1a1a]">Total Income This Month</h3>
                <div className="text-3xl font-bold text-[#1db584] mt-2">{formatCurrency(t.income, user.currency || "EUR")}</div>
              </div>

              {/* Add Income Form */}
              <div className="border border-[#e5e5e5] rounded-lg p-4 bg-[#fafafa]">
                <h4 className="font-semibold text-[#1a1a1a] mb-4">➕ Add New Income</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <CustomSelect
                    label="Income Type"
                    value={incomeForm.type}
                    onChange={(value) => {
                      setIncomeForm({ ...incomeForm, type: value, subType: "" });
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

                  <CustomSelect
                    label="Source"
                    value={incomeForm.subType}
                    onChange={(value) => setIncomeForm({ ...incomeForm, subType: value })}
                    options={[
                      { value: "", label: "Select source..." },
                      ...(incomeForm.type
                        ? ((user.data.incomeTypes as any)
                            .find((t) => t.name === incomeForm.type)
                            ?.subCategories.map((sub) => ({
                              value: sub,
                              label: sub,
                            })) || [])
                        : []),
                    ]}
                    placeholder="Select source..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={incomeForm.amount || ""}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., December bonus"
                      value={incomeForm.description}
                      onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddIncome}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
                >
                  <Plus size={18} />
                  Add Income Entry
                </button>
              </div>

              {/* Income Entries */}
              {incomeTransactions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#1a1a1a] mb-4">Income Entries ({incomeTransactions.length})</h4>
                  <div className="space-y-2">
                    {incomeTransactions.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        {editingId === entry.id ? (
                          <div className="flex-1 grid grid-cols-3 gap-2 mr-2">
                            <input
                              type="number"
                              value={editValues.amount}
                              onChange={(e) => setEditValues({ ...editValues, amount: Number(e.target.value) })}
                              className="px-2 py-1 border border-green-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={editValues.description}
                              onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                              placeholder="Description"
                              className="px-2 py-1 border border-green-300 rounded text-sm col-span-2"
                            />
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="font-semibold text-[#1a1a1a]">
                              {entry.category} → {entry.subCategory}
                            </div>
                            <div className="text-sm text-[#666666] space-x-3">
                              <span>{entry.description}</span>
                              <span className="text-xs">📅 {new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-green-600 font-bold mt-1">{formatCurrency(entry.amount)}</div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {editingId === entry.id ? (
                            <>
                              <button
                                onClick={() => handleEditTransaction(entry.id, editValues.amount, editValues.description)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(entry.id);
                                  setEditValues({ amount: entry.amount, description: entry.description || "" });
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(entry.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXPENSES TAB */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-[#1a1a1a]">Total Expenses This Month</h3>
                <div className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(t.expenses, user.currency || "EUR")}</div>
              </div>

              {/* Add Expense Form */}
              <div className="border border-[#e5e5e5] rounded-lg p-4 bg-[#fafafa]">
                <h4 className="font-semibold text-[#1a1a1a] mb-4">➕ Add New Expense</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <CustomSelect
                    label="Category"
                    value={expenseForm.category}
                    onChange={(value) => {
                      setExpenseForm({ ...expenseForm, category: value, subCategory: "" });
                      setShowLoanFields(value === "Loan");
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

                  <CustomSelect
                    label="Type"
                    value={expenseForm.subCategory}
                    onChange={(value) => {
                      setExpenseForm({ ...expenseForm, subCategory: value });
                      if (expenseForm.category === "Loan") {
                        setShowLoanFields(true);
                      } else {
                        setShowLoanFields(false);
                      }
                    }}
                    options={[
                      { value: "", label: "Select type..." },
                      ...(expenseForm.category
                        ? (user.data.expenseCategories
                            .find((c) => c.name === expenseForm.category)
                            ?.subCategories.map((sub) => ({
                              value: sub,
                              label: sub,
                            })) || [])
                        : []),
                    ]}
                    placeholder="Select type..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={expenseForm.amount || ""}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Costco run"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>

                  {/* Loan-specific fields */}
                  {showLoanFields && user.data.debts.length > 0 && (
                    <>
                      <CustomSelect
                        label="Select Debt"
                        value={selectedDebtForLoan}
                        onChange={(value) => setSelectedDebtForLoan(value)}
                        options={[
                          { value: "", label: "Select debt to pay..." },
                          ...user.data.debts.map((debt) => ({
                            value: debt.id,
                            label: `${debt.name} (Owed: ${formatCurrency(debt.total)})`,
                          })),
                        ]}
                        placeholder="Select debt to pay..."
                      />

                      <div>
                        <CustomSelect
                          label="Payment Type"
                          value={loanPaymentType}
                          onChange={(value) => setLoanPaymentType(value as "monthly" | "full")}
                          options={[
                            { value: "monthly", label: "Monthly Installment" },
                            { value: "full", label: "Full Repayment" },
                          ]}
                          placeholder="Select payment type..."
                        />
                        <p className="text-xs text-[#666666] mt-1">
                          {loanPaymentType === "monthly"
                            ? "This payment will be tracked as monthly debt obligation"
                            : "This is a full repayment that reduces the debt"}
                        </p>
                      </div>

                      {loanPaymentType === "monthly" && (
                        <div>
                          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Monthly Payment Amount</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={loanMonthlyAmount || ""}
                            onChange={(e) => setLoanMonthlyAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                          />
                          <p className="text-xs text-[#666666] mt-1">Amount to be paid monthly towards this debt</p>
                        </div>
                      )}
                    </>
                  )}

                  {showLoanFields && user.data.debts.length === 0 && (
                    <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Add a debt first (in the Debts tab) before recording loan payments
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddExpense}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
                >
                  <Plus size={18} />
                  Add Expense Entry
                </button>
              </div>

              {/* Expense Entries */}
              {expenseTransactions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#1a1a1a] mb-4">Expense Entries ({expenseTransactions.length})</h4>
                  <div className="space-y-2">
                    {expenseTransactions.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                        {editingId === entry.id ? (
                          <div className="flex-1 grid grid-cols-3 gap-2 mr-2">
                            <input
                              type="number"
                              value={editValues.amount}
                              onChange={(e) => setEditValues({ ...editValues, amount: Number(e.target.value) })}
                              className="px-2 py-1 border border-red-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={editValues.description}
                              onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                              placeholder="Description"
                              className="px-2 py-1 border border-red-300 rounded text-sm col-span-2"
                            />
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="font-semibold text-[#1a1a1a]">
                              {entry.category} → {entry.subCategory}
                            </div>
                            <div className="text-sm text-[#666666] space-x-3">
                              <span>{entry.description}</span>
                              <span className="text-xs">📅 {new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-red-600 font-bold mt-1">{formatCurrency(entry.amount)}</div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {editingId === entry.id ? (
                            <>
                              <button
                                onClick={() => handleEditTransaction(entry.id, editValues.amount, editValues.description)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(entry.id);
                                  setEditValues({ amount: entry.amount, description: entry.description || "" });
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(entry.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SAVINGS TAB */}
          {activeTab === "savings" && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-[#1a1a1a]">Total Savings</h3>
                <div className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(t.savings, user.currency || "EUR")}</div>
                <p className="text-xs text-[#666666] mt-1">{getSavingsTransactions().length} deposits</p>
              </div>

              {/* Savings Deposits */}
              <div className="border border-[#e5e5e5] rounded-lg p-4 bg-[#fafafa]">
                <h4 className="font-semibold text-[#1a1a1a] mb-4">➕ Add Savings Deposit</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={savingsForm.amount || ""}
                      onChange={(e) => setSavingsForm({ ...savingsForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Emergency fund transfer"
                      value={savingsForm.description}
                      onChange={(e) => setSavingsForm({ ...savingsForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddSavings}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={18} />
                  Add Savings
                </button>
              </div>

              {/* Savings Entries */}
              {getSavingsTransactions().length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#1a1a1a] mb-4">Savings Deposits ({getSavingsTransactions().length})</h4>
                  <div className="space-y-2">
                    {getSavingsTransactions().map((entry: any) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-[#1a1a1a]">{entry.subCat}</div>
                          <div className="text-sm text-[#666666]">📅 {new Date(entry.date).toLocaleDateString()}</div>
                          <div className="text-blue-600 font-bold mt-1">{formatCurrency(entry.amt, user.currency || "EUR")}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteTransaction(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INVESTING TAB */}
          {activeTab === "investing" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-[#1a1a1a]">Total Investing</h3>
                <div className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(t.investing, user.currency || "EUR")}</div>
                <p className="text-xs text-[#666666] mt-1">{getInvestingTransactions().length} investments</p>
              </div>

              {/* Investing Transactions */}
              <div className="border border-[#e5e5e5] rounded-lg p-4 bg-[#fafafa]">
                <h4 className="font-semibold text-[#1a1a1a] mb-4">➕ Add Investment</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={investingForm.amount || ""}
                      onChange={(e) => setInvestingForm({ ...investingForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Investment Type (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Stocks, Crypto, ETF"
                      value={investingForm.description}
                      onChange={(e) => setInvestingForm({ ...investingForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddInvesting}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                >
                  <Plus size={18} />
                  Add Investment
                </button>
              </div>

              {/* Investing Entries */}
              {getInvestingTransactions().length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#1a1a1a] mb-4">Investments ({getInvestingTransactions().length})</h4>
                  <div className="space-y-2">
                    {getInvestingTransactions().map((entry: any) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-[#1a1a1a]">{entry.subCat}</div>
                          <div className="text-sm text-[#666666]">📅 {new Date(entry.date).toLocaleDateString()}</div>
                          <div className="text-purple-600 font-bold mt-1">{formatCurrency(entry.amt, user.currency || "EUR")}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteTransaction(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* DEBTS TAB */}
          {activeTab === "debts" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[#1a1a1a] mb-4">Add a Debt</h4>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <CustomSelect
                    value={debtForm.type}
                    onChange={(value) => setDebtForm({ ...debtForm, type: value })}
                    options={[
                      { value: "Bank loan", label: "Bank loan" },
                      { value: "Personal loan", label: "Personal loan" },
                      { value: "Credit card", label: "Credit card" },
                      { value: "Other", label: "Other" },
                    ]}
                    placeholder="Select debt type..."
                  />
                  <input
                    type="text"
                    placeholder="Debt name (e.g., Bank of Georgia)"
                    value={debtForm.name}
                    onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
                    className="px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                  <input
                    type="number"
                    placeholder="Total owed"
                    value={debtForm.total || ""}
                    onChange={(e) => setDebtForm({ ...debtForm, total: Number(e.target.value) })}
                    className="px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                  <input
                    type="number"
                    placeholder="Monthly payment"
                    value={debtForm.monthly || ""}
                    onChange={(e) => setDebtForm({ ...debtForm, monthly: Number(e.target.value) })}
                    className="px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                </div>
                <button
                  onClick={handleAddDebt}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
                >
                  <Plus size={18} />
                  Add Debt
                </button>
              </div>

              {user.data.debts.length > 0 && (
                <div className="pt-6 border-t border-[#e5e5e5]">
                  <h4 className="font-semibold text-[#1a1a1a] mb-3">Your Debts</h4>
                  <div className="space-y-2">
                    {user.data.debts.map((debt) => (
                      <div key={debt.id} className="flex items-center justify-between p-3 bg-[#f3f3f3] rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-[#1a1a1a]">{debt.name}</div>
                          <div className="text-xs text-[#666666]">
                            {debt.type} • {formatCurrency(debt.total, user.currency || "EUR")} • {formatCurrency(debt.monthly, user.currency || "EUR")}/mo
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveDebt(debt.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CURRENT BALANCES TAB */}
          {activeTab === "balances" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-[#1a1a1a]">Your Account Balances</h3>
                <p className="text-sm text-[#666666] mt-2">Current balance snapshot of all your accounts</p>
              </div>

              {/* Balance Inputs */}
              <div className="border border-[#e5e5e5] rounded-lg p-3 md:p-4 bg-[#fafafa]">
                <h4 className="font-semibold text-[#1a1a1a] mb-4 text-sm md:text-base">Update Account Balances</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Cash</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={balanceForm.cash || ""}
                      onChange={(e) => setBalanceForm({ ...balanceForm, cash: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Savings Account</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={balanceForm.savings || ""}
                      onChange={(e) => setBalanceForm({ ...balanceForm, savings: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Investing Account</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={balanceForm.investing || ""}
                      onChange={(e) => setBalanceForm({ ...balanceForm, investing: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Emergency Fund Balance</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={balanceForm.emergency || ""}
                      onChange={(e) => setBalanceForm({ ...balanceForm, emergency: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveBalances}
                  className="w-full py-2 px-4 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
                >
                  Update balance
                </button>
              </div>

              {/* Saved Balances Summary */}
              {(user.data.snapshot?.cash || user.data.snapshot?.savings || user.data.snapshot?.emergency || user.data.snapshot?.investing) && (
                <div className="border border-[#e5e5e5] rounded-lg p-3 md:p-4 bg-blue-50">
                  <h4 className="font-semibold text-[#1a1a1a] mb-4 text-sm md:text-base">Saved Account Balances</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666666]">Cash:</span>
                      <span className="font-bold text-[#1db584]">{formatCurrency(user.data.snapshot?.cash || 0, user.currency || "EUR")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666666]">Savings:</span>
                      <span className="font-bold text-[#1db584]">{formatCurrency(user.data.snapshot?.savings || 0, user.currency || "EUR")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666666]">Investing:</span>
                      <span className="font-bold text-[#1db584]">{formatCurrency(user.data.snapshot?.investing || 0, user.currency || "EUR")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666666]">Emergency Fund:</span>
                      <span className="font-bold text-orange-600">{formatCurrency(user.data.snapshot?.emergency || 0, user.currency || "EUR")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Fund Transactions */}
              <div className="border border-[#e5e5e5] rounded-lg p-3 md:p-4 bg-[#fafafa]">
                <h4 className="font-semibold text-[#1a1a1a] mb-4 text-sm md:text-base">➕ Add Emergency Fund Adjustment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={emergencyFundForm.amount || ""}
                      onChange={(e) => setEmergencyFundForm({ ...emergencyFundForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Emergency fund deposit"
                      value={emergencyFundForm.description}
                      onChange={(e) => setEmergencyFundForm({ ...emergencyFundForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddEmergencyFund}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
                >
                  <Plus size={18} />
                  Add to Emergency Fund
                </button>
              </div>

              {/* Emergency Fund Transaction History */}
              {getEmergencyFundTransactions().length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#1a1a1a] mb-4">Emergency Fund Transactions ({getEmergencyFundTransactions().length})</h4>
                  <div className="space-y-2">
                    {getEmergencyFundTransactions().map((entry: any) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-[#1a1a1a]">{entry.subCat}</div>
                          <div className="text-sm text-[#666666]">📅 {new Date(entry.date).toLocaleDateString()}</div>
                          <div className="text-orange-600 font-bold mt-1">{formatCurrency(entry.amt, user.currency || "EUR")}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteTransaction(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Income Types */}
              <div>
                <h4 className="font-semibold text-[#1a1a1a] mb-2">💰 Income Types</h4>
                <p className="text-sm text-[#666666] mb-6">
                  Select an income type to see its sub-sources for detailed tracking.
                </p>

                {/* Income Types Details */}
                <div className="space-y-3">
                  {(user.data.incomeTypes as any).map((incomeType) => (
                    <div key={incomeType.name} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-green-700">{incomeType.name}</h5>
                        <button
                          onClick={() => {
                            const updated = { ...user };
                            updated.data.incomeTypes = (updated.data.incomeTypes as any).filter(
                              (t) => t.name !== incomeType.name
                            );
                            updateUser(updated);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {incomeType.subCategories.map((sub) => (
                          <div key={`${incomeType.name}-${sub}`} className="px-3 py-1 bg-white border border-green-300 rounded-lg text-xs font-medium text-green-700">
                            {sub}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Categories */}
              <div className="pt-6 border-t border-[#e5e5e5]">
                <h4 className="font-semibold text-[#1a1a1a] mb-2">📊 Expense Categories</h4>
                <p className="text-sm text-[#666666] mb-6">
                  Select an expense category to see its sub-types for detailed tracking.
                </p>

                {/* Expense Categories Details */}
                <div className="space-y-3">
                  {user.data.expenseCategories.map((category) => (
                    <div key={category.name} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-blue-700">{category.name}</h5>
                        <button
                          onClick={() => {
                            const updated = { ...user };
                            updated.data.expenseCategories = (updated.data.expenseCategories as any).filter(
                              (c) => c.name !== category.name
                            );
                            updateUser(updated);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.subCategories.map((sub) => (
                          <div key={`${category.name}-${sub}`} className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700">
                            {sub}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#e5e5e5]">
                <h4 className="font-semibold text-[#1a1a1a] mb-3">➕ Add Custom Expense Category</h4>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="New category name (e.g., Hobbies, Education)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                    className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition whitespace-nowrap"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Assessment Modal */}
        {aiAssessmentOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg max-w-xl w-full max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a]">AI Financial Assessment</h2>
                  <p className="text-sm text-[#666666] mt-1">Is this transaction right for you?</p>
                </div>
                <button
                  onClick={() => {
                    setAiAssessmentOpen(false);
                    setAiAssessmentResult("");
                  }}
                  className="p-2 hover:bg-[#f3f3f3] rounded-lg transition text-[#666666]"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {aiAssessmentLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin mb-4">
                      <div className="w-8 h-8 border-4 border-[#e5e5e5] border-t-[#1db584] rounded-full"></div>
                    </div>
                    <p className="text-[#666666]">Analyzing your financial situation...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-semibold text-[#1a1a1a] mb-2">Transaction Summary</div>
                      <div className="space-y-1 text-sm text-[#666666]">
                        <div><strong>Type:</strong> {pendingTransaction?.transactionType}</div>
                        <div><strong>Amount:</strong> {formatCurrency(pendingTransaction?.amount, user.currency || "EUR")}</div>
                        {pendingTransaction?.category && <div><strong>Category:</strong> {pendingTransaction.category}</div>}
                        {pendingTransaction?.description && <div><strong>Note:</strong> {pendingTransaction.description}</div>}
                      </div>
                    </div>

                    <div className="p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg">
                      <div className="font-semibold text-[#1a1a1a] mb-3">AI Assessment</div>
                      <div className="prose prose-sm max-w-none text-[#666666] whitespace-pre-wrap">
                        {aiAssessmentResult}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-2 p-6 border-t border-[#e5e5e5] bg-[#f9f9f9]">
                <button
                  onClick={() => {
                    setAiAssessmentOpen(false);
                    setAiAssessmentResult("");
                  }}
                  className="px-4 py-2 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    handleQuickAdd();
                    setAiAssessmentOpen(false);
                    setAiAssessmentResult("");
                  }}
                  className="ml-auto px-6 py-2 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
                >
                  Add Transaction Anyway
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
        title={upgradeModal.title}
        description={upgradeModal.description}
        features={upgradeModal.features}
        onUpgradeClick={() => window.location.href = "/billing"}
      />
    </Layout>
  );
}
