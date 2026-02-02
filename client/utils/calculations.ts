import { UserData, MonthData } from "@/context/SpendioContext";

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  "EUR": "€",
  "USD": "$",
  "GBP": "£",
  "JPY": "¥",
  "CNY": "¥",
  "INR": "₹",
  "AUD": "A$",
  "CAD": "C$",
  "CHF": "CHF",
  "SEK": "kr",
  "NZD": "NZ$",
  "MXN": "$",
  "SGD": "S$",
  "HKD": "HK$",
  "NOK": "kr",
  "KRW": "₩",
  "TRY": "₺",
  "RUB": "₽",
  "BRL": "R$",
  "ZAR": "R",
  "GEL": "₾",
  "DKK": "kr",
  "THB": "฿",
};

export function formatCurrency(value: number, currency: string = "EUR"): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return symbol + Math.round(value).toLocaleString("en-US");
}

export function computeNet(totals: MonthData["totals"]): number {
  return (
    Number(totals.income) -
    Number(totals.expenses) -
    Number(totals.savings) -
    Number(totals.investing) -
    Number(totals.debtPay)
  );
}

/**
 * Comprehensive Money Health Score calculation
 * Based on 4 weighted components + guardrails + emergency fund bonus
 */
export function calculateMoneyHealthScore(user: UserData): {
  score: number;
  components: {
    cashflow: number;
    discipline: number;
    debt: number;
    trend: number;
  };
  breakdown: HealthScoreBreakdown;
} {
  const m = user.data.months[user.data.currentMonth];
  if (!m) return createZeroScore();

  const t = m.totals;
  const income = Number(t.income) || 0;
  const expenses = Number(t.expenses) || 0;
  const savings = Number(t.savings) || 0;
  const investing = Number(t.investing) || 0;
  let debtPay = Number(t.debtPay) || 0;

  // Include monthly debt payments from debt items (even if no transaction recorded yet)
  if (user.data.debts && user.data.debts.length > 0) {
    const totalMonthlyDebtFromItems = user.data.debts.reduce((sum, debt) => {
      return sum + (Number(debt.monthly) || 0);
    }, 0);
    // Use the higher of actual payments made OR expected monthly payments from debt items
    debtPay = Math.max(debtPay, totalMonthlyDebtFromItems);
  }

  const remainingCash = income - expenses - savings - investing - debtPay;

  // ===== RULE A: No meaningful data = score 0 =====
  const totalActivity = income + expenses + savings + investing + debtPay;
  if (totalActivity === 0) {
    return createZeroScore();
  }

  // Snapshot data
  const snapshot = user.data.snapshot || {
    cash: 0,
    emergency: 0,
    savings: 0,
    investing: 0,
    debt: 0,
  };
  const cashBalance = Number(snapshot.cash) || 0;
  const emergencyFund = Number(snapshot.emergency) || 0;
  const totalSavingsBalance = Number(snapshot.savings) || 0;
  const totalInvestingBalance = Number(snapshot.investing) || 0;

  // ===== RULE B: Income = 0 handling =====
  let cashflowPts = 0;
  let disciplinePts = 0;
  let debtPts = 0;
  let trendPts = 5; // neutral default for no history

  // Check if user has active debt (either from transactions or from debt items)
  const hasActiveDebt = debtPay > 0 || (user.data.debts && user.data.debts.length > 0);

  if (income <= 0) {
    // User has expenses/debt but no income - very risky
    if (expenses > 0 || hasActiveDebt) {
      return {
        score: 15,
        components: { cashflow: 0, discipline: 0, debt: 0, trend: 0 },
        breakdown: {
          cashflowRatio: 999,
          cashflowExplanation: "No income recorded",
          wealthRate: 0,
          wealthExplanation: "Cannot save without income",
          debtRatio: 999,
          debtExplanation: "No income to pay debt",
          trendExplanation: "Insufficient data",
          emergencyFundMonths: 0,
        },
      };
    }
    // No income, no expenses = use snapshot score
    return scoreFromSnapshot(snapshot);
  }

  // ===== COMPONENT 1: CASHFLOW STABILITY (0–40 pts) =====
  const outflow = expenses + savings + investing + debtPay;
  const cashflowRatio = outflow / income;

  if (cashflowRatio <= 0.7) {
    cashflowPts = 40;
  } else if (cashflowRatio <= 0.9) {
    // Scale 40 → 25 across 0.7-0.9 range
    cashflowPts = 40 - ((cashflowRatio - 0.7) / 0.2) * 15;
  } else if (cashflowRatio <= 1.0) {
    // Scale 25 → 10 across 0.9-1.0 range
    cashflowPts = 25 - ((cashflowRatio - 0.9) / 0.1) * 15;
  } else {
    // Overspending
    cashflowPts = 0;
  }
  cashflowPts = Math.max(0, Math.min(40, cashflowPts));

  // ===== COMPONENT 2: SAVINGS + INVESTING DISCIPLINE (0–25 pts) =====
  const wealthRate = (savings + investing) / income;
  let disciplinePtsBase = 0;

  if (wealthRate >= 0.2) {
    disciplinePtsBase = 25;
  } else if (wealthRate >= 0.1) {
    // Scale 25 → 15 across 0.1-0.2 range
    disciplinePtsBase = 25 - ((0.2 - wealthRate) / 0.1) * 10;
  } else if (wealthRate >= 0.05) {
    // Scale 15 → 8 across 0.05-0.1 range
    disciplinePtsBase = 15 - ((0.1 - wealthRate) / 0.05) * 7;
  } else if (wealthRate > 0) {
    // Scale 8 → 0 across 0-0.05 range
    disciplinePtsBase = 8 * (wealthRate / 0.05);
  } else {
    disciplinePtsBase = 0;
  }

  // Debt-aware modifier: if debt burden is high, ensure minimum saving credit
  const debtRatio = debtPay / income;
  if (debtRatio > 0.35 && disciplinePtsBase < 5) {
    disciplinePtsBase = 5; // minimum floor when in heavy debt
  }

  disciplinePts = Math.max(0, Math.min(25, disciplinePtsBase));

  // ===== COMPONENT 3: DEBT BURDEN (0–25 pts) =====
  if (debtRatio <= 0.15) {
    debtPts = 25;
  } else if (debtRatio <= 0.3) {
    // Scale 25 → 15 across 0.15-0.3 range
    debtPts = 25 - ((debtRatio - 0.15) / 0.15) * 10;
  } else if (debtRatio <= 0.4) {
    // Scale 15 → 5 across 0.3-0.4 range
    debtPts = 15 - ((debtRatio - 0.3) / 0.1) * 10;
  } else {
    debtPts = 0;
  }

  // Risk penalty: upcoming due date + low cash
  // (Simplified: just check if cash is very low relative to debt payment)
  if (cashBalance < debtPay && debtPay > 0) {
    debtPts = Math.max(0, debtPts - 5);
  }

  debtPts = Math.max(0, Math.min(25, debtPts));

  // ===== COMPONENT 4: TREND & CONSISTENCY (0–10 pts) =====
  trendPts = calculateTrendScore(user, cashflowRatio, debtRatio, wealthRate);

  // ===== EMERGENCY FUND BONUS (0–10 pts) =====
  let emergencyBonus = 0;
  const monthlyExpenses = expenses > 0 ? expenses : 1; // avoid division by zero
  const emergencyMonths = emergencyFund / monthlyExpenses;

  if (emergencyMonths >= 3) {
    emergencyBonus = 10;
  } else if (emergencyMonths >= 1) {
    emergencyBonus = 5;
  }

  // ===== ASSEMBLE SCORE =====
  let rawScore = cashflowPts + disciplinePts + debtPts + trendPts + emergencyBonus;

  // ===== GUARDRAIL 1: Negative remaining cash =====
  if (remainingCash < 0) {
    rawScore = Math.min(rawScore, 35);
  }

  // ===== GUARDRAIL 2: High debt ratio =====
  if (debtRatio > 0.5) {
    rawScore = Math.min(rawScore, 25);
  }

  // ===== GUARDRAIL 3: Clamp =====
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    components: {
      cashflow: Math.round(cashflowPts),
      discipline: Math.round(disciplinePts),
      debt: Math.round(debtPts),
      trend: Math.round(trendPts),
    },
    breakdown: {
      cashflowRatio: Math.round(cashflowRatio * 100) / 100,
      cashflowExplanation: getcashflowExplanation(cashflowRatio),
      wealthRate: Math.round(wealthRate * 100),
      wealthExplanation: getWealthExplanation(wealthRate),
      debtRatio: Math.round(debtRatio * 100),
      debtExplanation: getDebtExplanation(debtRatio),
      trendExplanation: getTrendExplanation(user),
      emergencyFundMonths: Math.round(emergencyMonths * 10) / 10,
    },
  };
}

// Helper: Create zero score result
function createZeroScore() {
  return {
    score: 0,
    components: { cashflow: 0, discipline: 0, debt: 0, trend: 0 },
    breakdown: {
      cashflowRatio: 0,
      cashflowExplanation: "No financial data entered yet",
      wealthRate: 0,
      wealthExplanation: "Add your income and expenses to get started",
      debtRatio: 0,
      debtExplanation: "No debt information",
      trendExplanation: "Add monthly data to see trends",
      emergencyFundMonths: 0,
    },
  };
}

// Helper: Score from snapshot when income is zero
function scoreFromSnapshot(snapshot: any): ReturnType<typeof calculateMoneyHealthScore> {
  const totalBalance = (snapshot.cash || 0) + (snapshot.savings || 0) + (snapshot.investing || 0) + (snapshot.emergency || 0);

  let score = 30;
  if (totalBalance >= 5000) score = 45;
  if (totalBalance >= 10000) score = 55;

  return {
    score,
    components: { cashflow: 0, discipline: 0, debt: 0, trend: 0 },
    breakdown: {
      cashflowRatio: 0,
      cashflowExplanation: "Add income to get started",
      wealthRate: 0,
      wealthExplanation: "Good balances, but no income tracked",
      debtRatio: 0,
      debtExplanation: "No income data",
      trendExplanation: "Need monthly income to analyze trends",
      emergencyFundMonths: 0,
    },
  };
}

// Helper: Calculate trend score (0–10 pts)
function calculateTrendScore(user: UserData, cashflowRatio: number, debtRatio: number, wealthRate: number): number {
  const currentMonthIdx = user.data.currentMonth;

  // Need at least 2 past months for trend
  if (currentMonthIdx < 1) {
    return 5; // neutral
  }

  const prevMonth = user.data.months[currentMonthIdx - 1];
  if (!prevMonth) {
    return 5;
  }

  let trendPts = 5; // base neutral

  const prevIncome = Number(prevMonth.totals?.income) || 0;
  if (prevIncome <= 0) {
    return 5; // can't trend without prev income
  }

  const prevOutflow = (Number(prevMonth.totals?.expenses) || 0) +
    (Number(prevMonth.totals?.savings) || 0) +
    (Number(prevMonth.totals?.investing) || 0) +
    (Number(prevMonth.totals?.debtPay) || 0);
  const prevCashflowRatio = prevOutflow / prevIncome;

  const prevDebtPay = Number(prevMonth.totals?.debtPay) || 0;
  const prevDebtRatio = prevDebtPay / prevIncome;

  const prevSavings = Number(prevMonth.totals?.savings) || 0;
  const prevInvesting = Number(prevMonth.totals?.investing) || 0;
  const prevWealthRate = (prevSavings + prevInvesting) / prevIncome;

  // +3 pts if cashflow improved
  if (cashflowRatio < prevCashflowRatio) {
    trendPts += 3;
  }

  // +3 pts if debt ratio declined
  if (debtRatio < prevDebtRatio) {
    trendPts += 3;
  }

  // +4 pts if wealthRate stable or improving
  if (wealthRate >= prevWealthRate * 0.95) {
    trendPts += 4;
  }

  return Math.min(10, trendPts);
}

// Helper: Cashflow explanation
function getcashflowExplanation(ratio: number): string {
  const percent = Math.round(ratio * 100);
  if (ratio <= 0.7) {
    return `You allocated ${percent}% of income. Excellent control.`;
  } else if (ratio <= 0.9) {
    return `You allocated ${percent}% of income. Good but watch closely.`;
  } else if (ratio <= 1.0) {
    return `You allocated ${percent}% of income. Very tight, no margin.`;
  } else {
    return `You allocated ${percent}% of income. Overspending detected.`;
  }
}

// Helper: Wealth explanation
function getWealthExplanation(rate: number): string {
  const percent = Math.round(rate * 100);
  if (rate >= 0.2) {
    return `You saved/invested ${percent}% of income. Excellent discipline.`;
  } else if (rate >= 0.1) {
    return `You saved/invested ${percent}% of income. Good habit.`;
  } else if (rate >= 0.05) {
    return `You saved/invested ${percent}% of income. Building slowly.`;
  } else if (rate > 0) {
    return `You saved/invested ${percent}% of income. Start increasing.`;
  } else {
    return `No savings or investing this month. Consider setting aside funds.`;
  }
}

// Helper: Debt explanation
function getDebtExplanation(ratio: number): string {
  const percent = Math.round(ratio * 100);
  if (ratio === 0) {
    return "You have no active debt. Perfect position—focus on building wealth.";
  } else if (ratio <= 0.15) {
    return `Debt payments are ${percent}% of income. Very manageable and healthy.`;
  } else if (ratio <= 0.3) {
    return `Debt payments are ${percent}% of income. Monitor and consider accelerating payoff.`;
  } else if (ratio <= 0.4) {
    return `Debt payments are ${percent}% of income. Heavy burden—prioritize debt reduction.`;
  } else {
    return `Debt payments are ${percent}% of income. Critical level—take immediate action.`;
  }
}

// Helper: Trend explanation
function getTrendExplanation(user: UserData): string {
  const currentMonthIdx = user.data.currentMonth;
  if (currentMonthIdx < 1) {
    return "Add more months of data to see trends.";
  }

  const prevMonth = user.data.months[currentMonthIdx - 1];
  if (!prevMonth || !prevMonth.totals) {
    return "Add more months of data to see trends.";
  }

  // Simple heuristic: compare last 2 months
  const prevIncome = Number(prevMonth.totals.income) || 0;
  const currIncome = Number(user.data.months[currentMonthIdx].totals?.income) || 0;

  if (currIncome > prevIncome) {
    return "Income trending up. Good momentum.";
  } else if (currIncome < prevIncome * 0.9) {
    return "Income declining. Watch expenses carefully.";
  } else {
    return "Income stable. Consistent month-to-month.";
  }
}

// ===== ACTION RECOMMENDATIONS =====

export interface HealthScoreBreakdown {
  cashflowRatio: number;
  cashflowExplanation: string;
  wealthRate: number;
  wealthExplanation: string;
  debtRatio: number;
  debtExplanation: string;
  trendExplanation: string;
  emergencyFundMonths: number;
}

export interface RecommendedAction {
  priority: "red" | "yellow" | "green";
  title: string;
  description: string;
}

export function getRecommendedActions(scoreResult: ReturnType<typeof calculateMoneyHealthScore>, snapshot: any = {}): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const { breakdown, score } = scoreResult;

  // Safely handle null/undefined snapshot
  const safeSnapshot = snapshot || {};
  const cashBalance = safeSnapshot.cash || 0;
  const emergencyFund = safeSnapshot.emergency || 0;
  const monthlyExpenses = breakdown.cashflowRatio > 0 ? 100 : 1; // simplified

  // Check if there's no financial data yet
  const hasNoData = breakdown.cashflowExplanation === "No financial data entered yet";

  if (hasNoData) {
    // Show data entry prompt instead of warning messages
    actions.push({
      priority: "red",
      title: "Get Started with Your Finances",
      description: "Add your current account balances and enter your monthly income and expenses to get personalized insights.",
    });
    return actions;
  }

  // RED actions
  if (breakdown.cashflowRatio > 1.0) {
    actions.push({
      priority: "red",
      title: "Overspending Alert",
      description: "You're spending more than you earn. Immediately reduce expenses or increase income.",
    });
  }

  if (breakdown.debtRatio > 0.4) {
    actions.push({
      priority: "red",
      title: "High Debt Burden",
      description: "Debt payments exceed 40% of income. Focus on paying down debt or increasing income.",
    });
  }

  if (cashBalance < breakdown.debtRatio * 100 && breakdown.debtRatio > 0.2) {
    actions.push({
      priority: "red",
      title: "Low Cash Reserve",
      description: "Your cash balance is low relative to debt payments. Build an emergency buffer.",
    });
  }

  if (emergencyFund === 0 && breakdown.cashflowRatio > 0.8) {
    actions.push({
      priority: "red",
      title: "No Emergency Fund",
      description: "You have no emergency cushion. Start building one, even €100/month helps.",
    });
  }

  // YELLOW actions
  if (breakdown.cashflowRatio > 0.9 && breakdown.cashflowRatio <= 1.0) {
    actions.push({
      priority: "yellow",
      title: "Tight Cashflow",
      description: "You have very little margin. Small unexpected costs could cause problems.",
    });
  }

  if (breakdown.debtRatio > 0.25 && breakdown.debtRatio <= 0.4) {
    actions.push({
      priority: "yellow",
      title: "Moderate Debt",
      description: "Your debt payments are significant. Consider accelerating payoff or refinancing.",
    });
  }

  if (breakdown.wealthRate < 5 && breakdown.wealthRate > 0) {
    actions.push({
      priority: "yellow",
      title: "Low Savings Rate",
      description: "You're saving less than 5%. Try to increase to 10%+ for financial security.",
    });
  }

  // GREEN actions
  if (breakdown.cashflowRatio < 0.85 && breakdown.cashflowRatio > 0) {
    actions.push({
      priority: "green",
      title: "Healthy Cashflow",
      description: "Good spending control. Keep maintaining this balance.",
    });
  }

  if (breakdown.debtRatio < 0.2 && breakdown.debtRatio >= 0) {
    actions.push({
      priority: "green",
      title: "Manageable Debt",
      description: "Debt is under control. You have room in your budget for savings.",
    });
  }

  if (breakdown.wealthRate >= 0.1) {
    actions.push({
      priority: "green",
      title: "Strong Savings Discipline",
      description: "Excellent job saving 10%+. Keep building wealth.",
    });
  }

  if (breakdown.emergencyFundMonths >= 1) {
    actions.push({
      priority: "green",
      title: "Emergency Fund Building",
      description: `You have ${breakdown.emergencyFundMonths} months of expenses saved. Continue building.`,
    });
  }

  return actions;
}

// ===== COLOR & LABEL FUNCTIONS =====

export function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 55) return "#f97316";
  return "#ef4444";
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent control";
  if (score >= 70) return "Healthy & stable";
  if (score >= 50) return "Needs attention";
  if (score >= 30) return "Financial stress";
  return "High risk";
}

export function getPriorityColor(priority: "red" | "yellow" | "green"): string {
  if (priority === "red") return "#ef4444";
  if (priority === "yellow") return "#f97316";
  return "#22c55e";
}
