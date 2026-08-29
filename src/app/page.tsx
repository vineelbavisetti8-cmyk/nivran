"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  Mic,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Cpu,
  Layers
} from "lucide-react";
import { Header, Footer } from "@/components/site";
import type { Complaint } from "@/data";

export default function Home() {
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [liveEscalationTicker, setLiveEscalationTicker] = useState<number>(0);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComplaintsList(data);
      })
      .catch(() => {});

    // Periodic heartbeat check for escalation engine
    const interval = setInterval(() => {
      fetch("/api/escalate")
        .then((r) => r.json())
        .then((res) => {
          if (res.escalatedCount > 0) {
            setLiveEscalationTicker((prev) => prev + res.escalatedCount);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const inProgressCount = complaintsList.filter((c) => c.status === "In progress" || c.status === "Submitted" || c.status === "Acknowledged").length;
  const escalatedCount = complaintsList.filter((c) => c.status === "Escalated" || (c.escalationLog && c.escalationLog.length > 0)).length;
  const resolvedCount = complaintsList.filter((c) => c.status === "Resolved" || c.confirmed).length;

  return (
    <div className="shell">
      <Header active="home" />

      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-content">
            <div>
              <div className="eyebrow">
                <Sparkles size={13} />
                Autonomous Civic Redressal Engine
              </div>
              <h1 className="serif">
                Every complaint gets an answer &mdash; <br />
                <i className="font-normal text-green-800">automatically.</i>
              </h1>
              <p>
                Say it once. It gets fixed, or it automatically escalates up the government hierarchy. Powered by direct citizen intake, scheduled SLA watchdog engines, and a mandatory citizen confirmation gate.
              </p>

              <div className="hero-actions">
                <Link className="button primary" href="/file-complaint">
                  <span>Report an Issue</span>
                  <ArrowRight size={16} />
                </Link>
                <Link className="button secondary" href="/track?id=NVR-26-01842">
                  <Clock size={16} className="text-amber-600" />
                  <span>Watch 90s Auto-Escalation Demo</span>
                </Link>
              </div>

              {/* LIVE METRICS CHIPS */}
              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <div className="bg-white/80 border border-line rounded-lg px-3.5 py-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-muted">Live SLA Engine:</span>
                  <strong className="text-ink">Active (90s Demo Mode)</strong>
                </div>
                <div className="bg-white/80 border border-line rounded-lg px-3.5 py-2 flex items-center gap-2">
                  <span className="text-muted">Resolution Gate:</span>
                  <strong className="text-emerald-700">Citizen Sign-off Required</strong>
                </div>
              </div>
            </div>

            {/* HOW NIVARAN WORKS CONTEXT CARD */}
            <div className="hero-live-card bg-white border border-line rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-line mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-green flex items-center gap-1.5">
                  <Sparkles size={14} /> How Nivaran Works
                </span>
                <span className="text-[11px] font-semibold text-muted bg-gray-100 px-2 py-0.5 rounded-md">
                  End-to-End Journey
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/80 border border-line">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] grid place-items-center flex-none mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-gray-900 block text-xs font-bold">
                      Direct Citizen Filing
                    </strong>
                    <p className="text-gray-600 text-[11px] m-0 mt-0.5 leading-snug">
                      Describe your problem clearly, attach photo evidence, and select your district in seconds without paperwork.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/80 border border-line">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px] grid place-items-center flex-none mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-gray-900 block text-xs font-bold">
                      Visible SLA Response Clock
                    </strong>
                    <p className="text-gray-600 text-[11px] m-0 mt-0.5 leading-snug">
                      Assigned to the local Ward Officer with an immutable, live countdown timer. You always know who owns it and by when they must act.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                  <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 font-bold text-[11px] grid place-items-center flex-none mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-amber-950 block text-xs font-bold">
                      Autonomous SLA Escalation
                    </strong>
                    <p className="text-amber-900 text-[11px] m-0 mt-0.5 leading-snug">
                      If an officer ignores the grievance, Nivaran automatically forwards it to the Municipal Commissioner &amp; District Collector.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-950 font-bold text-[11px] grid place-items-center flex-none mt-0.5">
                    4
                  </div>
                  <div>
                    <strong className="text-emerald-950 block text-xs font-bold">
                      Mandatory Citizen Verification
                    </strong>
                    <p className="text-emerald-900 text-[11px] m-0 mt-0.5 leading-snug">
                      Officials upload repair evidence. The ticket cannot close until you inspect on-ground and click &ldquo;Confirm Fixed&rdquo;.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex justify-between items-center text-xs">
                <span className="text-muted">Zero silent tickets</span>
                <Link className="text-green font-bold hover:underline flex items-center gap-1" href="/file-complaint">
                  Try Raising an Issue <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CPGRAMS VS NIVARAN: THE CORE PROBLEM WE SOLVE */}
        <section className="section" style={{ paddingTop: "50px", paddingBottom: "50px" }}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="eyebrow">The One Problem Rebuilt Deeply</div>
            <h2 className="serif text-3xl font-bold mb-3">
              Why Existing Grievance Portals Fail (and How Nivaran Fixes It)
            </h2>
            <p className="text-sm text-gray-600">
              When a citizen reports a civic issue in India today, it enters a black box. Nivaran makes accountability visible, scheduled, and automatic.
            </p>
          </div>

          <div className="comparison-grid">
            {/* The Old Way */}
            <div className="compare-box old">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm uppercase tracking-wider mb-3">
                <AlertTriangle size={17} />
                Today&apos;s Portals (CPGRAMS / State)
              </div>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">&times;</span>
                  <span><strong>Silent Tickets:</strong> You receive a tracking ID and then complete radio silence for weeks.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">&times;</span>
                  <span><strong>Zero Escalation:</strong> If an officer sits on your complaint, it sits in their queue indefinitely.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">&times;</span>
                  <span><strong>Official Self-Closing:</strong> Officials can mark a ticket &ldquo;Resolved&rdquo; without proof or citizen consent.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">&times;</span>
                  <span><strong>12-Field Bureaucratic Forms:</strong> Complex forms demanding dropdowns and formal department knowledge.</span>
                </li>
              </ul>
            </div>

            {/* The Nivaran Way */}
            <div className="compare-box new">
              <div className="flex items-center gap-2 text-green font-bold text-sm uppercase tracking-wider mb-3">
                <CheckCircle2 size={17} />
                The Nivaran Architecture
              </div>
              <ul className="space-y-3 text-xs text-emerald-900">
                <li className="flex gap-2">
                  <span className="text-emerald-700 font-bold">&check;</span>
                  <span><strong>Direct Guided Intake:</strong> Describe your issue clearly, choose your district, and attach photo evidence without complex forms.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-700 font-bold">&check;</span>
                  <span><strong>Visible Live SLA Watchdog:</strong> Real-time countdown ring; automatically jumps to supervisor if timer expires.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-700 font-bold">&check;</span>
                  <span><strong>Citizen Confirmation Gate:</strong> Officials upload evidence; ticket only closes when the citizen clicks &ldquo;Confirm Fixed&rdquo;.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-700 font-bold">&check;</span>
                  <span><strong>Reopen &amp; Auto-Escalate:</strong> If work is subpar, citizen rejects it and it immediately alerts the District Collector.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3 CORE PILLARS */}
        <section className="section" style={{ background: "#ffffff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="section-head">
            <div>
              <div className="eyebrow">Product Capabilities</div>
              <h2 className="serif">Built Like a Modern Product, Not a Portal</h2>
              <p>Designed for mobile-first accessibility across Andhra Pradesh constituencies.</p>
            </div>
            <Link className="link" href="/file-complaint">
              Experience the flow &rarr;
            </Link>
          </div>

          <div className="cards">
            <div className="card">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold mb-2">1. Direct Citizen Intake</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Citizens can type their issues directly in clear language, upload on-ground photo evidence, and pick their district without any complex 12-field bureaucratic red tape.
              </p>
              <Link className="text-xs font-bold text-green flex items-center gap-1" href="/file-complaint">
                File a Grievance <ChevronRight size={13} />
              </Link>
            </div>

            <div className="card">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Clock size={20} />
              </div>
              <h3 className="text-base font-bold mb-2">2. Autonomous Escalation</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Every ticket has an immutable SLA timestamp. If a Level 1 officer fails to act, background workers promote the ticket to Level 2 (Commissioner) and Level 3 (District Collector) automatically.
              </p>
              <Link className="text-xs font-bold text-green flex items-center gap-1" href="/track?id=NVR-26-01842">
                Watch Live Countdown <ChevronRight size={13} />
              </Link>
            </div>

            <div className="card">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold mb-2">3. Citizen Verification Gate</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Officials submit &ldquo;after&rdquo; photos and notes. The citizen gets a notification to verify on the ground. Rejection triggers an immediate escalation with penalty flagging.
              </p>
              <Link className="text-xs font-bold text-green flex items-center gap-1" href="/track?id=NVR-26-01821">
                Inspect Confirmation Gate <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* LIVE DEMO SCENARIOS BANNER */}
        <section className="section">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-8 md:p-10 shadow-xl relative overflow-hidden">
            <div className="max-w-xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-4">
                <Sparkles size={12} /> Test All 4 Citizen Lifecycle Stages
              </div>
              <h2 className="serif text-3xl font-bold mb-3 text-white">
                Ready to review the full journey end-to-end?
              </h2>
              <p className="text-sm text-emerald-100 mb-6 leading-relaxed">
                Explore pre-seeded live scenarios or file a fresh grievance to watch the scheduled 90-second SLA escalation and citizen confirmation gate in action.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="button bg-white text-emerald-950 font-bold hover:bg-emerald-50" href="/file-complaint">
                  + File New Issue
                </Link>
                <Link className="button bg-emerald-800 text-white border border-emerald-700 hover:bg-emerald-700" href="/official">
                  Open Official Queue View
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
