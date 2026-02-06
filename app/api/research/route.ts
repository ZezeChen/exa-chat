import { NextRequest, NextResponse } from "next/server";
import { exaResearchCreate, exaResearchStatus } from "@/lib/exa-client";

export async function POST(request: NextRequest) {
  try {
    const { instructions } = await request.json();

    if (!instructions || typeof instructions !== "string") {
      return NextResponse.json(
        { error: "Instructions are required" },
        { status: 400 }
      );
    }

    const result = await exaResearchCreate(instructions);
    const taskId = result.researchId || result.id;

    if (!taskId) {
      return NextResponse.json(
        { error: "Failed to create research task" },
        { status: 500 }
      );
    }

    // Poll for result (with timeout)
    const maxAttempts = 60; // 10 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const statusResult = await exaResearchStatus(taskId);

      if (statusResult.status === "completed") {
        return NextResponse.json({
          status: "completed",
          output: statusResult.output,
          citations: statusResult.citations,
          costDollars: statusResult.costDollars,
        });
      } else if (statusResult.status === "failed") {
        return NextResponse.json(
          { error: "Research task failed", status: "failed" },
          { status: 500 }
        );
      }

      // Wait 10 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 10000));
      attempts++;
    }

    return NextResponse.json(
      { error: "Research task timed out", status: "timeout" },
      { status: 504 }
    );
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to perform research" },
      { status: 500 }
    );
  }
}
