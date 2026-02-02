import { Handler } from "@netlify/functions";

interface HealthScoreRequest {
  financialData: Record<string, any>;
  prompt: string;
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
    const { financialData, prompt } = JSON.parse(event.body || "{}") as HealthScoreRequest;

    // Validate input
    if (!prompt || typeof prompt !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is required" }),
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

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No message content in OpenAI response:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No response from AI service" }),
      };
    }

    // Parse the JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const analysis = JSON.parse(jsonStr);

      return {
        statusCode: 200,
        body: JSON.stringify(analysis),
      };
    } catch (parseErr) {
      console.error("Failed to parse analysis JSON:", parseErr, "Content:", content.substring(0, 200));
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to parse AI analysis" }),
      };
    }
  } catch (error) {
    console.error("Health score error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
    };
  }
};

export { handler };
