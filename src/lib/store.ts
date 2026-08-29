import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  complaints as seedComplaints,
  officialLevels,
  type Complaint,
  type EscalationEvent,
  type StatusHistoryEvent,
} from "@/data";

type StoredComplaint = Complaint;
const filePath = path.join(process.cwd(), "data", "complaints.json");

async function readStored(): Promise<StoredComplaint[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as StoredComplaint[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [];
  } catch {
    return [];
  }
}

async function writeStored(data: StoredComplaint[]): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function listComplaints(): Promise<Complaint[]> {
  const stored = await readStored();
  if (stored.length === 0) {
    await writeStored(seedComplaints);
    return seedComplaints;
  }
  return stored;
}

export async function findComplaint(id: string): Promise<Complaint | undefined> {
  const all = await listComplaints();
  return all.find((item) => item.id.toLowerCase() === id.toLowerCase());
}

export async function createComplaint(input: {
  category: string;
  description: string;
  district?: string;
  address?: string;
  location?: string;
  citizenName: string;
  phone: string;
  imageUrl?: string;
  audioUrl?: string;
  voiceTranscript?: string;
  aiSummary?: string;
  priority?: "Normal" | "High" | "Critical";
  isDemoSpeed?: boolean;
  lat?: number;
  lng?: number;
}): Promise<Complaint> {
  const existing = await listComplaints();
  const now = new Date();
  const idNum = Math.floor(10000 + Math.random() * 90000);
  const id = `NVR-26-${idNum}`;

  const isDemo = input.isDemoSpeed ?? true;
  const slaSecondsTotal = isDemo ? 90 : 86400 * 2;
  const slaDeadline = new Date(now.getTime() + slaSecondsTotal * 1000).toISOString();

  const l1 = officialLevels[0];
  const firstSentence = input.description.trim().split(/[.!?\n]/)[0].slice(0, 60) || input.category;
  const title = input.aiSummary ? input.aiSummary.slice(0, 60) : firstSentence;

  const initialStatusHistory: StatusHistoryEvent = {
    id: `SH-${Date.now()}-1`,
    status: "Submitted",
    comment: `Complaint filed by citizen ${input.citizenName || "Resident"}. Automated AI triage routed to Level 1 (${l1.department}).`,
    actorRole: "citizen",
    actorName: input.citizenName || "Resident",
    createdAt: now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
  };

  // Build combined location string if district and address provided
  const district = input.district?.trim() || "";
  const address = input.address?.trim() || "";
  let fullLocation = input.location?.trim() || "";
  if (!fullLocation) {
    if (address && district) {
      fullLocation = `${address}, ${district}`;
    } else {
      fullLocation = address || district || "Andhra Pradesh";
    }
  }

  const newComplaint: StoredComplaint = {
    id,
    title: title.endsWith(".") ? title.slice(0, -1) : title,
    category: input.category,
    district: district || undefined,
    address: address || undefined,
    location: fullLocation,
    lat: input.lat,
    lng: input.lng,
    status: "Submitted",
    priority: input.priority || "Normal",
    currentLevel: 1,
    levelTitle: `Level 1 · ${l1.title}`,
    owner: `${l1.department} · ${l1.name}`,
    due: isDemo ? "90s demo SLA" : "48 hours",
    slaDeadline,
    slaSecondsTotal,
    isDemoSpeed: isDemo,
    created: "Just now",
    createdAtIso: now.toISOString(),
    description: input.description.trim(),
    aiSummary: input.aiSummary || input.description.trim().slice(0, 100),
    citizenName: input.citizenName.trim(),
    phone: input.phone.trim(),
    imageUrl: input.imageUrl,
    audioUrl: input.audioUrl,
    voiceTranscript: input.voiceTranscript,
    escalationLog: [],
    statusHistory: [initialStatusHistory],
    comments: [],
    reactions: 0,
    confirmed: false,
  };

  const updatedList = [newComplaint, ...existing];
  await writeStored(updatedList);
  return newComplaint;
}

export async function updateComplaint(
  id: string,
  action:
    | "acknowledge"
    | "update_progress"
    | "resolve_by_official"
    | "confirm_citizen"
    | "reopen_citizen"
    | "escalate_manual"
    | "admin_edit"
    | "comment"
    | "react"
    | "update",
  payload?: {
    message?: string;
    author?: string;
    role?: "Citizen" | "Official" | "System";
    proofPhoto?: string;
    officialLevel?: number;
    reason?: string;
    // Admin Edit fields:
    title?: string;
    description?: string;
    category?: string;
    district?: string;
    address?: string;
    location?: string;
    priority?: "Normal" | "High" | "Critical";
    status?: "Submitted" | "Acknowledged" | "In progress" | "Awaiting confirmation" | "Resolved" | "Escalated";
    currentLevel?: 1 | 2 | 3;
    owner?: string;
    imageUrl?: string;
  }
): Promise<Complaint | undefined> {
  const existing = await listComplaints();
  const index = existing.findIndex((item) => item.id.toLowerCase() === id.toLowerCase());
  if (index < 0) return undefined;

  const item = existing[index];
  const now = new Date();
  const timestampStr = now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  if (action === "admin_edit") {
    if (payload?.title) item.title = payload.title;
    if (payload?.description) item.description = payload.description;
    if (payload?.category) item.category = payload.category;
    if (payload?.district) item.district = payload.district;
    if (payload?.address) item.address = payload.address;
    if (payload?.location) {
      item.location = payload.location;
    } else if (payload?.address || payload?.district) {
      const d = payload.district || item.district || "";
      const a = payload.address || item.address || "";
      if (a && d) item.location = `${a}, ${d}`;
      else if (a) item.location = a;
      else if (d) item.location = d;
    }
    if (payload?.priority) item.priority = payload.priority;
    if (payload?.imageUrl !== undefined) item.imageUrl = payload.imageUrl;
    if (payload?.owner) item.owner = payload.owner;
    
    if (payload?.currentLevel) {
      item.currentLevel = payload.currentLevel;
      const lvlObj = officialLevels.find((l) => l.level === payload.currentLevel) || officialLevels[0];
      item.levelTitle = `Level ${payload.currentLevel} · ${lvlObj.title}`;
    }

    if (payload?.status) {
      item.status = payload.status;
      if (payload.status === "Resolved") {
        item.confirmed = true;
        item.due = "Closed & Confirmed";
      } else if (payload.status === "Awaiting confirmation") {
        item.due = "Awaiting Citizen Confirmation";
      } else if (payload.status === "Escalated") {
        item.due = "Escalated to Supervisor";
      }
    }

    item.statusHistory = [
      ...(item.statusHistory ?? []),
      {
        id: `SH-${Date.now()}`,
        status: item.status,
        comment: `Admin/Official modified ticket properties: ${payload?.message || "Updated details, assigned level, or status."}`,
        actorRole: "official",
        actorName: payload?.author || "Administrator",
        createdAt: timestampStr,
      },
    ];
  } else if (action === "acknowledge") {
    item.status = "Acknowledged";
    item.statusHistory = [
      ...(item.statusHistory ?? []),
      {
        id: `SH-${Date.now()}`,
        status: "Acknowledged",
        comment: payload?.message || `Officer ${payload?.author || item.owner} formally acknowledged the ticket and assigned field crew.`,
        actorRole: "official",
        actorName: payload?.author || item.owner,
        createdAt: timestampStr,
      },
    ];
  } else if (action === "update_progress") {
    item.status = "In progress";
    item.statusHistory = [
      ...(item.statusHistory ?? []),
      {
        id: `SH-${Date.now()}`,
        status: "In progress",
        comment: payload?.message || "Field work is actively underway on site.",
        actorRole: "official",
        actorName: payload?.author || item.owner,
        createdAt: timestampStr,
        proofUrl: payload?.proofPhoto,
      },
    ];
  } else if (action === "resolve_by_official") {
    item.status = "Awaiting confirmation";
    item.due = "Awaiting Citizen Confirmation";
    item.resolutionProof = {
      photoUrl: payload?.proofPhoto,
      note: payload?.message || "Redressal action completed on site as per civic standards.",
      resolvedBy: payload?.author || item.owner,
      resolvedAt: timestampStr,
    };
    item.statusHistory = [
      ...(item.statusHistory ?? []),
      {
        id: `SH-${Date.now()}`,
        status: "Resolved by Official",
        comment: payload?.message || "Official declared redressal complete with evidence photo. Ticket moved to Awaiting Citizen Confirmation.",
        actorRole: "official",
        actorName: payload?.author || item.owner,
        createdAt: timestampStr,
        proofUrl: payload?.proofPhoto,
      },
    ];
  } else if (action === "confirm_citizen") {
    item.status = "Resolved";
    item.confirmed = true;
    item.due = "Closed & Confirmed";
    item.statusHistory = [
      ...(item.statusHistory ?? []),
      {
        id: `SH-${Date.now()}`,
        status: "Closed & Confirmed",
        comment: `Citizen ${item.citizenName || payload?.author || "Citizen"} verified the work and confirmed complete resolution. Ticket closed.`,
        actorRole: "citizen",
        actorName: item.citizenName || payload?.author || "Citizen",
        createdAt: timestampStr,
      },
    ];
  } else if (action === "reopen_citizen") {
    const nextLevelNum = (Math.min(item.currentLevel + 1, 3)) as 1 | 2 | 3;
    const nextLevelObj = officialLevels.find((l) => l.level === nextLevelNum) || officialLevels[2];

    const prevLevelTitle = item.levelTitle;
    item.status = "Escalated";
    item.confirmed = false;
    item.citizenReopened = true;
    item.currentLevel = nextLevelNum;
    item.levelTitle = `Level ${nextLevelNum} · ${nextLevelObj.title}`;
    item.owner = `${nextLevelObj.department} · ${nextLevelObj.name}`;
    item.due = "Reopened & Escalated";

    const reason = payload?.message || "Citizen inspected the site and rejected the resolution because the issue was not satisfactorily fixed.";

    const escalationEvent: EscalationEvent = {
      id: `ESC-${Date.now()}`,
      fromLevel: item.currentLevel - 1,
      toLevel: nextLevelNum,
      fromTitle: prevLevelTitle,
      toTitle: item.levelTitle,
      escalatedAt: timestampStr,
      reason: `Citizen Reopened: ${reason}`,
    };

    item.escalationLog = [...(item.escalationLog ?? []), escalationEvent];

    item.statusHistory = [
      ...(item.statusHistory ?? []),
      {
        id: `SH-${Date.now()}`,
        status: "Reopened by Citizen",
        comment: `Citizen rejected resolution: "${reason}". Automatically escalated to ${item.levelTitle}.`,
        actorRole: "citizen",
        actorName: item.citizenName || "Citizen",
        createdAt: timestampStr,
      },
    ];
  } else if (action === "escalate_manual" || action === "update") {
    if (action === "escalate_manual") {
      performEscalation(item, payload?.reason || "SLA Deadline Breached");
    }
  } else if (action === "comment" && payload?.message?.trim()) {
    item.comments = [
      ...(item.comments ?? []),
      {
        id: `CMT-${Date.now()}`,
        author: payload.author?.trim() || "Community member",
        role: payload.role || "Citizen",
        text: payload.message.trim(),
        created: timestampStr,
      },
    ];
  } else if (action === "react") {
    item.reactions = (item.reactions ?? 0) + 1;
  }

  existing[index] = item;
  await writeStored(existing);
  return item;
}

export function performEscalation(item: Complaint, reason: string): boolean {
  if (item.status === "Resolved" || item.confirmed) return false;
  if (item.currentLevel >= 3) return false;

  const now = new Date();
  const timestampStr = now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const prevLevel = item.currentLevel;
  const prevTitle = item.levelTitle;
  const nextLevelNum = (prevLevel + 1) as 1 | 2 | 3;
  const nextLevelObj = officialLevels.find((l) => l.level === nextLevelNum) || officialLevels[2];

  item.currentLevel = nextLevelNum;
  item.levelTitle = `Level ${nextLevelNum} · ${nextLevelObj.title}`;
  item.owner = `${nextLevelObj.department} · ${nextLevelObj.name}`;
  item.status = "Escalated";
  item.due = "Escalated to Supervisor";

  const slaSecs = item.isDemoSpeed ? 90 : 86400 * 2;
  item.slaDeadline = new Date(now.getTime() + slaSecs * 1000).toISOString();

  const escalationEvent: EscalationEvent = {
    id: `ESC-${Date.now()}`,
    fromLevel: prevLevel,
    toLevel: nextLevelNum,
    fromTitle: prevTitle,
    toTitle: item.levelTitle,
    escalatedAt: timestampStr,
    reason,
  };

  item.escalationLog = [...(item.escalationLog ?? []), escalationEvent];

  item.statusHistory = [
    ...(item.statusHistory ?? []),
    {
      id: `SH-${Date.now()}`,
      status: "Escalated",
      comment: `Automatic SLA breach escalation: No resolution within response window. Handed over from Level ${prevLevel} to Level ${nextLevelNum} (${nextLevelObj.title}).`,
      actorRole: "system",
      actorName: "Nivaran Auto-Escalation Engine",
      createdAt: timestampStr,
    },
  ];

  return true;
}

export async function checkAndEscalateDueComplaints(): Promise<{ escalatedCount: number; escalatedIds: string[] }> {
  const all = await listComplaints();
  const now = new Date();
  const escalatedIds: string[] = [];

  for (const item of all) {
    if (item.status === "Resolved" || item.confirmed) continue;
    if (item.currentLevel >= 3) continue;

    const deadline = new Date(item.slaDeadline);
    if (now >= deadline) {
      const success = performEscalation(
        item,
        `SLA Breached: Response window expired (${item.isDemoSpeed ? "90s demo SLA" : "48-hour statutory SLA"} breached without official redressal).`
      );
      if (success) {
        escalatedIds.push(item.id);
      }
    }
  }

  if (escalatedIds.length > 0) {
    await writeStored(all);
  }

  return { escalatedCount: escalatedIds.length, escalatedIds };
}
