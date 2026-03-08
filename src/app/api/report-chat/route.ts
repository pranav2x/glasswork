import { NextRequest } from "next/server";

export const maxDuration = 60;

const TOOL_INSTRUCTIONS: Record<string, string> = {
  deep_research: `MODE: Deep Research
You are performing an exhaustive, multi-paragraph analysis. Examine statistical outliers, cross-contributor patterns, temporal trends in activity data, and potential root causes for performance gaps. Provide data-backed insights with specific numbers. Be thorough and analytical.`,
  canvas: `MODE: Canvas
You are helping the user draft or edit written feedback, improvement plans, or reports for their team. Format your response as polished, editable content with clear sections and headers. Use professional academic language suitable for sharing with team members or instructors.`,
  guided_learning: `MODE: Guided Learning
You are a tutor helping the user understand their team's performance through guided discovery.

FORMAT YOUR RESPONSES WITH CLEAR STRUCTURE:
- Use **bold** headers for each section
- Use bullet points and numbered lists
- Keep paragraphs short (2-3 sentences max)
- Use markdown formatting throughout

APPROACH:
1. Start by acknowledging what the user asked about
2. Break down the relevant data into digestible pieces with clear formatting
3. Use Socratic questioning — ask thought-provoking questions about team dynamics
4. Guide the user to discover insights themselves rather than just stating facts
5. Explain metrics and patterns step by step with specific numbers
6. End with 1-2 follow-up questions to deepen understanding

Be encouraging but honest. Make the learning experience interactive and well-structured.`,
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, reportContext, tool, model } = await req.json();

    const claudeModel = model || "claude-sonnet-4-6";

    const systemPrompt = buildSystemPrompt(reportContext, tool);

    const claudeMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })
    );

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API error:", claudeModel, errText);
      let userMessage = "Claude API request failed. Please try again.";
      if (claudeResponse.status === 429) {
        userMessage = "Rate limit reached — too many requests. Please wait a moment and try again.";
      } else if (claudeResponse.status === 403) {
        userMessage = `This model (${claudeModel}) is not available. Try switching to a different model.`;
      } else if (claudeResponse.status === 404) {
        userMessage = `Model "${claudeModel}" was not found. Try switching to a different model.`;
      }
      return new Response(JSON.stringify({ error: userMessage }), {
        status: claudeResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = claudeResponse.body?.getReader();
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
                  // Claude streaming: content_block_delta events contain the text
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    controller.enqueue(new TextEncoder().encode(parsed.delta.text));
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
- Be concise but insightful — use short paragraphs and bullet points
- Use the scoring tiers: LOCKED IN (>=70), MID (40-69), SELLING (<40)
- When comparing contributors, use actual numbers from their stats
- IMPORTANT: When the user asks about a specific person, focus ONLY on that person. Do not bring up other contributors unless directly asked to compare
- Format your responses with markdown: use **bold** for emphasis, bullet points for lists, and headers for sections
- Keep responses focused and well-structured`;

  if (tool && TOOL_INSTRUCTIONS[tool]) {
    prompt += `\n\n${TOOL_INSTRUCTIONS[tool]}`;
  }

  return prompt;
}
