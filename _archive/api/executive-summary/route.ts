import { NextRequest, NextResponse } from "next/server";
import type { AIExecutiveSummaryInput } from "@/lib/ai/types";
import { buildExecutiveSummaryPrompt, parseAIResponse } from "@/lib/ai/aiExecutiveSummary";

/**
 * Server-side API route for generating AI Executive Summary.
 * This ensures OpenAI API keys are never exposed to the client.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Parse request body
    const input: AIExecutiveSummaryInput = await request.json();

    // Validate required fields
    if (!input.annualEnergyUse || !input.annualEnergyCost || !input.topECMs || input.topECMs.length === 0) {
      return NextResponse.json(
        { error: "Invalid input: missing required audit data" },
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
        model: "gpt-4o-mini", // Using cost-effective model
        messages: [
          {
            role: "system",
            content:
              "You are a professional energy consultant. Generate executive summaries based strictly on provided data. Return only valid JSON matching the specified structure.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent, conservative output
        max_tokens: 1500,
        response_format: { type: "json_object" }, // Ensure JSON output
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: "OpenAI API error",
          details: errorData.error?.message || "Unknown error",
        },
        { status: openaiResponse.status }
      );
    }

    const data = await openaiResponse.json();
    const aiContent = data.choices[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json(
        { error: "No content received from OpenAI" },
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
        error: "Failed to generate executive summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
