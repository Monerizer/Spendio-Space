import { UserData } from "@/context/SpendioContext";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Build a comprehensive financial context from user data
 * This will be sent to the backend for the AI service to use
 */
function buildFinancialContext(user: UserData): string {
  const currentMonth = user.data.months[user.data.currentMonth];
  const t = currentMonth?.totals || {
    income: 0,
    expenses: 0,
    savings: 0,
    investing: 0,
    debtPay: 0,
  };

  const snapshot = user.data.snapshot || {
    cash: 0,
    emergency: 0,
    savings: 0,
    investing: 0,
    debt: 0,
  };

  const emergencyFundMonths = snapshot.emergency > 0 && t.expenses > 0 ? snapshot.emergency / t.expenses : 0;

  return `
Current Month: ${user.data.currentMonth}

Monthly Financials:
- Income: ${t.income}
- Expenses: ${t.expenses}
- Savings: ${t.savings}
- Investing: ${t.investing}
- Debt Payments: ${t.debtPay}
- Monthly Net: ${t.income - t.expenses - t.savings - t.investing - t.debtPay}

Account Balances (Snapshot):
- Cash: ${snapshot.cash}
- Savings Account: ${snapshot.savings}
- Emergency Fund: ${snapshot.emergency}
- Investing Account: ${snapshot.investing}

Financial Health Metrics:
- Cashflow Ratio: ${((t.expenses + t.savings + t.investing + t.debtPay) / Math.max(t.income, 1) * 100).toFixed(1)}%
- Wealth Rate: ${((t.savings + t.investing) / Math.max(t.income, 1) * 100).toFixed(1)}%
- Debt Ratio: ${(t.debtPay / Math.max(t.income, 1) * 100).toFixed(1)}%
- Emergency Fund: ${emergencyFundMonths.toFixed(1)} months of expenses

Debts:
${
  user.data.debts.length > 0
    ? user.data.debts.map((d) => `- ${d.name}: ${d.total} total, ${d.monthly}/month`).join("\n")
    : "- No debts recorded"
}

Savings & Investing Targets:
- Savings Target: ${user.data.targets.savings}
- Investing Target: ${user.data.targets.investing}
`;
}

/**
 * Send a message to the backend AI endpoint
 * The backend handles the OpenAI API key securely
 */
export async function sendAIMessage(
  userMessage: string,
  user: UserData,
  conversationHistory: AIMessage[] = []
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const financialContext = buildFinancialContext(user);

    const payload = {
      message: userMessage,
      userEmail: user.email,
      userName: user.name,
      financialContext,
      conversationHistory: conversationHistory
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role,
          content: m.content,
        })),
    };

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "Failed to get response from AI service",
      };
    }

    const data = await response.json();
    const assistantMessage = data.response || "";

    return {
      success: true,
      response: assistantMessage,
    };
  } catch (err) {
    return {
      success: false,
      error: `Error communicating with AI service: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Parse AI response to check if it contains transaction adjustment requests
 */
export function parseTransactionIntent(userMessage: string): {
  isAdjustment: boolean;
  intent: string;
} {
  const lowerMessage = userMessage.toLowerCase();

  if (
    lowerMessage.includes("adjust") ||
    lowerMessage.includes("change") ||
    lowerMessage.includes("add transaction") ||
    lowerMessage.includes("delete") ||
    lowerMessage.includes("modify") ||
    lowerMessage.includes("update")
  ) {
    return {
      isAdjustment: true,
      intent: "The user is asking to modify financial data.",
    };
  }

  return {
    isAdjustment: false,
    intent: "The user is asking for advice or information.",
  };
}
