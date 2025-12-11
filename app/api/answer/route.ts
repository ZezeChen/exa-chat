import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";
import type { AnswerRequest, AnswerResponse, Citation } from "@/lib/types";

export const runtime = "edge";

function getExa() {
  return new Exa(process.env.EXA_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body: AnswerRequest = await request.json();
    const { query } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    if (!process.env.EXA_API_KEY) {
      return NextResponse.json(
        { error: "Exa API key not configured" },
        { status: 500 }
      );
    }

    const exa = getExa();
    const answerResponse = await exa.answer(query, {
      text: true,
    });

    // Handle empty answer
    const answerText = answerResponse.answer as string | undefined;
    if (!answerText || answerText.trim().length === 0) {
      return NextResponse.json(
        { error: "Unable to generate an answer. Please try a different question." },
        { status: 404 }
      );
    }

    const citations: Citation[] = (answerResponse.citations || []).map((citation) => ({
      id: citation.id || crypto.randomUUID(),
      url: citation.url,
      title: citation.title || "Untitled",
    }));

    const response: AnswerResponse = {
      answer: answerText,
      citations,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Answer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate answer";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
