import type { UserData } from "@/context/SpendioContext";

interface HealthScoreAnalysis {
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

/**
 * AI-powered health score calculation using OpenAI
 * Analyzes all financial data to provide intelligent assessment
 */
export async function calculateAIHealthScore(user: UserData): Promise<HealthScoreAnalysis> {
  try {
    // Prepare comprehensive financial data for analysis
    const financialData = prepareFinancialData(user);

    // Generate the analysis prompt
    const prompt = generateAnalysisPrompt(financialData, user);

    // Call backend endpoint (Express server) with generous timeout for OpenAI API
    let response;
    try {
      const controller = new AbortController();
      // 45 second timeout to allow OpenAI API time to respond
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      response = await fetch("/api/ai/health-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          financialData,
          prompt,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchErr) {
      console.error("Failed to fetch health score API:", fetchErr instanceof Error ? fetchErr.message : String(fetchErr));
      console.warn("Using fallback health score - API unavailable or timeout");
      return calculateFallbackHealthScore(user);
    }

    if (!response || !response.ok) {
      const statusText = response ? `(status ${response.status})` : "(no response)";
      console.error("Health score API error " + statusText);
      console.warn("Using fallback health score calculation");
      return calculateFallbackHealthScore(user);
    }

    // Check if response has content
    let responseText = "";
    try {
      responseText = await response.text();
    } catch (readErr) {
      console.error("Failed to read health score response:", readErr);
      return calculateFallbackHealthScore(user);
    }

    if (!responseText || responseText.trim().length === 0) {
      console.warn("Empty response from health score API");
      return calculateFallbackHealthScore(user);
    }

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse health score response:", parseErr);
      console.log("Response preview:", responseText.substring(0, 200));
      return calculateFallbackHealthScore(user);
    }

    // Validate the response
    if (typeof analysis.score !== "number" || analysis.score < 0 || analysis.score > 100) {
      analysis.score = Math.round(analysis.score) || 50;
    }

    return {
      score: Math.round(analysis.score),
      rating: analysis.rating || "Good",
      summary: analysis.summary || "Financial health assessment complete.",
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      insights: analysis.insights || "",
      benchmarkComparison: analysis.benchmarkComparison || "",
      trendAnalysis: analysis.trendAnalysis || "",
      personalizedGoals: Array.isArray(analysis.personalizedGoals) ? analysis.personalizedGoals : [],
      riskFactors: Array.isArray(analysis.riskFactors) ? analysis.riskFactors : [],
      opportunityAreas: Array.isArray(analysis.opportunityAreas) ? analysis.opportunityAreas : [],
    };
  } catch (error) {
    console.error("Error calculating AI health score:", error);
    return calculateFallbackHealthScore(user);
  }
}

/**
 * Prepare comprehensive financial data for AI analysis with trends and benchmarking
 */
function prepareFinancialData(user: UserData) {
  const months = user.data.months;

  // Calculate totals across all months
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavings = 0;
  let totalInvesting = 0;
  let totalDebtPayments = 0;
  const monthlyStats: any[] = [];

  Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort chronologically
    .forEach(([monthKey, monthData]) => {
      totalIncome += monthData.totals.income;
      totalExpenses += monthData.totals.expenses;
      totalSavings += monthData.totals.savings;
      totalInvesting += monthData.totals.investing;
      totalDebtPayments += monthData.totals.debtPay;

      monthlyStats.push({
        month: monthKey,
        income: monthData.totals.income,
        expenses: monthData.totals.expenses,
        savings: monthData.totals.savings,
        investing: monthData.totals.investing,
        debtPayments: monthData.totals.debtPay,
      });
    });

  // Calculate month-over-month trends
  let incomeGrowth = 0;
  let expenseGrowth = 0;
  let savingsGrowth = 0;

  if (monthlyStats.length >= 2) {
    const currentMonth = monthlyStats[monthlyStats.length - 1];
    const previousMonth = monthlyStats[monthlyStats.length - 2];

    if (previousMonth.income > 0) {
      incomeGrowth = ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100;
    }
    if (previousMonth.expenses > 0) {
      expenseGrowth = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;
    }
    if (previousMonth.savings > 0) {
      savingsGrowth = ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100;
    }
  }

  // Calculate averages
  const numMonths = monthlyStats.length || 1;
  const avgMonthlyIncome = totalIncome / numMonths;
  const avgMonthlyExpenses = totalExpenses / numMonths;
  const savingsRate = avgMonthlyIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const investmentRate = avgMonthlyIncome > 0 ? (totalInvesting / totalIncome) * 100 : 0;

  // Debt analysis
  const totalDebtAmount = user.data.debts.reduce((sum, debt) => sum + debt.total, 0);
  const debtToIncomeRatio = avgMonthlyIncome > 0 ? (totalDebtAmount / avgMonthlyIncome) * 100 : 0;

  // Emergency fund analysis
  const emergencyFundMonths = avgMonthlyExpenses > 0 ? (user.data.snapshot?.emergency || 0) / avgMonthlyExpenses : 0;

  // Expense breakdown
  const expenseCategories: Record<string, number> = {};
  Object.values(months).forEach((month) => {
    month.tx.forEach((tx) => {
      if (tx.type === "expense") {
        expenseCategories[tx.cat] = (expenseCategories[tx.cat] || 0) + tx.amt;
      }
    });
  });

  // Financial benchmarking (industry averages)
  const benchmarks = {
    avgSavingsRate: 20, // Industry average ~20%
    avgInvestmentRate: 5, // Conservative average
    avgDebtToIncome: 36, // Recommended max
    recommendedEmergencyFund: 6, // 6 months of expenses
    avgExpenseRatio: 70, // Expenses should be ~70% of income
  };

  // Calculate percentile rankings
  const savingsPercentile =
    savingsRate >= benchmarks.avgSavingsRate ? "above average" : "below average";
  const investmentPercentile =
    investmentRate >= benchmarks.avgInvestmentRate ? "above average" : "below average";
  const debtPercentile =
    debtToIncomeRatio <= benchmarks.avgDebtToIncome ? "above average" : "below average";

  return {
    currency: user.currency,
    totalIncome,
    totalExpenses,
    totalSavings,
    totalInvesting,
    totalDebtPayments,
    avgMonthlyIncome,
    avgMonthlyExpenses,
    savingsRate: Math.round(savingsRate),
    investmentRate: Math.round(investmentRate),
    currentCash: user.data.snapshot?.cash || 0,
    emergencyFund: user.data.snapshot?.emergency || 0,
    savingsTarget: user.data.snapshot?.savings || 0,
    investmentAmount: user.data.snapshot?.investing || 0,
    debtAmount: user.data.snapshot?.debt || 0,
    debtCount: user.data.debts.length,
    totalDebtAmount,
    debtToIncomeRatio: Math.round(debtToIncomeRatio),
    emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
    expenseByCategory: expenseCategories,
    savingsGoal: user.data.targets.savings,
    investingGoal: user.data.targets.investing,
    monthlyData: monthlyStats,
    dataPoints: numMonths,
    // Trend analysis
    trendMetrics: {
      monthOverMonthIncomeChange: Math.round(incomeGrowth * 10) / 10,
      monthOverMonthExpenseChange: Math.round(expenseGrowth * 10) / 10,
      monthOverMonthSavingsChange: Math.round(savingsGrowth * 10) / 10,
      currentTrend: incomeGrowth > 0 ? "improving" : "declining",
    },
    // Benchmarking
    benchmarks,
    benchmarkRatings: {
      savingsPercentile,
      investmentPercentile,
      debtPercentile,
    },
  };
}

/**
 * Generate comprehensive analysis prompt for OpenAI with trends and benchmarking
 */
function generateAnalysisPrompt(data: any, user: UserData): string {
  const topExpenses = Object.entries(data.expenseByCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ${user.currency}${(amt as number).toFixed(2)}`)
    .join(", ");

  const trends = data.trendMetrics;
  const benchmarks = data.benchmarkRatings;
  const expenseRatio = data.avgMonthlyIncome > 0
    ? ((data.avgMonthlyExpenses / data.avgMonthlyIncome) * 100).toFixed(1)
    : "N/A";

  return `
You are analyzing the financial health of ${user.name}. Provide a REALISTIC, SPECIFIC, and ACTIONABLE assessment. Avoid generic statements - focus on their actual numbers and situation.

=== FINANCIAL SNAPSHOT ===

Monthly Flow:
- Income: ${user.currency} ${data.avgMonthlyIncome.toFixed(2)}
- Expenses: ${user.currency} ${data.avgMonthlyExpenses.toFixed(2)} (${expenseRatio}% of income)
- Savings: ${user.currency} ${(data.avgMonthlyIncome - data.avgMonthlyExpenses - data.totalInvesting/data.dataPoints).toFixed(2)}/month
- Top Spending: ${topExpenses}

Wealth Building:
- Savings Rate: ${data.savingsRate}% (industry avg: 20%)
- Investment Rate: ${data.investmentRate}% (industry avg: 5%)
- Total Saved: ${user.currency} ${data.totalSavings.toFixed(2)}
- Total Invested: ${user.currency} ${data.totalInvesting.toFixed(2)}

Financial Safety:
- Emergency Fund: ${user.currency} ${data.emergencyFund.toFixed(2)} (${data.emergencyFundMonths.toFixed(1)} months of expenses, target: 6 months)
- Total Liquid Cash: ${user.currency} ${data.currentCash.toFixed(2)}
- Debt Amount: ${user.currency} ${data.totalDebtAmount.toFixed(2)} across ${data.debtCount} accounts
- Debt-to-Income: ${data.debtToIncomeRatio}% (healthy if < 36%)

Growth Trends:
- Income Change (MoM): ${trends.monthOverMonthIncomeChange > 0 ? "+" : ""}${trends.monthOverMonthIncomeChange}%
- Expense Change (MoM): ${trends.monthOverMonthExpenseChange > 0 ? "+" : ""}${trends.monthOverMonthExpenseChange}%
- Savings Change (MoM): ${trends.monthOverMonthSavingsChange > 0 ? "+" : ""}${trends.monthOverMonthSavingsChange}%
- Overall Trend: ${trends.currentTrend}

=== SCORING FRAMEWORK ===

CRITICAL SUCCESS FACTORS:
1. Income Stability: Is income consistent? Growing? Declining?
2. Expense Control: Are they overspending relative to income? Can they cut back?
3. Emergency Readiness: Do they have 3-6 months emergency fund? If not, how critical is it?
4. Debt Management: Is debt manageable relative to income? Are they paying it down?
5. Wealth Building: Are they saving/investing enough for their age and goals?
6. Goal Progress: How close are they to their stated savings/investing targets?

=== ANALYSIS REQUIREMENTS ===

Score (0-100):
- 80-100: Excellent financial health with strong savings, manageable debt, emergency fund in place
- 60-79: Good health but needs improvement in one area (savings, emergency fund, or debt)
- 40-59: Fair - multiple areas need work, moderate financial stress
- 0-39: Poor - serious financial issues need immediate attention

Rating: Must match score (Poor/Fair/Good/Excellent)

Summary: 2-3 sentences describing their overall financial situation. Be honest about what's working and what isn't.

Strengths: List 2-3 SPECIFIC strengths based on their actual numbers. Examples:
- "Consistent income of ${user.currency}${data.avgMonthlyIncome.toFixed(0)}/month with positive month-over-month growth"
- "Strong emergency fund of ${data.emergencyFundMonths.toFixed(1)} months" (if > 3)
- "Low debt-to-income ratio at ${data.debtToIncomeRatio}%"
- "Saving ${data.savingsRate}% of income"

Weaknesses: List 2-3 SPECIFIC areas needing improvement:
- "Emergency fund only covers ${data.emergencyFundMonths.toFixed(1)} months of expenses (need 6)"
- "Debt-to-income ratio of ${data.debtToIncomeRatio}% is above the healthy 36% threshold"
- "Savings rate of ${data.savingsRate}% is below the recommended 20%"

Recommendations: 3-5 SPECIFIC, MEASURABLE actions:
- If savings low: "Increase savings by ${user.currency}${((0.20 * data.avgMonthlyIncome - (data.totalSavings/data.dataPoints)).toFixed(2))}/month to reach 20% savings rate"
- If emergency fund low: "Build emergency fund to ${user.currency}${(data.avgMonthlyExpenses * 6).toFixed(0)} (currently ${user.currency}${data.emergencyFund.toFixed(0)})"
- If expenses high: "Top categories are ${topExpenses} - review these for potential cuts"
- Specific debt payoff timeline if they have debt

Insights: Detailed analysis of patterns. Examples:
- "Your expenses are trending [up/down] by ${Math.abs(trends.monthOverMonthExpenseChange)}% month-over-month, which suggests [discipline/concern]"
- "Compared to industry averages, your ${benchmarks.savingsPercentile} savings rate"
- "At current savings rate of ${user.currency}${(data.totalSavings/data.dataPoints).toFixed(0)}/month, you'll reach your ${user.currency}${data.savingsGoal.toFixed(0)} goal in approximately [X] months"

TrendAnalysis: How their financial situation is evolving:
- Month-over-month changes in income, expenses, savings
- Trajectory (improving/declining/stable)
- Sustainability of current spending patterns

BenchmarkComparison: How they stack up:
- vs. typical person their age (if you can infer age)
- vs. industry averages
- Areas where they're ahead and behind

PersonalizedGoals: 2-3 specific, achievable financial goals based on their situation

RiskFactors: 1-3 specific risks to watch:
- Low emergency fund
- High debt-to-income ratio
- Volatile income
- Expense creep

OpportunityAreas: 2-3 biggest opportunities:
- Specific expense categories to cut
- Savings targets to increase
- Debt payoff timeline improvements
- Income growth opportunities

=== IMPORTANT ===
Be CRITICAL but CONSTRUCTIVE. Don't sugarcoat if they're in a bad situation, but provide hope and a roadmap. Use their actual numbers throughout. Avoid generic advice.
`;
}

/**
 * Fallback calculation if AI is unavailable
 */
function calculateFallbackHealthScore(user: UserData): HealthScoreAnalysis {
  // Use existing calculation logic as fallback
  const months = Object.values(user.data.months);
  
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavings = 0;
  let totalInvesting = 0;

  months.forEach((month) => {
    totalIncome += month.totals.income;
    totalExpenses += month.totals.expenses;
    totalSavings += month.totals.savings;
    totalInvesting += month.totals.investing;
  });

  const numMonths = months.length || 1;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const investmentRate = totalIncome > 0 ? (totalInvesting / totalIncome) * 100 : 0;

  // Calculate score based on metrics
  let score = 50;
  if (savingsRate > 20) score += 15;
  if (investmentRate > 5) score += 10;
  if (user.data.debts.length === 0) score += 10;
  if ((user.data.snapshot?.emergency || 0) > totalExpenses / numMonths * 3) score += 10;
  if (totalIncome > totalExpenses) score += 5;

  score = Math.min(100, Math.max(0, score));

  return {
    score: Math.round(score),
    rating: score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor",
    summary: "Financial health assessment based on your spending and savings patterns.",
    strengths: [
      savingsRate > 20 ? "Strong savings habit" : "Consistent spending tracking",
      investmentRate > 5 ? "Active investment strategy" : "Potential for growth",
    ],
    weaknesses: [
      user.data.debts.length > 0 ? "Outstanding debt" : "Opportunity to build more wealth",
    ],
    recommendations: [
      "Continue tracking expenses regularly",
      savingsRate < 20 ? "Aim to save at least 20% of income" : "Maintain your savings discipline",
      "Consider building an emergency fund of 3-6 months",
    ],
    insights: `Based on ${numMonths} months of data: You have ${totalIncome > totalExpenses ? "positive" : "negative"} cash flow with a ${savingsRate.toFixed(1)}% savings rate.`,
  };
}

/**
 * Format analysis for display
 */
export function formatHealthScoreAnalysis(analysis: HealthScoreAnalysis): string {
  return `
Score: ${analysis.score}/100 - ${analysis.rating}

${analysis.summary}

Strengths:
${analysis.strengths.map((s) => `• ${s}`).join("\n")}

Areas to Improve:
${analysis.weaknesses.map((w) => `• ${w}`).join("\n")}

Recommendations:
${analysis.recommendations.map((r) => `• ${r}`).join("\n")}

Insights:
${analysis.insights}
`;
}
