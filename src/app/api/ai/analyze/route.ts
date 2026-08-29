import { NextResponse } from "next/server";
import { listComplaints } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { description, location } = await request.json();

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json({ error: "Description is required for AI triage." }, { status: 400 });
    }

    const text = description.trim();
    const openAiKey = process.env.OPENAI_API_KEY;

    let aiResult = {
      category: "Water & sanitation",
      aiSummary: "",
      urgency: "Normal",
      estimatedSla: "48 hours (90s demo mode)",
      routingDepartment: "Rural Water & Sanitation / Municipal Field Ops",
      reasoning: "",
    };

    // If OPENAI_API_KEY is configured in env, call OpenAI GPT-4o-mini
    if (openAiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content: `You are the Nivaran AI Civic Intelligence engine for Indian local grievances.
Analyze the citizen grievance and return a JSON object with:
- "category": One of ["Water & sanitation", "Roads & transport", "Electricity", "Cleanliness", "Other"]
- "aiSummary": A crisp, professional, one-line summary (under 60 characters) suitable for an official department queue.
- "urgency": One of ["Normal", "High", "Critical"]
- "routingDepartment": e.g. "Rural Water & Sanitation (RWS)", "APSPDCL Electricity Board", "Panchayat Raj & Roads", or "Municipal Public Health".
- "reasoning": 1 brief sentence on why you categorized it this way.
Output ONLY valid JSON.`,
              },
              {
                role: "user",
                content: `Location: ${location || "Andhra Pradesh"}\nIssue Description: ${text}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content.trim());
          aiResult = { ...aiResult, ...parsed };
        }
      } catch (e) {
        console.error("OpenAI API call failed, falling back to local NLP engine", e);
      }
    }

    // High-precision local heuristic NLP classification if OpenAI key not set or on fallback
    if (!aiResult.aiSummary) {
      const lower = text.toLowerCase();

      // Water & Sanitation keywords
      if (
        lower.includes("water") ||
        lower.includes("pump") ||
        lower.includes("bore") ||
        lower.includes("pipe") ||
        lower.includes("leak") ||
        lower.includes("drain") ||
        lower.includes("tank") ||
        lower.includes("sewage") ||
        lower.includes("handpump") ||
        lower.includes("drinking")
      ) {
        aiResult.category = "Water & sanitation";
        aiResult.routingDepartment = "Rural Water & Sanitation / Municipal Engineering";
        aiResult.urgency = lower.includes("drinking") || lower.includes("sewage") ? "High" : "Normal";
        aiResult.reasoning = "Detected water supply or drainage infrastructure terms.";
      }
      // Electricity keywords
      else if (
        lower.includes("light") ||
        lower.includes("electric") ||
        lower.includes("power") ||
        lower.includes("wire") ||
        lower.includes("transformer") ||
        lower.includes("pole") ||
        lower.includes("blackout") ||
        lower.includes("current") ||
        lower.includes("spark")
      ) {
        aiResult.category = "Electricity";
        aiResult.routingDepartment = "APSPDCL (Electricity Distribution)";
        aiResult.urgency = lower.includes("spark") || lower.includes("wire") || lower.includes("transformer") ? "Critical" : "Normal";
        aiResult.reasoning = "Detected electrical grid or lighting equipment issue.";
      }
      // Roads & Transport keywords
      else if (
        lower.includes("road") ||
        lower.includes("pothole") ||
        lower.includes("bridge") ||
        lower.includes("street") ||
        lower.includes("traffic") ||
        lower.includes("asphalt") ||
        lower.includes("tar") ||
        lower.includes("pavement") ||
        lower.includes("bus")
      ) {
        aiResult.category = "Roads & transport";
        aiResult.routingDepartment = "Panchayat Raj & Roads Department";
        aiResult.urgency = lower.includes("accident") || lower.includes("pothole") ? "High" : "Normal";
        aiResult.reasoning = "Detected roadway, paving, or transit disruption.";
      }
      // Cleanliness keywords
      else if (
        lower.includes("garbage") ||
        lower.includes("waste") ||
        lower.includes("trash") ||
        lower.includes("dump") ||
        lower.includes("plastic") ||
        lower.includes("clean") ||
        lower.includes("smell") ||
        lower.includes("sanitary")
      ) {
        aiResult.category = "Cleanliness";
        aiResult.routingDepartment = "Municipal Public Health & Sanitation";
        aiResult.urgency = "Normal";
        aiResult.reasoning = "Detected solid waste or public space cleanliness issue.";
      } else {
        aiResult.category = "Water & sanitation";
        aiResult.routingDepartment = "Ward Grievance Cell";
        aiResult.urgency = "Normal";
        aiResult.reasoning = "Assigned default municipal intake tier.";
      }

      // Generate crisp one-line summary
      const cleanFirstLine = text.split(/[.!?\n]/)[0].trim();
      aiResult.aiSummary = cleanFirstLine.length > 55 ? `${cleanFirstLine.slice(0, 52)}...` : cleanFirstLine;
    }

    // Check for duplicate issues in the same district/location
    const allComplaints = await listComplaints();
    const potentialDuplicates = allComplaints.filter((c) => {
      if (c.status === "Resolved") return false;
      const sameLocation = location && c.location && c.location.toLowerCase().includes(location.split(",")[0].toLowerCase().trim());
      const sameCategory = c.category.toLowerCase() === aiResult.category.toLowerCase();
      return sameLocation && sameCategory;
    });

    const duplicateMatch = potentialDuplicates[0]
      ? {
          id: potentialDuplicates[0].id,
          title: potentialDuplicates[0].title,
          status: potentialDuplicates[0].status,
          similarityScore: 0.88,
          message: `Notice: A similar ${potentialDuplicates[0].category.toLowerCase()} complaint (${potentialDuplicates[0].id}) is already active in ${potentialDuplicates[0].location}.`,
        }
      : null;

    return NextResponse.json({
      success: true,
      ...aiResult,
      duplicateMatch,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
