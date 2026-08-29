"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  MessageCircle,
  Send,
  Clock,
  AlertTriangle,
  Zap,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Check,
  X,
  FileCheck
} from "lucide-react";
import { Header } from "@/components/site";
import type { Complaint } from "@/data";

export default function Track() {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [actionFeedback, setActionFeedback] = useState("");
  const [isFastForwarding, setIsFastForwarding] = useState(false);

  // Citizen Reopen Modal
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  // Countdown timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Load ticket ID from URL
  const loadTicket = async (ticketId?: string) => {
    try {
      const allRes = await fetch("/api/complaints");
      const allData: Complaint[] = await allRes.json();
      setAllComplaints(allData);

      let targetId = ticketId;
      if (!targetId && typeof window !== "undefined") {
        targetId = new URLSearchParams(window.location.search).get("id") || "";
      }

      if (targetId) {
        const itemRes = await fetch(`/api/complaints/${targetId}`);
        if (itemRes.ok) {
          const itemData = await itemRes.json();
          setComplaint(itemData);
        } else if (allData.length > 0) {
          setComplaint(allData[0]);
        }
      } else if (allData.length > 0) {
        setComplaint(allData[0]);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, []);

  // SLA Live Countdown & Auto-Escalation Interval
  useEffect(() => {
    if (!complaint || complaint.status === "Resolved" || complaint.confirmed) {
      setSecondsRemaining(null);
      return;
    }

    const checkTimer = () => {
      const deadline = new Date(complaint.slaDeadline).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((deadline - now) / 1000));
      setSecondsRemaining(diffSecs);

      // If timer breached and not yet escalated, call escalate engine
      if (diffSecs === 0 && complaint.status !== "Escalated" && complaint.currentLevel < 3) {
        fetch("/api/escalate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: complaint.id, reason: "Live 90s SLA Timer Expired without Official Resolution" }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.complaint) {
              setComplaint(res.complaint);
            }
          })
          .catch(() => {});
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [complaint]);

  // SLA Time formatted string
  const formatSla = (secs: number) => {
    if (secs > 3600) {
      const hrs = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      return `${hrs}h ${mins}m`;
    }
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Perform Actions: Fast Forward Escalation, Confirm Resolution, Reopen, Comment, React
  const handleFastForwardEscalation = async () => {
    if (!complaint) return;
    setIsFastForwarding(true);
    try {
      const res = await fetch("/api/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: complaint.id,
          reason: `Demo Fast-Forward: SLA breach simulated at Level ${complaint.currentLevel}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.complaint) {
        setComplaint(data.complaint);
        setActionFeedback("⚡ SLA Breach Triggered! Ticket has auto-escalated to supervisor.");
      }
    } catch {
      setActionFeedback("Could not escalate ticket.");
    } finally {
      setIsFastForwarding(false);
    }
  };

  const handleConfirmCitizen = async () => {
    if (!complaint) return;
    const res = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm_citizen", author: complaint.citizenName || "Citizen" }),
    });
    const data = await res.json();
    if (res.ok) {
      setComplaint(data);
      setActionFeedback("🎉 Resolution verified and confirmed! Ticket is now closed.");
    }
  };

  const handleReopenCitizen = async () => {
    if (!complaint || !reopenReason.trim()) return;
    const res = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reopen_citizen",
        message: reopenReason,
        author: complaint.citizenName || "Citizen",
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setComplaint(data);
      setReopenModalOpen(false);
      setReopenReason("");
      setActionFeedback("⚠️ Resolution rejected. Ticket reopened and escalated directly to supervisor.");
    }
  };

  const handlePostComment = async () => {
    if (!complaint || !commentText.trim()) return;
    const res = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "comment",
        message: commentText,
        author: authorName || "Community Member",
        role: "Citizen",
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setComplaint(data);
      setCommentText("");
      setActionFeedback("Comment posted to public audit trail.");
    }
  };

  const handleAddReaction = async () => {
    if (!complaint) return;
    const res = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react" }),
    });
    const data = await res.json();
    if (res.ok) {
      setComplaint(data);
    }
  };

  if (loading || !complaint) {
    return (
      <div className="page bg-[#faf9f6] min-h-screen">
        <Header active="track" />
        <main className="page-main max-w-4xl mx-auto py-16 text-center">
          <div className="card max-w-md mx-auto p-8 shadow-sm">
            <RefreshCw size={32} className="animate-spin text-green mx-auto mb-4" />
            <h1 className="serif text-2xl font-bold">Connecting to SLA Watchdog...</h1>
            <p className="text-xs text-muted mt-2">Checking live Andhra Pradesh grievance queue.</p>
          </div>
        </main>
      </div>
    );
  }

  const isEscalated = complaint.status === "Escalated" || (complaint.escalationLog && complaint.escalationLog.length > 0);
  const isAwaitingConfirmation = complaint.status === "Awaiting confirmation";
  const isClosed = complaint.status === "Resolved" && complaint.confirmed;

  return (
    <div className="page bg-[#faf9f6] min-h-screen">
      <Header active="track" />

      <main className="page-main max-w-5xl mx-auto py-8 px-4 md:px-6">
        {/* TOP DEMO SWITCHER BAR */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 border border-line rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Inspect Demo Scenarios:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {allComplaints.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setComplaint(c);
                    setActionFeedback("");
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium border transition-all whitespace-nowrap ${
                    complaint.id === c.id
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                      : "bg-gray-50 text-gray-700 border-line hover:bg-gray-100"
                  }`}
                >
                  {c.id} ({c.status})
                </button>
              ))}
            </div>
          </div>

          <Link href="/official" className="text-xs text-green font-bold hover:underline flex items-center gap-1 whitespace-nowrap">
            Open Official Queue &rarr;
          </Link>
        </div>

        {actionFeedback && (
          <div className="p-3.5 mb-6 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-xl flex items-center justify-between animate-fadeIn">
            <span>{actionFeedback}</span>
            <button onClick={() => setActionFeedback("")} className="text-emerald-700 font-bold">
              &times;
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: MAIN HERO STATUS & LIFECYCLE TIMELINE */}
          <div className="lg:col-span-8 space-y-6">
            {/* ESCALATION BANNER (Blueprint §4 - Emotional Moment) */}
            {isEscalated && (
              <div className="escalation-badge-banner">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 grid place-items-center flex-none">
                  <Zap size={20} className="animate-bounce" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
                    <span>⚡ Ticket Auto-Escalated to {complaint.levelTitle}</span>
                  </div>
                  <p className="text-amber-900 mt-1 mb-0 leading-relaxed">
                    No resolution was logged within the response window. The SLA Watchdog engine has automatically forwarded this case up the administrative hierarchy.
                  </p>
                </div>
              </div>
            )}

            {/* HERO TICKET CARD */}
            <article className="card shadow-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-line">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {complaint.id}
                    </span>
                    <span className="text-xs text-muted">&bull; {complaint.location}</span>
                  </div>
                  <h1 className="serif text-2xl md:text-3xl font-bold text-ink m-0">
                    {complaint.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`tag ${
                      isClosed
                        ? "green"
                        : isAwaitingConfirmation
                        ? "blue"
                        : isEscalated
                        ? "amber"
                        : "green"
                    }`}
                  >
                    {isClosed ? "Closed & Verified" : complaint.status}
                  </span>
                </div>
              </div>

              {/* AI SUMMARY BOX */}
              {complaint.aiSummary && (
                <div className="my-4 p-3 bg-gray-50 rounded-xl border border-line flex items-start gap-2.5 text-xs text-gray-700">
                  <Sparkles size={16} className="text-emerald-700 flex-none mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-semibold block">AI Official Summary:</strong>
                    <span>{complaint.aiSummary}</span>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-800 leading-relaxed my-4 whitespace-pre-wrap">
                {complaint.description}
              </p>

              {complaint.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-line my-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={complaint.imageUrl}
                    alt="Citizen Evidence"
                    className="w-full max-h-96 object-cover"
                  />
                  <div className="bg-gray-900/80 text-white text-[11px] px-3 py-1.5 flex justify-between">
                    <span>Citizen Evidence Photo</span>
                    <span>Attached at intake</span>
                  </div>
                </div>
              )}

              {/* REACTION & DISCUSSION BAR */}
              <div className="flex items-center gap-4 pt-4 border-t border-line text-xs text-muted">
                <button
                  type="button"
                  onClick={handleAddReaction}
                  className="reaction-button hover:opacity-90"
                >
                  <Heart size={14} className="text-red-500 fill-red-500" />
                  <span>Helpful ({complaint.reactions ?? 0})</span>
                </button>
                <span className="flex items-center gap-1 text-gray-600 font-medium">
                  <MessageCircle size={14} />
                  <span>{complaint.comments?.length ?? 0} Audit Comments</span>
                </span>
              </div>
            </article>

            {/* CITIZEN CONFIRMATION GATE (Crucial Blueprint Requirement §4 & §5) */}
            {isAwaitingConfirmation && (
              <div className="confirmation-gate">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-base mb-2">
                  <FileCheck size={22} className="text-emerald-700" />
                  Official Redressal Submitted &mdash; Citizen Confirmation Required
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  The local official has marked this issue as repaired and attached evidence. Under Nivaran, <strong>officials cannot unilaterally close complaints</strong> &mdash; you must inspect and sign off.
                </p>

                {complaint.resolutionProof && (
                  <div className="p-4 bg-gray-50 border border-line rounded-xl mb-5 space-y-3">
                    <div className="text-xs">
                      <strong className="text-gray-900 block font-semibold">Official Resolution Note:</strong>
                      <p className="text-gray-700 m-0 mt-0.5">{complaint.resolutionProof.note}</p>
                    </div>

                    <div className="text-[11px] text-muted flex justify-between">
                      <span>Submitted by: <strong>{complaint.resolutionProof.resolvedBy}</strong></span>
                      <span>{complaint.resolutionProof.resolvedAt}</span>
                    </div>

                    {complaint.resolutionProof.photoUrl && (
                      <div className="rounded-lg overflow-hidden border border-line max-h-60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={complaint.resolutionProof.photoUrl}
                          alt="Official Resolution Proof"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="button primary flex-1"
                    onClick={handleConfirmCitizen}
                  >
                    <Check size={16} /> Confirm Fixed &amp; Close Ticket
                  </button>
                  <button
                    type="button"
                    className="button danger flex-1"
                    onClick={() => setReopenModalOpen(true)}
                  >
                    <RotateCcw size={16} /> Not Fixed &mdash; Reopen &amp; Escalate
                  </button>
                </div>
              </div>
            )}

            {/* RESOLUTION CERTIFICATE / SUMMARY (When closed) */}
            {isClosed && (
              <div className="card bg-emerald-50/80 border-emerald-200 p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-200 text-emerald-900 grid place-items-center flex-none">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="serif text-xl font-bold text-emerald-950 mb-1">
                    Redressal Verified &amp; Closed
                  </h3>
                  <p className="text-xs text-emerald-900 leading-relaxed m-0">
                    This grievance was verified on-ground and officially closed with citizen consent. Full tamper-evident audit history preserved below.
                  </p>
                </div>
              </div>
            )}

            {/* VERTICAL LIFECYCLE TIMELINE (Blueprint §3 & §4) */}
            <div className="card p-6 md:p-8">
              <h2 className="serif text-xl font-bold mb-1">Redressal Lifecycle &amp; Audit Trail</h2>
              <p className="text-xs text-muted mb-6">
                Every event, SLA handover, and citizen gate is recorded on the immutable timeline.
              </p>

              <div className="timeline-vertical">
                {/* Step 1: Intake */}
                <div className="timeline-step completed">
                  <div className="step-node">&check;</div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 m-0">1. Citizen Grievance Filed</h3>
                    <p className="text-xs text-gray-600 mt-0.5 m-0">
                      Filed by {complaint.citizenName || "Resident"} &bull; Auto-triaged via AI to {complaint.category}
                    </p>
                    <time className="text-[11px] text-gray-400 font-mono mt-1 block">
                      {complaint.created}
                    </time>
                  </div>
                </div>

                {/* Step 2: Level 1 Routing */}
                <div className={`timeline-step ${complaint.currentLevel >= 1 ? "completed" : "active"}`}>
                  <div className="step-node">
                    {complaint.currentLevel > 1 || complaint.status === "In progress" || isClosed ? (
                      "&check;"
                    ) : (
                      "2"
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 m-0">2. Level 1 Intake &amp; Field Dispatch</h3>
                    <p className="text-xs text-gray-600 mt-0.5 m-0">
                      Assigned to Ward Junior Engineer &bull; SLA Timer Initialized
                    </p>
                    <time className="text-[11px] text-gray-400 font-mono mt-1 block">
                      Owner: {complaint.owner}
                    </time>
                  </div>
                </div>

                {/* Step 3: Escalation Tier (if applicable) */}
                {isEscalated && (
                  <div className="timeline-step escalated">
                    <div className="step-node">!</div>
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                      <h3 className="text-sm font-bold text-amber-950 m-0">
                        3. Auto-Escalated to {complaint.levelTitle}
                      </h3>
                      <p className="text-xs text-amber-900 mt-1 m-0">
                        {complaint.escalationLog?.[0]?.reason || "SLA Deadline Breached &mdash; Transferred to supervisor."}
                      </p>
                      <time className="text-[11px] text-amber-700 font-mono mt-1 block">
                        Escalated at: {complaint.escalationLog?.[0]?.escalatedAt || "Automated trigger"}
                      </time>
                    </div>
                  </div>
                )}

                {/* Step 4: Resolution Proof */}
                <div
                  className={`timeline-step ${
                    isAwaitingConfirmation || isClosed ? "completed" : "pending"
                  }`}
                >
                  <div className="step-node">
                    {isClosed ? "&check;" : isAwaitingConfirmation ? "4" : "4"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 m-0">
                      4. Official Redressal Completed
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5 m-0">
                      {complaint.resolutionProof
                        ? complaint.resolutionProof.note
                        : "Field inspection and remedial engineering works in progress."}
                    </p>
                  </div>
                </div>

                {/* Step 5: Citizen Confirmation */}
                <div className={`timeline-step ${isClosed ? "completed" : "pending"}`}>
                  <div className="step-node">{isClosed ? "&check;" : "5"}</div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 m-0">
                      5. Citizen Verification &amp; Final Close
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5 m-0">
                      {isClosed
                        ? "Citizen verified on-ground fix & signed off."
                        : "Requires citizen sign-off before ticket can close."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DISCUSSION & AUDIT LOG */}
            <section className="card p-6 md:p-8">
              <h2 className="serif text-xl font-bold mb-1">Public Audit Discussion</h2>
              <p className="text-xs text-muted mb-4">
                Transparent log for citizens and officials to record remarks.
              </p>

              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Inspector Ramesh or Resident Anitha)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-line rounded-lg"
                />
                <textarea
                  placeholder="Add a remark or update to the public audit log..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 border border-line rounded-lg"
                />
                <button
                  type="button"
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                  className="button primary text-xs py-2 px-4"
                >
                  <Send size={13} /> Post to Audit Trail
                </button>
              </div>

              <div className="space-y-3">
                {complaint.comments && complaint.comments.length > 0 ? (
                  complaint.comments.map((cmt) => (
                    <div key={cmt.id} className="p-3 bg-gray-50 rounded-xl border border-line text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-gray-900 font-semibold">{cmt.author}</strong>
                        <time className="text-[10px] text-gray-400 font-mono">{cmt.created}</time>
                      </div>
                      <p className="text-gray-700 m-0">{cmt.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No community comments posted yet.</p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR: SLA WATCHDOG & OFFICIAL METRICS */}
          <aside className="lg:col-span-4 space-y-6">
            {/* LIVE SLA WATCHDOG CARD (Hero Component) */}
            <div
              className={`sla-ring-container flex-col items-start ${
                isEscalated ? "warning" : secondsRemaining !== null && secondsRemaining < 20 ? "breached" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="eyebrow m-0 text-amber-900">
                  <Clock size={14} /> Autonomous SLA Watchdog
                </span>
                <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded border border-line">
                  {complaint.isDemoSpeed ? "90s Demo Mode" : "48h Mode"}
                </span>
              </div>

              {!isClosed ? (
                <div className="w-full my-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-600">Auto-Escalation Window:</span>
                    <span className="sla-timer-display text-amber-900 font-mono">
                      {secondsRemaining !== null ? formatSla(secondsRemaining) : "--:--"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        secondsRemaining !== null && secondsRemaining < 30
                          ? "bg-red-500"
                          : secondsRemaining !== null && secondsRemaining < 50
                          ? "bg-amber-500"
                          : "bg-emerald-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            ((secondsRemaining ?? 0) / (complaint.slaSecondsTotal || 90)) * 100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>

                  <p className="text-[11px] text-gray-600 mt-2 m-0 leading-tight">
                    {secondsRemaining !== null && secondsRemaining > 0
                      ? `If Level ${complaint.currentLevel} doesn't resolve by zero, ticket automatically forwards to Level ${Math.min(
                          complaint.currentLevel + 1,
                          3
                        )}.`
                      : "SLA threshold crossed. Escalation engine triggered."}
                  </p>
                </div>
              ) : (
                <div className="py-2 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> SLA Watchdog successfully fulfilled.
                </div>
              )}

              {/* FAST FORWARD SIMULATION BUTTON FOR JUDGES */}
              {!isClosed && complaint.currentLevel < 3 && (
                <button
                  type="button"
                  onClick={handleFastForwardEscalation}
                  disabled={isFastForwarding}
                  className="button amber w-full text-xs py-2 mt-1"
                >
                  <Zap size={14} />
                  <span>{isFastForwarding ? "Escalating..." : "⚡ Simulate SLA Breach (Auto-Escalate)"}</span>
                </button>
              )}
            </div>

              {/* OFFICER RESPONSIBILITY CARD */}
              <div className="card p-6 space-y-4">
                <h3 className="serif text-base font-bold m-0">Jurisdiction &amp; Responsibility</h3>

                <div className="metric">
                  <span>Active Hierarchy</span>
                  <strong className="text-emerald-900 font-bold">{complaint.levelTitle}</strong>
                </div>

                <div className="metric">
                  <span>Assigned Officer</span>
                  <strong>{complaint.owner}</strong>
                </div>

                <div className="metric">
                  <span>District</span>
                  <strong className="text-right text-emerald-900">{complaint.district || (complaint.location.includes("District") ? complaint.location.split(",").slice(-2).join(",").trim() : complaint.location)}</strong>
                </div>

                {complaint.address && (
                  <div className="metric">
                    <span>Specific Address</span>
                    <strong className="text-right text-xs max-w-[200px] leading-tight">{complaint.address}</strong>
                  </div>
                )}

                <div className="metric">
                  <span>Category</span>
                  <strong>{complaint.category}</strong>
                </div>

                <div className="metric">
                  <span>Priority Flag</span>
                  <strong className={complaint.priority === "Critical" ? "text-red-600" : "text-emerald-800"}>
                    {complaint.priority}
                  </strong>
                </div>
              </div>
          </aside>
        </div>
      </main>

      {/* CITIZEN REOPEN MODAL */}
      {reopenModalOpen && (
        <div className="modal-overlay" onClick={() => setReopenModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setReopenModalOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="eyebrow text-red-700">Citizen Verification Gate</div>
            <h2 className="serif text-xl font-bold mb-2">Why is this issue not resolved?</h2>
            <p className="text-xs text-gray-600 mb-4">
              Explain why the official&apos;s repair work is unsatisfactory. Submitting this will <strong>immediately reopen the ticket and escalate it to the Municipal Commissioner / District Collector</strong>.
            </p>

            <div className="field">
              <label>Rejection Reason / Ground Reality</label>
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g. The leak was only temporarily covered with tape and is leaking again today..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="button secondary text-xs" onClick={() => setReopenModalOpen(false)}>
                Cancel
              </button>
              <button
                className="button danger text-xs"
                disabled={!reopenReason.trim()}
                onClick={handleReopenCitizen}
              >
                Reopen &amp; Escalate to Supervisor &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
