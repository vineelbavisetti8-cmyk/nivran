import { NextResponse } from "next/server";
import { createComplaint, listComplaints } from "@/lib/store";
import { apLocations } from "@/data";

export async function GET() {
  return NextResponse.json(await listComplaints());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, description, citizenName, phone } = body;
    
    if (!category?.trim() || !description?.trim() || !citizenName?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const district = (body.district || "").trim();
    const address = (body.address || "").trim();
    const location = (body.location || "").trim();

    // Determine district and address
    let finalDistrict = district;
    let finalAddress = address;

    if (!finalDistrict && location) {
      const match = apLocations.find((loc) => location.includes(loc.split(",")[0]));
      if (match) {
        finalDistrict = match;
        finalAddress = location.replace(match, "").replace(/^[,\s]+|[,\s]+$/g, "");
      } else {
        finalDistrict = location;
      }
    }

    if (finalDistrict && !apLocations.some((loc) => loc.toLowerCase().includes(finalDistrict.toLowerCase()) || finalDistrict.toLowerCase().includes(loc.toLowerCase()))) {
      return NextResponse.json({ error: "Please select a supported Andhra Pradesh district." }, { status: 400 });
    }

    if (!finalAddress && !location) {
      return NextResponse.json({ error: "Please manually enter your specific street address or landmark." }, { status: 400 });
    }

    const finalLocation = finalAddress && finalDistrict
      ? `${finalAddress}, ${finalDistrict}`
      : location || `${finalAddress || finalDistrict}`;

    const created = await createComplaint({
      category: body.category,
      description: body.description,
      district: finalDistrict || undefined,
      address: finalAddress || undefined,
      location: finalLocation,
      citizenName: body.citizenName,
      phone: body.phone,
      imageUrl: body.imageUrl,
      audioUrl: body.audioUrl,
      voiceTranscript: body.voiceTranscript,
      aiSummary: body.aiSummary,
      priority: body.priority,
      isDemoSpeed: body.isDemoSpeed !== false, // default to true for hackathon demo
      lat: body.lat,
      lng: body.lng,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create complaint";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
