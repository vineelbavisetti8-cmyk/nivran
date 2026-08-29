"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus
} from "lucide-react";

export function Header({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/" onClick={close}>
          <span className="brand-mark">n</span>
          <div>
            <span className="leading-tight block font-bold text-ink">Nivaran</span>
            <small className="block text-[10px] text-muted font-medium leading-none tracking-normal">
              Autonomous Redressal
            </small>
          </div>
        </Link>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-10 h-10 border border-line rounded-xl bg-white text-ink active:bg-gray-100 shadow-2xs"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* DESKTOP NAVIGATION ONLY */}
        <nav className="nav-desktop">
          <Link className={active === "home" ? "active" : ""} href="/" onClick={close}>
            Home
          </Link>
          <Link className={active === "track" ? "active" : ""} href="/track" onClick={close}>
            Track &amp; SLA
          </Link>
          <Link className={active === "official" ? "active" : ""} href="/official" onClick={close}>
            Official Queue
          </Link>
          <Link className={active === "locations" ? "active" : ""} href="/locations" onClick={close}>
            Districts
          </Link>

          <button
            type="button"
            className="demo-pill"
            onClick={() => {
              setShowDemoGuide(true);
              close();
            }}
          >
            <Sparkles size={13} className="text-amber-600" />
            <span>Judge Guide (§5)</span>
          </button>

          <Link className="button primary text-xs py-2 px-3.5" href="/file-complaint" onClick={close}>
            <Plus size={14} /> Report Issue
          </Link>
        </nav>
      </header>

      {/* MOBILE SLIDE-DOWN DRAWER & BACKDROP */}
      {open && (
        <>
          <div className="nav-mobile-overlay md:hidden" onClick={close} />
          <div className="nav-mobile-menu md:hidden">
            <Link
              className={`p-3.5 rounded-xl text-sm font-semibold flex items-center justify-between border ${
                active === "home"
                  ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                  : "text-gray-800 border-transparent hover:bg-gray-50"
              }`}
              href="/"
              onClick={close}
            >
              <span>Home</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <Link
              className={`p-3.5 rounded-xl text-sm font-semibold flex items-center justify-between border ${
                active === "track"
                  ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                  : "text-gray-800 border-transparent hover:bg-gray-50"
              }`}
              href="/track"
              onClick={close}
            >
              <span>Track &amp; Live SLA Watchdog</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <Link
              className={`p-3.5 rounded-xl text-sm font-semibold flex items-center justify-between border ${
                active === "official"
                  ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                  : "text-gray-800 border-transparent hover:bg-gray-50"
              }`}
              href="/official"
              onClick={close}
            >
              <span>Official Operations Queue</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <Link
              className={`p-3.5 rounded-xl text-sm font-semibold flex items-center justify-between border ${
                active === "locations"
                  ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                  : "text-gray-800 border-transparent hover:bg-gray-50"
              }`}
              href="/locations"
              onClick={close}
            >
              <span>AP Districts &amp; Mandals</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <div className="pt-2 border-t border-line mt-1 flex flex-col gap-2">
              <button
                type="button"
                className="w-full p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-2"
                onClick={() => {
                  setShowDemoGuide(true);
                  close();
                }}
              >
                <Sparkles size={14} className="text-amber-700" />
                <span>Reviewer Demo Guide (Real vs Mocked §5)</span>
              </button>

              <Link
                className="button primary w-full text-center py-3 text-sm font-bold"
                href="/file-complaint"
                onClick={close}
              >
                + File Grievance (Voice / AI)
              </Link>
            </div>
          </div>
        </>
      )}

      {/* JUDGE DEMO GUIDE & ARCHITECTURE MODAL */}
      {showDemoGuide && (
        <div className="modal-overlay" onClick={() => setShowDemoGuide(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 grid place-items-center"
              onClick={() => setShowDemoGuide(false)}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-700 mb-2">
              <Sparkles size={15} />
              OpenAI x Varun Mayya Submission Blueprint
            </div>

            <h2 className="serif text-2xl font-bold mb-2">How Nivaran Works (Real vs Mocked)</h2>
            <p className="text-xs text-gray-600 mb-4">
              Transparent mapping directly matching <strong>Section 5 of the Product Blueprint</strong> (&ldquo;Honesty is a judged criterion&rdquo;).
            </p>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="border border-green-200 bg-green-50/70 p-3 rounded-xl">
                <div className="font-bold text-green-900 flex items-center gap-1.5 mb-1 text-sm">
                  <CheckCircle2 size={16} className="text-green-700 flex-none" />
                  1. Live AI Categorization &amp; Transcription (Real)
                </div>
                <p className="text-green-800 m-0">
                  OpenAI GPT models analyze complaint descriptions, auto-assign departments, generate clean 1-line official summaries, and flag duplicates. Voice input supports Whisper transcription in regional languages.
                </p>
              </div>

              <div className="border border-amber-200 bg-amber-50/70 p-3 rounded-xl">
                <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1 text-sm">
                  <Clock size={16} className="text-amber-700 flex-none" />
                  2. SLA Countdown &amp; Auto-Escalation Engine (Real, Compressed Timers)
                </div>
                <p className="text-amber-800 m-0">
                  Real scheduled interval engine promotes ignored tickets from <strong>Level 1 (Field Engineer)</strong> &rarr; <strong>Level 2 (Municipal Commissioner)</strong> &rarr; <strong>Level 3 (District Collector)</strong>. Compressed to 90 seconds for live demo inspection!
                </p>
              </div>

              <div className="border border-indigo-200 bg-indigo-50/70 p-3 rounded-xl">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1 text-sm">
                  <ShieldCheck size={16} className="text-indigo-700 flex-none" />
                  3. Citizen Confirmation Gate (Anti Self-Closing)
                </div>
                <p className="text-indigo-800 m-0">
                  Officials cannot unilaterally close tickets. When an official submits proof, the citizen must explicitly <strong>&ldquo;Confirm Fixed&rdquo;</strong> or click <strong>&ldquo;Not Fixed &mdash; Reopen &amp; Escalate&rdquo;</strong>.
                </p>
              </div>

              <div className="border border-gray-200 bg-gray-50 p-3 rounded-xl">
                <div className="font-bold text-gray-900 mb-1">4. Mocked Components (Per Brief Guidelines):</div>
                <ul className="list-disc pl-4 space-y-1 text-gray-600 m-0">
                  <li><strong>OTP Login:</strong> Any 6-digit code accepted (avoids paid SMS gateway dependencies for review).</li>
                  <li><strong>Officials Directory:</strong> Seeded sample roster across AP mandals and wards.</li>
                  <li><strong>No Aadhaar/PII:</strong> Strictly strictly complies with hackathon data privacy rules.</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-500">Nivaran Hackathon Build</span>
              <button className="button primary text-xs py-2 px-4" onClick={() => setShowDemoGuide(false)}>
                Explore Features &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="font-bold text-gray-900 mb-1">Nivaran</div>
        <p className="text-xs text-gray-500 m-0">
          &ldquo;Every complaint gets an answer &mdash; automatically.&rdquo; Built for OpenAI &times; Varun Mayya hackathon.
        </p>
      </div>
      <div className="text-xs text-gray-500 md:text-right">
        <span>No official affiliation &bull; Independent Civic Redressal Engine</span>
        <div className="mt-1 font-mono text-[11px] text-green font-semibold">
          Active Escalation Engine: Ready
        </div>
      </div>
    </footer>
  );
}
