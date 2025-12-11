import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";
import type { CodeRequest, CodeResponse, Citation, CodeMessage } from "@/lib/types";

export const runtime = "edge";

const exa = new Exa(process.env.EXA_API_KEY);

// Build conversation context string
function buildConversationContext(history: CodeMessage[]): string {
  if (!history || history.length === 0) return "";
  
  // Limit to last 3 exchanges to avoid token limits
  const recentHistory = history.slice(-6);
  
  const contextText = recentHistory
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n\n");
  
  return contextText;
}

// Build query with context
function buildQueryWithContext(query: string, history: CodeMessage[]): string {
  const context = buildConversationContext(history);
  if (!context) return query;
  
  return `Based on our previous conversation:

${context}

Current question: ${query}

Please answer considering the context above.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CodeRequest = await request.json();
    const { query, conversationHistory = [] } = body;

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

    // Build query with conversation context
    const queryWithContext = buildQueryWithContext(query, conversationHistory);

    // Use Exa answer API with code-focused system prompt
    const systemPrompt = `You are an expert programming assistant. Focus on:
- Providing accurate, working code examples
- Explaining code concepts clearly
- Following best practices and modern patterns
- Including relevant documentation links when helpful
- Using proper code formatting with language tags

When answering coding questions:
1. Start with a brief explanation
2. Provide complete, runnable code examples
3. Explain key parts of the code
4. Mention potential edge cases or improvements

If the user refers to previous code or questions, use the provided context to give a relevant answer.`;

    const answerResponse = await exa.answer(queryWithContext, {
      text: true,
      model: "exa",
      systemPrompt,
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

    const response: CodeResponse = {
      answer: answerText,
      citations,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Code answer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate code answer";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
