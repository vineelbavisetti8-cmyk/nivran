import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Clock, Zap, Cpu, Sparkles, AlertTriangle } from "lucide-react";
import { Header, Footer } from "@/components/site";

export default function About() {
  return (
    <div className="page bg-[#faf9f6] min-h-screen">
      <Header active="about" />

      <main className="page-main max-w-4xl mx-auto py-10 px-4 md:px-6">
        <Link href="/" className="back inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} /> Back to home
        </Link>

        {/* HERO */}
        <div className="mb-10">
          <div className="eyebrow">Technical &amp; Product Blueprint &bull; Build What Moves India</div>
          <h1 className="serif text-4xl md:text-5xl font-bold mb-4">
            Nivaran
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl font-medium">
            &ldquo;Every complaint gets an answer &mdash; automatically. Say it once. It gets fixed, or it gets escalated.&rdquo;
          </p>
        </div>

        {/* THE PROBLEM WE SOLVE */}
        <section className="card p-6 md:p-8 mb-8 space-y-4">
          <h2 className="serif text-2xl font-bold text-ink">1. The Problem Rebuilt Deeply</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            When someone reports a civic issue in India today (broken infrastructure, delayed service, unresolved application), there is no reliable way to know if anyone is even looking at it. Existing grievance portals (CPGRAMS and most state portals) accept a complaint, give you a ticket number, and then go silent. There is no visible timeline, no accountability if an officer sits on it, and no signal to the citizen about what happens next.
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
            <strong>The Nivaran Journey:</strong> File a complaint &rarr; know exactly who owns it and by when they must respond &rarr; watch it automatically move up the chain if ignored &rarr; get a resolution you personally confirm, not one an officer self-declares.
          </div>
        </section>

        {/* 3 CORE ARCHITECTURAL PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 grid place-items-center mb-3">
              <Sparkles size={20} />
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">AI &amp; Voice Intake</h3>
            <p className="text-xs text-gray-600 m-0 leading-relaxed">
              Whisper speech recognition in regional languages. OpenAI models auto-categorize, generate official 1-line summaries, and detect duplicate tickets nearby.
            </p>
          </div>

          <div className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 grid place-items-center mb-3">
              <Clock size={20} />
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">SLA Auto-Escalation</h3>
            <p className="text-xs text-gray-600 m-0 leading-relaxed">
              Immutable SLA deadlines. Unresolved tickets automatically promote from Level 1 (Field Engineer) &rarr; Level 2 (Commissioner) &rarr; Level 3 (District Collector).
            </p>
          </div>

          <div className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 grid place-items-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-ink mb-1">Citizen Confirmation Gate</h3>
            <p className="text-xs text-gray-600 m-0 leading-relaxed">
              Officials cannot self-declare resolution. Citizens verify on-ground fix before closure, or reject it to trigger immediate supervisor escalation.
            </p>
          </div>
        </div>

        {/* HOW THIS WOULD WORK AT REAL SCALE (§9) */}
        <section className="card p-6 md:p-8 mb-8 space-y-3">
          <h2 className="serif text-xl font-bold text-ink">How This Would Work at Real Scale (§9)</h2>
          <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4">
            <li><strong>Escalation Engine:</strong> Transitions to a distributed BullMQ/Redis worker cluster with state-level statutory response clocks.</li>
            <li><strong>Official Routing:</strong> Direct bidirectional integration with state and district officer directories across all wards.</li>
            <li><strong>Duplicate Detection:</strong> Vector embeddings with PostGIS geospatial indexing to auto-cluster infrastructure failures.</li>
            <li><strong>Independent Positioning:</strong> Built as an open citizen tool interfacing transparently with civic systems without official branding claims.</li>
          </ul>
        </section>

        <div className="text-center py-4">
          <Link className="button primary px-6 py-3" href="/file-complaint">
            Try the Live Citizen Journey &rarr;
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
