import { Handler } from "@netlify/functions";

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

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { message, userEmail, userName, financialContext, conversationHistory = [] } = JSON.parse(
      event.body || "{}"
    ) as ChatRequest;

    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required and must be a non-empty string" }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "AI service not configured" }),
      };
    }

    // Build conversation messages
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `You are a friendly and expert financial advisor. Help the user with their financial questions and advice.

User: ${userName} (${userEmail})

Their Financial Summary:
${financialContext}

Remember to:
- Be specific and data-driven
- Provide actionable advice
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
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "AI service authentication failed" }),
        };
      }
      if (response.status === 429) {
        return {
          statusCode: 429,
          body: JSON.stringify({ error: "AI service rate limit reached. Please try again later." }),
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({ error: "AI service error. Please try again later." }),
      };
    }

    // Parse response
    const responseText = await response.text();
    if (!responseText || responseText.trim().length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Empty response from AI service" }),
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse OpenAI response:", parseErr);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid response from AI service" }),
      };
    }

    const assistantMessage = data.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      console.error("No message content in OpenAI response:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No response from AI service" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: assistantMessage }),
    };
  } catch (error) {
    console.error("AI chat error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
    };
  }
};

export { handler };
