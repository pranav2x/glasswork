import { NextRequest } from "next/server";

export const maxDuration = 60;

type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

const TOOL_INSTRUCTIONS: Record<string, string> = {
  deep_research: `MODE: Deep Research
You are performing an exhaustive, multi-paragraph analysis. Examine statistical outliers, cross-contributor patterns, temporal trends in activity data, and potential root causes for performance gaps. Provide data-backed insights with specific numbers. Be thorough and analytical.`,
  canvas: `MODE: Canvas
You are helping the user draft or edit written feedback, improvement plans, or reports for their team. Format your response as polished, editable content with clear sections and headers. Use professional academic language suitable for sharing with team members or instructors.`,
  guided_learning: `MODE: Guided Learning
You are a tutor helping the user understand their team's performance. Use Socratic questioning - ask the user thought-provoking questions about their team dynamics, guide them to discover insights themselves, and explain metrics and patterns step by step. Be encouraging but honest. After each explanation, ask a follow-up question to deepen understanding.`,
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, reportContext, tool, model } = await req.json();

    const geminiModel = model || "gemini-3-flash-preview";

    const systemInstruction = buildSystemPrompt(reportContext, tool);

    const geminiMessages: ChatMessage[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })
    );

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", errText);
      let userMessage = "Gemini API request failed. Please try again.";
      if (geminiResponse.status === 429) {
        userMessage = "Rate limit reached — too many requests. Please wait a moment and try again.";
      } else if (geminiResponse.status === 403) {
        userMessage = "API key is invalid or doesn't have access to this model.";
      }
      return new Response(JSON.stringify({ error: userMessage }), {
        status: geminiResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr || jsonStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }
                } catch {
                  // skip malformed chunks
                }
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Report chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function buildSystemPrompt(
  reportContext: {
    title: string;
    sourceType: string;
    summary: string;
    contributors: {
      name: string;
      score: number;
      tier: string;
      rawStats: Record<string, number>;
      strengths: string[];
      improvements: string[];
    }[];
    teamAvgScore: number;
    carryCount: number;
    ghostCount: number;
  },
  tool?: string | null
): string {
  const contributorDetails = reportContext.contributors
    .map(
      (c) =>
        `- ${c.name}: Score ${c.score}/100, Tier: ${c.tier === "carry" ? "LOCKED IN (top)" : c.tier === "solid" ? "MID (average)" : "SELLING (under)"}, Stats: ${JSON.stringify(c.rawStats)}, Strengths: ${c.strengths.join(", ")}, Improvements: ${c.improvements.join(", ")}`
    )
    .join("\n");

  const projectType =
    reportContext.sourceType === "google_doc"
      ? "Google Doc (collaborative writing)"
      : "GitHub Repository (collaborative coding)";

  let prompt = `You are an AI assistant for Glasswork, a team contribution analysis tool. You have full context of the current report and can answer questions about it.

PROJECT: "${reportContext.title}"
TYPE: ${projectType}
SUMMARY: ${reportContext.summary || "No summary available"}

TEAM OVERVIEW:
- Total contributors: ${reportContext.contributors.length}
- Average score: ${reportContext.teamAvgScore}/100
- Top performers (LOCKED IN): ${reportContext.carryCount}
- Underperformers (SELLING): ${reportContext.ghostCount}

CONTRIBUTOR DETAILS:
${contributorDetails}

GUIDELINES:
- Reference specific data points and contributor names when answering
- Be concise but insightful
- Use the scoring tiers: LOCKED IN (>=70), MID (40-69), SELLING (<40)
- When comparing contributors, use actual numbers from their stats`;

  if (tool && TOOL_INSTRUCTIONS[tool]) {
    prompt += `\n\n${TOOL_INSTRUCTIONS[tool]}`;
  }

  return prompt;
}
