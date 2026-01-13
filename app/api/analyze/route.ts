import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const runtime = "nodejs";

const DEFAULT_SYSTEM_PROMPT = `
You are a senior UX conversion analyst with deep CRO expertise.

Analyze the provided screenshot to identify conversion issues that affect the user’s ability to complete the primary goal.

Base your analysis strictly on what is visible in the screenshot.
Do not assume hidden states, future steps, or backend behavior.
If something is unclear, explicitly state the uncertainty and lower severity.

Use established UX laws to structure findings:
- Hick’s Law
- Fitts’s Law
- Von Restorff Effect
- Jakob’s Law
- Cognitive Load

Reference concrete UI elements (headlines, navigation, CTAs, forms, spacing, visual hierarchy).
Avoid generic advice. Be specific to what is shown.

Return ONLY valid JSON (no markdown, no commentary) matching this exact shape:
{
  "score": 0-100,
  "narrative": "2–4 sentence summary of the page’s conversion effectiveness and the most critical blockers",
  "topFixes": ["...", "...", "..."],
  "laws": {
    "hicks": { "title": "Hick’s Law", "severity": "Low|Medium|High", "finding": "...", "why": "...", "fix": "..." },
    "fitts": { "title": "Fitts’s Law", "severity": "Low|Medium|High", "finding": "...", "why": "...", "fix": "..." },
    "vonRestorff": { "title": "Von Restorff Effect", "severity": "Low|Medium|High", "finding": "...", "why": "...", "fix": "..." },
    "jakobs": { "title": "Jakob’s Law", "severity": "Low|Medium|High", "finding": "...", "why": "...", "fix": "..." },
    "cognitiveLoad": { "title": "Cognitive Load", "severity": "Low|Medium|High", "finding": "...", "why": "...", "fix": "..." }
  }
}

Rules:
- Each "fix" must be one concise, actionable sentence.
- Severity should reflect impact on conversion, not visual preference.
- "topFixes" must be the three highest-leverage actions for improving conversion.
- Always optimize for the user’s stated primary goal.

`.trim();

function getSystemPrompt() {
  return (process.env.UX_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT).toString();
}

type Payload = {
  imageDataUrl: string; // data:image/...;base64,...
};

type Severity = "Low" | "Medium" | "High";

type LawFinding = {
  title: string;
  severity: Severity;
  finding: string;
  why: string;
  fix: string;
};

type AIResult = {
  score: number; // 0-100
  narrative: string; // 2-4 sentences
  topFixes: string[]; // up to 3
  laws: {
    hicks: LawFinding;
    fitts: LawFinding;
    vonRestorff: LawFinding;
    jakobs: LawFinding;
    cognitiveLoad: LawFinding;
  };
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Guard: base64 can get huge
const MAX_IMAGE_DATAURL_CHARS = 2_000_000;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Payload;

    if (!body?.imageDataUrl || !body.imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Missing screenshot upload (imageDataUrl)" },
        { status: 400 }
      );
    }

    if (body.imageDataUrl.length > MAX_IMAGE_DATAURL_CHARS) {
      return NextResponse.json(
        {
          error:
            "Screenshot is too large. Upload a smaller image (or compress it) and try again.",
        },
        { status: 413 }
      );
    }

    // ✅ User prompt for image analysis
    const prompt = `Analyze this screenshot for UX conversion issues.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        // ✅ Full instructions now live in the system prompt (.env override supported)
        { role: "system", content: getSystemPrompt() },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: body.imageDataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { error: "Model returned empty response" },
        { status: 500 }
      );
    }

    let parsed: AIResult;
    try {
      parsed = JSON.parse(raw) as AIResult;
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw },
        { status: 500 }
      );
    }

    const score = clamp(Number(parsed.score ?? 0), 0, 100);
    const topFixes = Array.isArray(parsed.topFixes)
      ? parsed.topFixes.slice(0, 3)
      : [];
    const narrative =
      typeof parsed.narrative === "string"
        ? parsed.narrative.slice(0, 1500)
        : "";

    const laws =
      parsed.laws && typeof parsed.laws === "object" ? parsed.laws : ({} as any);

    // Store narrative inside laws JSON so your Results page can render it as laws.narrative
    const lawsToStore = { narrative, ...laws };

    const report = await prisma.report.create({
      data: {
        imageDataUrl: body.imageDataUrl,
        goal: "", // Default empty goal

        // keep these columns for now (or remove later)
        navItems: 0,
        ctaCount: 0,
        formFields: 0,

        score,
        topFixes: topFixes as any,
        laws: lawsToStore as any,
      },
    });

    return NextResponse.json({ reportId: report.id });
  } catch (err: any) {
    console.error("POST /api/analyze failed:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
