import { NextRequest, NextResponse } from "next/server";
import type { AIExecutiveSummaryInput } from "@/lib/ai/types";
import { buildExecutiveSummaryPrompt, parseAIResponse } from "@/lib/ai/aiExecutiveSummary";

/**
 * Server-side API route for generating AI Executive Summary.
 * Keeps OpenAI API key secure on the server.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI summary feature not available. OpenAI API key not configured." },
        { status: 503 }
      );
    }

    // Parse request body
    const input: AIExecutiveSummaryInput = await request.json();

    // Validate required fields
    if (!input.annualEnergyCost || !input.businessType || !input.floorArea) {
      return NextResponse.json(
        { error: "Invalid input: missing required assessment data" },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = buildExecutiveSummaryPrompt(input);

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective model
        messages: [
          {
            role: "system",
            content:
              "You are a friendly energy consultant helping small business owners understand their energy assessment. Generate clear, actionable summaries. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        {
          error: "Unable to generate AI summary at this time",
          details: errorData.error?.message || "Service temporarily unavailable",
        },
        { status: 503 }
      );
    }

    const data = await openaiResponse.json();
    const aiContent = data.choices[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json(
        { error: "No response received from AI service" },
        { status: 500 }
      );
    }

    // Parse and validate the response
    const summary = parseAIResponse(aiContent);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating executive summary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
