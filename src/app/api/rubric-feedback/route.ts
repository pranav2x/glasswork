import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

type ContributorInput = {
  name: string;
  score: number;
  tier: "carry" | "solid" | "ghost";
  rawStats: Record<string, number>;
  activityPattern: string;
};

type FeedbackItem = {
  label: string;
  detail: string;
};

type ContributorFeedback = {
  name: string;
  focusAreas: FeedbackItem[];
  nextStep: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("rubric") as File | null;
    const contributorsJson = formData.get("contributors") as string | null;
    const isDoc = formData.get("isDoc") === "true";

    if (!file || !contributorsJson) {
      return NextResponse.json({ error: "Missing rubric file or contributor data" }, { status: 400 });
    }

    const contributors: ContributorInput[] = JSON.parse(contributorsJson);

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Determine MIME type
    const mimeType = file.type || "application/pdf";

    // Build the contributor summary for the prompt
    const contributorSummary = contributors
      .map(
        (c) =>
          `- ${c.name}: Score ${c.score}/100, Tier: ${c.tier === "carry" ? "LOCKED IN (top performer)" : c.tier === "solid" ? "MID (average)" : "SELLING (underperforming)"}, Activity: ${c.activityPattern}, Stats: ${JSON.stringify(c.rawStats)}`
      )
      .join("\n");

    const projectType = isDoc ? "Google Doc (collaborative writing project)" : "GitHub Repository (collaborative coding project)";

    const prompt = `You are a strict but constructive academic advisor analyzing a group project rubric.

PROJECT TYPE: ${projectType}

RUBRIC: (attached file)

TEAM MEMBERS:
${contributorSummary}

Based on this rubric, generate specific, actionable improvement feedback for EACH team member. For each person, identify 2-3 focus areas directly tied to rubric criteria where they need to improve, and one concrete next step.

IMPORTANT:
- Reference SPECIFIC rubric criteria, categories, or scoring dimensions by name
- Tailor feedback to each person's actual performance data (score, tier, activity pattern, stats)
- For top performers ("carry"), focus on how they can push from good to excellent on the rubric
- For mid performers ("solid"), identify the 1-2 rubric areas that would most move the needle
- For underperformers ("ghost"), prioritize the rubric basics they're missing
- Be direct and specific, not generic. Use the rubric language.
- Keep each focus area detail to 1-2 sentences max

Respond in this EXACT JSON format (no markdown, no code fences, just raw JSON):
{
  "rubricName": "Name or title of the rubric if visible",
  "feedback": [
    {
      "name": "Contributor Name",
      "focusAreas": [
        { "label": "Short area name", "detail": "Specific actionable feedback tied to rubric criteria" }
      ],
      "nextStep": "One concrete action they should take this week"
    }
  ]
}`;

    // Build content blocks — use document type for PDFs, image for images, or fall back to text
    const contentBlocks: unknown[] = [];

    if (mimeType === "application/pdf") {
      contentBlocks.push({
        type: "document",
        source: { type: "base64", media_type: mimeType, data: base64 },
      });
    } else if (mimeType.startsWith("image/")) {
      contentBlocks.push({
        type: "image",
        source: { type: "base64", media_type: mimeType, data: base64 },
      });
    } else {
      // For text-based files, decode and include as text
      const textContent = Buffer.from(bytes).toString("utf-8");
      contentBlocks.push({ type: "text", text: `[Rubric file content — ${file.name}]:\n${textContent}` });
    }

    contentBlocks.push({ type: "text", text: prompt });

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{ role: "user", content: contentBlocks }],
        temperature: 0.3,
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error("Claude API error:", errText);
      return NextResponse.json({ error: "Claude API request failed" }, { status: 502 });
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData?.content?.[0]?.text ?? "";

    // Extract JSON from the response (handle possible markdown fences)
    let jsonStr = rawText.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr) as {
      rubricName: string;
      feedback: ContributorFeedback[];
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Rubric feedback error:", error);
    return NextResponse.json(
      { error: "Failed to process rubric" },
      { status: 500 }
    );
  }
}
