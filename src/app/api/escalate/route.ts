import { NextResponse } from "next/server";
import { checkAndEscalateDueComplaints, findComplaint, updateComplaint } from "@/lib/store";

// GET: Regular cron/interval SLA checker
export async function GET() {
  const result = await checkAndEscalateDueComplaints();
  return NextResponse.json({
    status: "ok",
    checkedAt: new Date().toISOString(),
    ...result,
  });
}

// POST: Trigger immediate SLA breach / Fast-Forward escalation for live demo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, reason } = body;

    if (id) {
      const complaint = await findComplaint(id);
      if (!complaint) {
        return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
      }

      if (complaint.currentLevel >= 3) {
        return NextResponse.json({ error: "Complaint is already at the highest escalation level (District Collector)." }, { status: 400 });
      }

      const updated = await updateComplaint(id, "escalate_manual", {
        reason: reason || "Demo Action: Manual Fast-Forward Triggered (Simulating SLA Breach)",
      });

      return NextResponse.json({
        success: true,
        message: "Ticket successfully escalated to next hierarchy level.",
        complaint: updated,
      });
    }

    // If no specific ID, run routine check
    const result = await checkAndEscalateDueComplaints();
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Escalation trigger failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
