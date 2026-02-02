import { UserData, MonthData } from "@/context/SpendioContext";

// Free plan: 1 transaction per category, Pro plan: unlimited
const FREE_PLAN_LIMIT = 1;

export interface TransactionCount {
  income: number;
  expenses: number;
  savings: number;
  investing: number;
  debts: number;
}

/**
 * Count transactions by category for the current month
 * Note: Does NOT count "Current Balances" (snapshot) updates
 */
export function countTransactionsByCategory(
  monthData: MonthData | undefined
): TransactionCount {
  const counts = {
    income: 0,
    expenses: 0,
    savings: 0,
    investing: 0,
    debts: 0,
  };

  if (!monthData) return counts;

  monthData.tx.forEach((tx) => {
    // Match the actual transaction types used in FinancialData.tsx
    if (tx.type === "income") counts.income++;
    else if (tx.type === "expense") counts.expenses++;  // Note: "expense" singular, not "expenses"
    else if (tx.type === "savings") counts.savings++;
    else if (tx.type === "investing") counts.investing++;
    else if (tx.type === "debt_payment") counts.debts++;  // Note: "debt_payment", not "debt"
    else if (tx.type === "emergency_fund") counts.savings++;  // Emergency fund counts toward savings limit
  });

  return counts;
}

/**
 * Check if user has hit transaction limit for a specific category
 * Returns true if they can add more, false if they've hit the limit
 */
export function canAddTransaction(
  user: UserData | null,
  categoryType: "income" | "expenses" | "savings" | "investing" | "debt"
): boolean {
  if (!user || user.subscription?.status === "pro") {
    return true; // Pro users have unlimited
  }

  // Free plan limit check
  const monthData = user.data.months[user.data.currentMonth];
  const counts = countTransactionsByCategory(monthData);

  const currentCount = counts[categoryType as keyof TransactionCount];
  return currentCount < FREE_PLAN_LIMIT;
}

/**
 * Get transaction count for a specific category
 */
export function getTransactionCount(
  user: UserData | null,
  categoryType: "income" | "expenses" | "savings" | "investing" | "debt"
): number {
  if (!user) return 0;

  const monthData = user.data.months[user.data.currentMonth];
  const counts = countTransactionsByCategory(monthData);
  return counts[categoryType as keyof TransactionCount];
}

/**
 * Check if user is on free plan
 */
export function isFreePlan(user: UserData | null): boolean {
  return user?.subscription?.status === "free" || !user?.subscription?.status;
}

/**
 * Check if user is on pro plan
 */
export function isProPlan(user: UserData | null): boolean {
  return user?.subscription?.status === "pro";
}

/**
 * Get feature gate info for recommendations/reviews
 */
export function canViewFullRecommendations(user: UserData | null): boolean {
  return isProPlan(user);
}
