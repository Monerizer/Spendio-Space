import { UserData, MonthData } from "@/context/SpendioContext";
import { formatCurrency } from "@/utils/calculations";

/**
 * Individual month health score breakdown (0-100)
 */
export interface MonthHealthBreakdown {
  incomeScore: number;
  expenseScore: number;
  savingsScore: number;
  debtScore: number;
  adherenceScore: number;
  total: number;
  explanation: string;
}

/**
 * Comparison between two 3-month periods
 */
export interface HealthTrend {
  currentScore: number;
  previousScore: number;
  changePoints: number;
  trend: "improving" | "declining" | "stable";
  currentPeriod: string; // "Month-3 to Month-1"
  previousPeriod: string; // "Month-6 to Month-4"
  metrics: {
    incomeStability: { current: number; previous: number; change: number };
    expenseControl: { current: number; previous: number; change: number };
    savingsRate: { current: number; previous: number; change: number };
    debtManagement: { current: number; previous: number; change: number };
  };
}

/**
 * AI-generated tips based on health metrics
 */
export interface HealthTip {
  category: "income" | "expenses" | "savings" | "debt" | "goals";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionable: string;
}

/**
 * Real-time assessment of a single transaction before it's added
 */
export interface TransactionAssessment {
  riskLevel: "green" | "yellow" | "red";
  title: string;
  message: string;
  recommendation: string;
  shouldWarn: boolean; // true if user should confirm before adding
}

/**
 * Calculate health score for a single month (5-metric model)
 * Metrics: Income Stability, Expense Control, Savings Rate, Debt Management, Budget Adherence
 */
export function calculateMonthHealth(monthData: MonthData, prevMonthData?: MonthData): MonthHealthBreakdown {
  const t = monthData.totals;
  const income = t.income || 0;
  const expenses = t.expenses || 0;
  const savings = t.savings || 0;
  const investing = t.investing || 0;
  const debtPay = t.debtPay || 0;

  // No data = score 0
  if (income === 0 && expenses === 0 && savings === 0 && investing === 0 && debtPay === 0) {
    return {
      incomeScore: 0,
      expenseScore: 0,
      savingsScore: 0,
      debtScore: 0,
      adherenceScore: 0,
      total: 0,
      explanation: "No financial data recorded this month",
    };
  }

  // Metric 1: Income Stability (0-25 points)
  // Compares current income to previous month average
  let incomeScore = 0;
  if (income > 0) {
    if (prevMonthData && (prevMonthData.totals.income || 0) > 0) {
      const prevIncome = prevMonthData.totals.income || 0;
      const stability = income / prevIncome;
      
      if (stability >= 0.95 && stability <= 1.05) {
        incomeScore = 25; // Very stable
      } else if (stability >= 0.9 && stability <= 1.1) {
        incomeScore = 20; // Mostly stable
      } else if (stability >= 0.8 && stability <= 1.2) {
        incomeScore = 15; // Moderate variation
      } else if (stability >= 0.7) {
        incomeScore = 10; // Declining income
      } else {
        incomeScore = 5; // Sharp income drop
      }
    } else {
      incomeScore = 15; // Has income but no prev data for comparison
    }
  }

  // Metric 2: Expense Control (0-25 points)
  // Measures how actively income is allocated (expenses + savings + investing + debt)
  // If money is just sitting idle = poor control. Need to allocate 60-100% of income.
  let expenseScore = 0;
  if (income > 0) {
    const totalAllocated = expenses + savings + investing + debtPay;
    const allocationRatio = totalAllocated / income;

    if (allocationRatio >= 0.6 && allocationRatio <= 1.0) {
      expenseScore = 25; // Excellent - 60-100% actively managed
    } else if (allocationRatio >= 0.5 && allocationRatio < 0.6) {
      expenseScore = 20; // Good - 50-60% allocated
    } else if (allocationRatio >= 0.4 && allocationRatio < 0.5) {
      expenseScore = 15; // Fair - 40-50% allocated (too much sitting idle)
    } else if (allocationRatio >= 0.3 && allocationRatio < 0.4) {
      expenseScore = 8; // Poor - 30-40% allocated (most money unaccounted for)
    } else if (allocationRatio > 1.0) {
      expenseScore = 0; // Critical - overspending
    } else {
      expenseScore = 0; // Critical - less than 30% allocated (massive cash hoarding)
    }
  } else if (expenses === 0) {
    expenseScore = 0; // No income = no way to judge
  }

  // Metric 3: Savings Rate (0-25 points)
  // Includes both savings and investing buckets
  let savingsScore = 0;
  const totalWealthBuilding = savings + investing;
  
  if (income > 0) {
    const savingsRate = totalWealthBuilding / income;
    
    if (savingsRate >= 0.25) {
      savingsScore = 25; // Excellent - saving 25%+ of income
    } else if (savingsRate >= 0.2) {
      savingsScore = 23; // Great - saving 20-25%
    } else if (savingsRate >= 0.15) {
      savingsScore = 20; // Good - saving 15-20%
    } else if (savingsRate >= 0.1) {
      savingsScore = 15; // Fair - saving 10-15%
    } else if (savingsRate >= 0.05) {
      savingsScore = 10; // Low - saving 5-10%
    } else if (savingsRate > 0) {
      savingsScore = 5; // Very low - saving < 5%
    } else {
      savingsScore = 0; // No savings
    }
  }

  // Metric 4: Debt Management (0-25 points)
  // Lower debt-to-income ratio = higher score
  let debtScore = 0;
  if (income > 0) {
    const debtRatio = debtPay / income;
    
    if (debtRatio === 0) {
      debtScore = 25; // No debt payments
    } else if (debtRatio <= 0.1) {
      debtScore = 24; // Minimal - < 10%
    } else if (debtRatio <= 0.2) {
      debtScore = 20; // Low - 10-20%
    } else if (debtRatio <= 0.35) {
      debtScore = 15; // Moderate - 20-35%
    } else if (debtRatio <= 0.5) {
      debtScore = 8; // High - 35-50%
    } else {
      debtScore = 0; // Critical - > 50%
    }
  } else if (debtPay === 0) {
    debtScore = 20; // No debt, but also no income
  }

  // Metric 5: Budget Adherence (0-25 points)
  // Check if they're sticking to their wealth targets
  // Since we don't have explicit "budget" in the data, we'll use consistency of savings
  let adherenceScore = 0;
  if (prevMonthData && (prevMonthData.totals.savings || 0) > 0 && savings > 0) {
    const prevSavings = prevMonthData.totals.savings || 0;
    const consistency = savings / prevSavings;
    
    if (consistency >= 0.9 && consistency <= 1.1) {
      adherenceScore = 25; // Consistent savings habit
    } else if (consistency >= 0.8 && consistency <= 1.2) {
      adherenceScore = 20; // Mostly consistent
    } else if (consistency >= 0.6 && consistency <= 1.4) {
      adherenceScore = 15; // Some variation
    } else {
      adherenceScore = 8; // Inconsistent
    }
  } else if (savings > 0) {
    adherenceScore = 15; // Has savings but no prev data for comparison
  } else {
    adherenceScore = 5; // No savings this month
  }

  const total = incomeScore + expenseScore + savingsScore + debtScore + adherenceScore;

  return {
    incomeScore,
    expenseScore,
    savingsScore,
    debtScore,
    adherenceScore,
    total,
    explanation: generateMonthExplanation(income, expenses, savings, investing, debtPay),
  };
}

/**
 * Calculate health trend by comparing last 3 months vs previous 3 months
 */
export function calculateHealthTrend(user: UserData): HealthTrend | null {
  const months = user.data.months;
  const currentMonthKey = user.data.currentMonth;
  
  // Extract numeric month index (format: "2024-01")
  const parts = currentMonthKey.split("-");
  if (parts.length !== 2) return null;
  
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);

  // Helper to generate month key from year and month
  const getMonthKey = (y: number, m: number): string => {
    return `${y}-${String(m).padStart(2, "0")}`;
  };

  // Get last 3 months (current month -2, -1, current)
  const current3Months = [
    getMonthKey(month >= 3 ? year : year - 1, month >= 3 ? month - 2 : month + 10),
    getMonthKey(month >= 2 ? year : year - 1, month >= 2 ? month - 1 : month + 11),
    currentMonthKey,
  ];

  // Get previous 3 months (month -5, -4, -3)
  const previous3Months = [
    getMonthKey(month > 5 ? year : year - 1, month > 5 ? month - 5 : month + 7),
    getMonthKey(month > 4 ? year : year - 1, month > 4 ? month - 4 : month + 8),
    getMonthKey(month > 3 ? year : year - 1, month > 3 ? month - 3 : month + 9),
  ];

  // Check if we have enough data
  const hasCurrentData = current3Months.some((k) => months[k] && hasMonthData(months[k]));
  const hasPreviousData = previous3Months.some((k) => months[k] && hasMonthData(months[k]));

  if (!hasCurrentData || !hasPreviousData) {
    return null; // Not enough history for comparison
  }

  // Calculate average health for each period
  const currentScores = current3Months
    .map((k) => (months[k] ? calculateMonthHealth(months[k]) : null))
    .filter((x) => x !== null) as MonthHealthBreakdown[];

  const previousScores = previous3Months
    .map((k) => (months[k] ? calculateMonthHealth(months[k]) : null))
    .filter((x) => x !== null) as MonthHealthBreakdown[];

  if (currentScores.length === 0 || previousScores.length === 0) {
    return null;
  }

  const currentAvg = currentScores.reduce((sum, s) => sum + s.total, 0) / currentScores.length;
  const previousAvg = previousScores.reduce((sum, s) => sum + s.total, 0) / previousScores.length;
  const changePoints = Math.round(currentAvg - previousAvg);

  // Determine trend
  let trend: "improving" | "declining" | "stable";
  if (changePoints > 5) {
    trend = "improving";
  } else if (changePoints < -5) {
    trend = "declining";
  } else {
    trend = "stable";
  }

  // Calculate metric-level changes
  const metrics = {
    incomeStability: {
      current: Math.round(currentScores.reduce((sum, s) => sum + s.incomeScore, 0) / currentScores.length),
      previous: Math.round(previousScores.reduce((sum, s) => sum + s.incomeScore, 0) / previousScores.length),
      change: 0,
    },
    expenseControl: {
      current: Math.round(currentScores.reduce((sum, s) => sum + s.expenseScore, 0) / currentScores.length),
      previous: Math.round(previousScores.reduce((sum, s) => sum + s.expenseScore, 0) / previousScores.length),
      change: 0,
    },
    savingsRate: {
      current: Math.round(currentScores.reduce((sum, s) => sum + s.savingsScore, 0) / currentScores.length),
      previous: Math.round(previousScores.reduce((sum, s) => sum + s.savingsScore, 0) / previousScores.length),
      change: 0,
    },
    debtManagement: {
      current: Math.round(currentScores.reduce((sum, s) => sum + s.debtScore, 0) / currentScores.length),
      previous: Math.round(previousScores.reduce((sum, s) => sum + s.debtScore, 0) / previousScores.length),
      change: 0,
    },
  };

  // Calculate changes
  metrics.incomeStability.change = metrics.incomeStability.current - metrics.incomeStability.previous;
  metrics.expenseControl.change = metrics.expenseControl.current - metrics.expenseControl.previous;
  metrics.savingsRate.change = metrics.savingsRate.current - metrics.savingsRate.previous;
  metrics.debtManagement.change = metrics.debtManagement.current - metrics.debtManagement.previous;

  return {
    currentScore: Math.round(currentAvg),
    previousScore: Math.round(previousAvg),
    changePoints,
    trend,
    currentPeriod: `Last 3 months (${current3Months[0]} to ${currentMonthKey})`,
    previousPeriod: `3 months prior (${previous3Months[0]} to ${previous3Months[2]})`,
    metrics,
  };
}

/**
 * Generate AI tips based on health scores and trends
 */
export function generateAITips(monthHealth: MonthHealthBreakdown, trend?: HealthTrend): HealthTip[] {
  const tips: HealthTip[] = [];

  // Income tips
  if (monthHealth.incomeScore === 0) {
    tips.push({
      category: "income",
      priority: "high",
      title: "No income recorded",
      description: "Start by tracking your monthly income to get personalized financial insights.",
      actionable: "Go to Financial Data → add your income sources",
    });
  } else if (monthHealth.incomeScore < 10) {
    tips.push({
      category: "income",
      priority: "high",
      title: "Income is unstable",
      description: "Your income varies significantly month-to-month. This makes budgeting difficult.",
      actionable: "Build an emergency fund to cover 3-6 months of expenses",
    });
  } else if (trend && trend.metrics.incomeStability.change < -5) {
    tips.push({
      category: "income",
      priority: "medium",
      title: "Income is declining",
      description: `Your income dropped ${Math.abs(trend.metrics.incomeStability.change)} points compared to last quarter.`,
      actionable: "Review income sources and consider side income if needed",
    });
  }

  // Expense tips (now about allocation, not just spending)
  if (monthHealth.expenseScore === 0) {
    tips.push({
      category: "expenses",
      priority: "high",
      title: "Money not being allocated productively",
      description: "Less than 30% of income is being used (expenses + savings + debt). Most money is just sitting idle.",
      actionable: "Create a budget: allocate 60-100% of income to expenses (50-70%), savings (10-20%), or debt (0-30%)",
    });
  } else if (monthHealth.expenseScore < 10) {
    tips.push({
      category: "expenses",
      priority: "high",
      title: "Poor income allocation",
      description: "Only 30-40% of income is allocated. The rest is unaccounted for—this isn't 'saving', it's neglect.",
      actionable: "Build a spending plan: allocate every dollar to either expenses, savings, or investing",
    });
  } else if (monthHealth.expenseScore < 15) {
    tips.push({
      category: "expenses",
      priority: "medium",
      title: "Low income allocation",
      description: "Only 40-50% of income is being managed. Increase allocation to 60%+ for better control.",
      actionable: "Increase either expenses, savings, or debt payments to fully utilize your income",
    });
  }

  // Savings tips
  if (monthHealth.savingsScore === 0) {
    tips.push({
      category: "savings",
      priority: "high",
      title: "You're not saving anything",
      description: "Building wealth requires consistent savings. Start small if needed.",
      actionable: "Allocate even 5% of income to savings—automate it to make it effortless",
    });
  } else if (monthHealth.savingsScore < 10) {
    tips.push({
      category: "savings",
      priority: "medium",
      title: "Low savings rate",
      description: "You're saving less than 5% of income. Aim for 10-20%.",
      actionable: "Review expenses, find $100-200/month to redirect to savings",
    });
  } else if (monthHealth.savingsScore >= 20) {
    tips.push({
      category: "savings",
      priority: "low",
      title: "Excellent savings discipline",
      description: "You're saving 20%+ of income. Keep up this momentum!",
      actionable: "Consider diversifying: spread savings across emergency fund, investments, and goals",
    });
  }

  // Debt tips
  if (monthHealth.debtScore === 25) {
    tips.push({
      category: "debt",
      priority: "low",
      title: "Debt-free! Focus on wealth building",
      description: "With no debt payments, you can fully focus on saving and investing.",
      actionable: "Increase your savings rate to 15%+ or invest in long-term goals",
    });
  } else if (monthHealth.debtScore < 10) {
    tips.push({
      category: "debt",
      priority: "high",
      title: "High debt burden",
      description: "Debt payments exceed 35% of income. This limits your financial flexibility.",
      actionable: "Create a debt payoff plan: pay off smallest balance first OR highest interest rate first",
    });
  } else if (monthHealth.debtScore < 20 && trend && trend.metrics.debtManagement.change < 0) {
    tips.push({
      category: "debt",
      priority: "medium",
      title: "Debt payments are increasing",
      description: "Your debt burden score declined. Avoid taking on new debt.",
      actionable: "Redirect extra income toward debt payoff",
    });
  }

  // Budget adherence / goals tips
  if (monthHealth.adherenceScore < 10) {
    tips.push({
      category: "goals",
      priority: "medium",
      title: "Inconsistent savings pattern",
      description: "Your savings amounts vary significantly—make it a fixed habit.",
      actionable: "Set up automatic transfers for the same day each month",
    });
  } else if (monthHealth.adherenceScore >= 20) {
    tips.push({
      category: "goals",
      priority: "low",
      title: "Consistent with your goals",
      description: "You're maintaining steady progress on your savings targets.",
      actionable: "Consider increasing targets as your income grows",
    });
  }

  // Trend-based tips
  if (trend) {
    if (trend.trend === "improving") {
      tips.push({
        category: "goals",
        priority: "low",
        title: `Health score improved by ${trend.changePoints} points`,
        description: "Your financial health is trending positively. Maintain this trajectory!",
        actionable: "Review what's working (lower expenses? higher income?) and double down on it",
      });
    } else if (trend.trend === "declining") {
      tips.push({
        category: "goals",
        priority: "high",
        title: `Health score declined by ${Math.abs(trend.changePoints)} points`,
        description: "Your financial situation has worsened over the last 3 months.",
        actionable: "Review the metrics that dropped most and address them immediately",
      });
    }
  }

  return tips;
}

/**
 * Assess if a single transaction is reasonable before adding it
 * Gives real-time feedback on whether this purchase/action makes sense
 */
export function assessTransaction(
  user: UserData,
  transactionType: "income" | "expense" | "savings" | "investing" | "debt_payment",
  amount: number,
  category?: string
): TransactionAssessment {
  const currentMonth = user.data.months[user.data.currentMonth];
  const monthlyIncome = currentMonth.totals.income || 0;
  const monthlyExpenses = currentMonth.totals.expenses || 0;
  const monthlySavings = currentMonth.totals.savings || 0;
  const monthlyInvesting = currentMonth.totals.investing || 0;
  const monthlyDebtPay = currentMonth.totals.debtPay || 0;

  // No income = risky for any spending
  if (monthlyIncome === 0) {
    if (transactionType === "expense") {
      return {
        riskLevel: "red",
        title: "No income recorded",
        message: "You haven't recorded any income this month. Adding expenses without income will drain your savings.",
        recommendation: "Record your income first, then add expenses.",
        shouldWarn: true,
      };
    }
    if (transactionType === "debt_payment") {
      return {
        riskLevel: "red",
        title: "No income recorded",
        message: "Paying debt without recorded income could strain your finances.",
        recommendation: "Record your income first.",
        shouldWarn: true,
      };
    }
  }

  // EXPENSE ASSESSMENT
  if (transactionType === "expense") {
    const totalWouldBe = monthlyExpenses + amount;
    const expenseRatio = totalWouldBe / monthlyIncome;

    // Single expense > 50% of monthly income = warning
    if (amount > monthlyIncome * 0.5 && monthlyIncome > 0) {
      return {
        riskLevel: "red",
        title: "Very large expense",
        message: `This ${formatCurrency(amount)} expense is ${Math.round((amount / monthlyIncome) * 100)}% of your monthly income (${formatCurrency(monthlyIncome)}).`,
        recommendation: "Is this a necessary purchase? Consider waiting or finding a cheaper alternative.",
        shouldWarn: true,
      };
    }

    // Total expenses > income = warning
    if (expenseRatio > 1) {
      return {
        riskLevel: "red",
        title: "Will exceed monthly income",
        message: `Adding ${formatCurrency(amount)} will bring total expenses to ${formatCurrency(totalWouldBe)}, which exceeds income of ${formatCurrency(monthlyIncome)}.`,
        recommendation: "This will result in deficit spending. Reduce expenses or increase income.",
        shouldWarn: true,
      };
    }

    // Total expenses > 80% of income = yellow
    if (expenseRatio > 0.8) {
      return {
        riskLevel: "yellow",
        title: "High expense ratio",
        message: `With this expense, you'll spend ${Math.round(expenseRatio * 100)}% of income, leaving only ${Math.round((1 - expenseRatio) * 100)}% for savings/debt.`,
        recommendation: "You'll have very little left to save. Consider postponing this purchase.",
        shouldWarn: true,
      };
    }

    // All good
    return {
      riskLevel: "green",
      title: "Purchase looks reasonable",
      message: `This ${formatCurrency(amount)} expense is sustainable. You'll still have funds for savings/debt.`,
      recommendation: "Go ahead with this purchase.",
      shouldWarn: false,
    };
  }

  // SAVINGS ASSESSMENT
  if (transactionType === "savings") {
    const totalSavingsWouldBe = monthlySavings + amount;
    const savingsRatio = totalSavingsWouldBe / monthlyIncome;

    if (amount > monthlyIncome * 0.5 && monthlyIncome > 0) {
      return {
        riskLevel: "yellow",
        title: "Large savings deposit",
        message: `You're saving ${formatCurrency(amount)}, which is ${Math.round((amount / monthlyIncome) * 100)}% of income.`,
        recommendation: "That's aggressive saving! Make sure you have enough for essential expenses.",
        shouldWarn: true,
      };
    }

    if (savingsRatio > 0.5) {
      return {
        riskLevel: "yellow",
        title: "Very high savings rate",
        message: `You'll be saving ${Math.round(savingsRatio * 100)}% of income. Ensure you cover all expenses first.`,
        recommendation: "Good habit, but don't over-save at the expense of essential spending.",
        shouldWarn: true,
      };
    }

    return {
      riskLevel: "green",
      title: "Good savings move",
      message: `Saving ${formatCurrency(amount)} is a smart choice for building wealth.`,
      recommendation: "Continue this habit!",
      shouldWarn: false,
    };
  }

  // INVESTING ASSESSMENT
  if (transactionType === "investing") {
    const totalInvestingWouldBe = monthlyInvesting + amount;
    const investRatio = totalInvestingWouldBe / monthlyIncome;

    if (amount > monthlyIncome * 0.3 && monthlyIncome > 0) {
      return {
        riskLevel: "yellow",
        title: "Large investment amount",
        message: `You're investing ${formatCurrency(amount)}, which is ${Math.round((amount / monthlyIncome) * 100)}% of income.`,
        recommendation: "Good for growth, but ensure you have an emergency fund (3-6 months expenses).",
        shouldWarn: true,
      };
    }

    return {
      riskLevel: "green",
      title: "Solid investment",
      message: `Investing ${formatCurrency(amount)} will help build long-term wealth.`,
      recommendation: "Great decision!",
      shouldWarn: false,
    };
  }

  // DEBT PAYMENT ASSESSMENT
  if (transactionType === "debt_payment") {
    const totalDebtWouldBe = monthlyDebtPay + amount;
    const debtRatio = totalDebtWouldBe / monthlyIncome;

    if (amount > monthlyIncome * 0.5) {
      return {
        riskLevel: "red",
        title: "Very large debt payment",
        message: `This ${formatCurrency(amount)} payment is ${Math.round((amount / monthlyIncome) * 100)}% of your monthly income.`,
        recommendation: "Verify you can afford this and still cover essential expenses.",
        shouldWarn: true,
      };
    }

    if (debtRatio > 0.5) {
      return {
        riskLevel: "red",
        title: "Debt payments exceed 50% of income",
        message: `Your total debt payments would be ${Math.round(debtRatio * 100)}% of income—this is unsustainable.`,
        recommendation: "Consider negotiating lower payment amounts with creditors.",
        shouldWarn: true,
      };
    }

    if (debtRatio > 0.3) {
      return {
        riskLevel: "yellow",
        title: "High debt payment ratio",
        message: `Debt payments will be ${Math.round(debtRatio * 100)}% of income. Monitor your budget carefully.`,
        recommendation: "You're managing debt, but watch for over-commitment.",
        shouldWarn: true,
      };
    }

    return {
      riskLevel: "green",
      title: "Good debt payment",
      message: `Paying ${formatCurrency(amount)} towards debt is manageable and reduces your liability.`,
      recommendation: "Keep up the debt payoff plan!",
      shouldWarn: false,
    };
  }

  // Fallback
  return {
    riskLevel: "green",
    title: "Transaction ready",
    message: "This transaction is ready to add.",
    recommendation: "Proceed.",
    shouldWarn: false,
  };
}

// === HELPER FUNCTIONS ===

/**
 * Check if a month has any financial data
 */
function hasMonthData(monthData: MonthData): boolean {
  const t = monthData.totals || {};
  return (
    (t.income || 0) > 0 ||
    (t.expenses || 0) > 0 ||
    (t.savings || 0) > 0 ||
    (t.investing || 0) > 0 ||
    (t.debtPay || 0) > 0
  );
}

/**
 * Generate human-readable explanation of monthly health
 */
function generateMonthExplanation(income: number, expenses: number, savings: number, investing: number, debtPay: number): string {
  if (income === 0) {
    return "No income recorded this month.";
  }

  const totalAllocated = expenses + savings + investing + debtPay;
  const allocationRatio = totalAllocated / income;
  const unallocatedPercent = Math.round((1 - allocationRatio) * 100);
  const allocatedPercent = Math.round(allocationRatio * 100);
  const savingsRate = (savings + investing) / income;
  const debtRatio = debtPay / income;

  let explanation = "This month: ";

  if (allocationRatio > 1) {
    explanation += `You allocated ${allocatedPercent}% of income (overspending - more than you earned). `;
  } else if (allocationRatio >= 0.6) {
    explanation += `Good allocation - you're actively managing ${allocatedPercent}% of income. `;
  } else if (allocationRatio >= 0.4) {
    explanation += `Moderate allocation - only ${allocatedPercent}% of income is allocated, ${unallocatedPercent}% is unaccounted for. `;
  } else if (allocationRatio >= 0.3) {
    explanation += `Poor allocation - only ${allocatedPercent}% of income is allocated, ${unallocatedPercent}% is sitting idle. `;
  } else {
    explanation += `CRITICAL allocation - only ${allocatedPercent}% of income is allocated, ${unallocatedPercent}% is unaccounted for. `;
  }

  if (savingsRate >= 0.15) {
    explanation += "Strong savings rate. ";
  } else if (savingsRate >= 0.05) {
    explanation += "Building wealth gradually. ";
  } else if (savingsRate === 0) {
    explanation += "No savings or investing—money isn't working for you. ";
  } else {
    explanation += "Low savings. ";
  }

  if (debtRatio > 0.35) {
    explanation += "High debt burden.";
  } else if (debtRatio > 0.1) {
    explanation += "Manageable debt.";
  } else if (debtRatio > 0) {
    explanation += "Minimal debt.";
  } else {
    explanation += "No debt payments.";
  }

  return explanation;
}
