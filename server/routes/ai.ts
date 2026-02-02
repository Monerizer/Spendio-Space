import { Request, Response } from "express";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  userEmail: string;
  userName: string;
  financialContext: string;
  conversationHistory?: ChatMessage[];
}

interface HealthScoreRequest {
  financialData: Record<string, any>;
  prompt: string;
}

/**
 * Handle AI health score calculation securely with backend API key
 */
export async function handleHealthScore(req: Request, res: Response) {
  try {
    const { financialData, prompt } = req.body as HealthScoreRequest;

    // Validate input
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return res.status(500).json({ error: "AI service not configured" });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert financial advisor with deep knowledge of personal finance, behavioral economics, and wealth building. Analyze the provided financial data comprehensively and return a JSON response with:
{
  "score": number (0-100),
  "rating": string ("Poor" | "Fair" | "Good" | "Excellent"),
  "summary": string (brief overview of financial health),
  "strengths": [strings] (up to 3 key strengths based on data),
  "weaknesses": [strings] (up to 3 areas needing improvement),
  "recommendations": [strings] (up to 5 specific, actionable recommendations),
  "insights": string (detailed analysis of trends, patterns, and financial health),
  "benchmarkComparison": string (how they compare to typical users),
  "trendAnalysis": string (month-over-month changes and direction),
  "personalizedGoals": [strings] (up to 3 smart financial goals tailored to their situation),
  "riskFactors": [strings] (potential risks to monitor),
  "opportunityAreas": [strings] (areas with greatest potential for improvement)
}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);

      if (response.status === 401) {
        return res.status(500).json({ error: "AI service authentication failed" });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: "AI service rate limit reached. Please try again later." });
      }

      return res.status(500).json({ error: "AI service error. Please try again later." });
    }

    // Parse response
    const responseText = await response.text();
    if (!responseText || responseText.trim().length === 0) {
      return res.status(500).json({ error: "Empty response from AI service" });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse OpenAI response:", parseErr);
      return res.status(500).json({ error: "Invalid response from AI service" });
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No message content in OpenAI response:", data);
      return res.status(500).json({ error: "No response from AI service" });
    }

    // Parse the JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const analysis = JSON.parse(jsonStr);

      return res.json(analysis);
    } catch (parseErr) {
      console.error("Failed to parse analysis JSON:", parseErr, "Content:", content.substring(0, 200));
      return res.status(500).json({ error: "Failed to parse AI analysis" });
    }
  } catch (error) {
    console.error("Health score error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

/**
 * Handle AI chat requests securely with backend API key
 */
export async function handleAIChat(req: Request, res: Response) {
  try {
    const { message, userEmail, userName, financialContext, conversationHistory = [] } = req.body as ChatRequest;

    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required and must be a non-empty string" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return res.status(500).json({ error: "AI service not configured" });
    }

    // Build conversation messages
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a friendly and expert financial advisor AI. Help the user with their financial questions and advice.

⚠️ IMPORTANT LIMITATIONS:
- You are READ-ONLY. You CANNOT modify any financial data.
- You CANNOT add transactions, update income, create expenses, or change any data.
- You can only analyze and provide advice on their existing financial data.

⚠️ EMPTY ACCOUNT DETECTION:
If the user's financial data is mostly empty (income = 0, expenses = 0, savings = 0, no transactions), you MUST:
1. Recognize the account is empty/uninitialized
2. Say: "Your financial account appears to be empty. To get started, please go to the Financial Data page to:"
3. List the key things they need to set up:
   - Add your current account balances (cash, savings, emergency fund, investments)
   - Enter your monthly income
   - Add your monthly expenses
   - (Optionally) Set savings and investing targets
4. Say: "Once you've set up your financial data, I can provide personalized analysis and advice."
5. Do NOT give recommendations about improving metrics that are currently zero

When users ask you to add/modify transactions, you MUST:
1. Clearly state: "I cannot directly modify your financial data. I'm a read-only advisor."
2. Tell them: "Please go to the Financial Data page to manually make these changes"
3. Offer to analyze their updated data once they've made the changes

User: ${userName} (${userEmail})

Their Financial Summary:
${financialContext}

Remember to:
- Be specific and data-driven
- Provide actionable advice
- Be honest about your limitations
- Always direct data modifications to the Financial Data page
- Recognize when accounts are empty and suggest setup first
- Ask clarifying questions if needed
- Be supportive and encouraging`,
      },
      ...conversationHistory,
      {
        role: "user",
        content: message,
      },
    ];

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);

      if (response.status === 401) {
        return res.status(500).json({ error: "AI service authentication failed" });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: "AI service rate limit reached. Please try again later." });
      }

      return res.status(500).json({ error: "AI service error. Please try again later." });
    }

    // Parse response
    const responseText = await response.text();
    if (!responseText || responseText.trim().length === 0) {
      return res.status(500).json({ error: "Empty response from AI service" });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse OpenAI response:", parseErr);
      return res.status(500).json({ error: "Invalid response from AI service" });
    }

    const assistantMessage = data.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      console.error("No message content in OpenAI response:", data);
      return res.status(500).json({ error: "No response from AI service" });
    }

    return res.json({ response: assistantMessage });
  } catch (error) {
    console.error("AI chat error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
