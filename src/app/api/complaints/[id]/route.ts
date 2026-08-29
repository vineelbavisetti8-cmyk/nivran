import { NextResponse } from "next/server";
import { findComplaint, updateComplaint } from "@/lib/store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const item = await findComplaint(id);
  return item
    ? NextResponse.json(item)
    : NextResponse.json({ error: "Complaint not found" }, { status: 404 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const item = await updateComplaint(id, body.action, {
    message: body.message,
    author: body.author,
    role: body.role,
    proofPhoto: body.proofPhoto,
    officialLevel: body.officialLevel,
    reason: body.reason,
    // Admin Edit fields
    title: body.title,
    description: body.description,
    category: body.category,
    location: body.location,
    priority: body.priority,
    status: body.status,
    currentLevel: body.currentLevel,
    owner: body.owner,
    imageUrl: body.imageUrl,
  });

  return item
    ? NextResponse.json(item)
    : NextResponse.json({ error: "Complaint not found or could not be updated." }, { status: 404 });
}
