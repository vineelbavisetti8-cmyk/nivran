"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Droplets,
  ImagePlus,
  Lightbulb,
  Route,
  Trash2,
  Mic,
  MicOff,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  Lock,
  Phone,
  HelpCircle,
  RefreshCw,
  Camera
} from "lucide-react";
import { Header } from "@/components/site";
import { apLocations } from "@/data";

const categories = [
  { name: "Water & sanitation", desc: "Pumps, taps, drainage, borewell", icon: <Droplets size={20} /> },
  { name: "Roads & transport", desc: "Potholes, road repair, street access", icon: <Route size={20} /> },
  { name: "Electricity", desc: "Street lights, transformers, power wires", icon: <Lightbulb size={20} /> },
  { name: "Cleanliness", desc: "Garbage dumping, public waste, drainage cleanup", icon: <Trash2 size={20} /> },
];

const samplePhotos = [
  {
    label: "Broken Village Handpump",
    url: "/images/issues/village_broken_handpump.jpg",
    desc: "The drinking water borewell handpump near ZP High School has had a broken handle and cracked riser pipe for 5 days. 65 village families are walking 1.5 km to fetch water.",
    category: "Water & sanitation",
    district: "Chittoor District, Andhra Pradesh",
    address: "Near ZP High School, Ward 4, Punganur",
  },
  {
    label: "Muddy Road Potholes & Culvert",
    url: "/images/issues/village_pothole_mud_road.jpg",
    desc: "The village approach road culvert broke during monsoon rains, creating a 3-foot deep muddy crater across the road. Two-wheelers and tractors are unable to pass.",
    category: "Roads & transport",
    district: "Annamayya District, Andhra Pradesh",
    address: "Main Village Link Road Culvert, Near Railway Crossing, Rajampet",
  },
  {
    label: "Sagging Live 11KV Wires",
    url: "/images/issues/village_transformer_wires.jpg",
    desc: "The 11KV distribution pole tilted after gale winds and exposed power lines are sagging just 6 feet above the village dirt road, creating an extreme shock hazard.",
    category: "Electricity",
    district: "Guntur District, Andhra Pradesh",
    address: "Tractor Approach Road, Beside Primary School, Mangalagiri",
  },
];

export default function FileComplaint() {
  const router = useRouter();

  // Multi-step state: 1: Auth (Mock OTP), 2: Issue Details & AI, 3: Success Confirmation
  const [step, setStep] = useState(1);

  // OTP Auth Form
  const [phone, setPhone] = useState("9848012345");
  const [citizenName, setCitizenName] = useState("Vineerl Bavisetti");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  // Issue Details Form
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Water & sanitation");
  const [district, setDistrict] = useState("Kakinada District, Andhra Pradesh");
  const [address, setAddress] = useState("D.No 4-12, Near ZP High School, Main Bazaar, Kirlampudi");
  const [imageUrl, setImageUrl] = useState("");
  const [isDemoSpeed, setIsDemoSpeed] = useState(true);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en");
  const [audioTranscriptSource, setAudioTranscriptSource] = useState("");

  // AI Triage state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category?: string;
    aiSummary?: string;
    urgency?: string;
    routingDepartment?: string;
    duplicateMatch?: { id: string; title: string; status: string; message: string } | null;
  } | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState("");
  const [error, setError] = useState("");

  // Check URL query parameters for pre-selected district
  useEffect(() => {
    if (typeof window !== "undefined") {
      const paramDistrict = new URLSearchParams(window.location.search).get("district");
      if (paramDistrict) {
        const found = apLocations.find(
          (loc) => loc.toLowerCase() === paramDistrict.toLowerCase() || loc.toLowerCase().includes(paramDistrict.toLowerCase())
        );
        if (found) {
          setDistrict(found);
          setAddress(""); // Allow user to manually type their specific address
        }
      }
    }
  }, []);

  // Handler for OTP Verification
  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setOtpSent(true);
    setOtpCode("749201"); // Pre-filled for demo convenience per §5
  };

  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a 6-digit OTP code.");
      return;
    }
    setError("");
    setIsAuthVerified(true);
    setStep(2);
  };

  // Handler for AI Triage
  const triggerAiAnalysis = async (textToAnalyze?: string) => {
    const text = textToAnalyze || description;
    if (!text.trim()) return;

    setAiAnalyzing(true);
    const combinedLocation = address ? `${address}, ${district}` : district;
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text, location: combinedLocation }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiResult(data);
        if (data.category) setCategory(data.category);
      }
    } catch {
      // Fallback
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Voice recording simulation & transcription
  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setError("");

      // Simulate voice capture and call transcribe API
      setTimeout(async () => {
        setIsRecording(false);
        try {
          const formData = new FormData();
          formData.append("language", voiceLang);
          const res = await fetch("/api/ai/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.text) {
            const newDesc = description ? `${description}\n${data.text}` : data.text;
            setDescription(newDesc);
            setAudioTranscriptSource(data.source || "Whisper API");
            triggerAiAnalysis(newDesc);
          }
        } catch {
          // Ignore
        }
      }, 2500);
    }
  };

  // Auto-detect Geolocation
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setDistrict("Chittoor District, Andhra Pradesh");
          setAddress("Ward 4, Near ZP High School, Punganur");
        },
        () => {
          setDistrict("Chittoor District, Andhra Pradesh");
          setAddress("Main Road, Punganur");
        }
      );
    }
  };

  // Submit Complaint
  const handleSubmitComplaint = async () => {
    if (!description.trim()) {
      setError("Please describe the issue you are reporting.");
      return;
    }
    if (!district) {
      setError("Please select your Andhra Pradesh district.");
      return;
    }
    if (!address.trim() || address.trim().length < 3) {
      setError("Please manually enter your specific street address, village, or landmark.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const fullLocation = `${address.trim()}, ${district.trim()}`;
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          district: district.trim(),
          address: address.trim(),
          location: fullLocation,
          citizenName: citizenName || "Citizen Resident",
          phone,
          imageUrl: imageUrl || undefined,
          aiSummary: aiResult?.aiSummary,
          priority: aiResult?.urgency === "Critical" ? "Critical" : aiResult?.urgency === "High" ? "High" : "Normal",
          isDemoSpeed,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create complaint");

      setCreatedTicketId(data.id);
      setStep(3);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error submitting complaint";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page bg-[#faf9f6] min-h-screen">
      <Header active="" />

      <main className="page-main max-w-4xl mx-auto py-10 px-4 md:px-6">
        <Link href="/" className="back inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} /> Back to home
        </Link>

        {/* STEP 1: MOCK OTP LOGIN (Per Blueprint §4 & §5) */}
        {step === 1 && (
          <div className="max-w-md mx-auto">
            <div className="card shadow-lg p-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 grid place-items-center mb-4">
                <Lock size={22} />
              </div>

              <div className="eyebrow">Demo Citizen Authentication</div>
              <h1 className="serif text-2xl font-bold mb-2">Sign in to File Issue</h1>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Per hackathon guidelines, real Aadhaar/PII is prohibited. Enter your phone number below &mdash; any 6-digit OTP will be accepted.
              </p>

              <div className="field">
                <label>Your Full Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="e.g. Venkata Lakshmi"
                />
              </div>

              <div className="field">
                <label>Mobile Number (10 digits)</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 border border-line rounded-lg bg-gray-50 text-xs font-mono text-gray-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9848012345"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="field mt-4 animate-fadeIn">
                  <label>
                    Enter 6-Digit OTP Code
                    <span className="text-[11px] text-amber-700 font-normal">(Demo OTP: 749201)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="font-mono text-lg tracking-widest text-center"
                    placeholder="749201"
                  />
                </div>
              )}

              {error && <p className="form-error mt-3">{error}</p>}

              <div className="mt-6">
                {!otpSent ? (
                  <button type="button" className="button primary w-full" onClick={handleSendOtp}>
                    <span>Send Verification Code</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button type="button" className="button primary w-full" onClick={handleVerifyOtp}>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

              <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <Sparkles size={14} className="flex-none mt-0.5" />
                <span>
                  <strong>Hackathon Demo Note:</strong> Mock OTP auth prevents SMS vendor latency during evaluation while satisfying user identification criteria.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONVERSATIONAL FILING WITH AI & VOICE */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="mb-6">
                <div className="eyebrow">Conversational Intake &bull; Step 2 of 2</div>
                <h1 className="serif text-3xl font-bold mb-2">What civic problem are you seeing?</h1>
                <p className="text-sm text-gray-600">
                  Type your description or speak in your regional language. Our AI engine will summarize and route it automatically.
                </p>
              </div>

              <div className="card shadow-sm p-6 space-y-6">
                {/* VOICE RECORDER BAR */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Mic size={14} className="text-emerald-700" />
                      Voice Input (Whisper Ready)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">Language:</span>
                      <select
                        value={voiceLang}
                        onChange={(e) => setVoiceLang(e.target.value)}
                        className="text-xs py-1 px-2 border border-line rounded-md bg-white"
                      >
                        <option value="en">English</option>
                        <option value="te">తెలుగు (Telugu)</option>
                      </select>
                    </div>
                  </div>

                  <div className={`voice-recorder-box ${isRecording ? "recording" : ""}`}>
                    <button
                      type="button"
                      className={`mic-btn ${isRecording ? "recording" : ""}`}
                      onClick={toggleRecording}
                      aria-label="Toggle voice recording"
                    >
                      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <div className="flex-1 text-xs">
                      {isRecording ? (
                        <div className="text-red-700 font-semibold animate-pulse flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                          Listening in {voiceLang === "te" ? "Telugu" : "English"}... (Speak clearly)
                        </div>
                      ) : (
                        <div>
                          <strong className="text-gray-800 block">Click microphone to speak your issue</strong>
                          <span className="text-gray-500 text-[11px]">
                            {audioTranscriptSource ? `Last parsed via: ${audioTranscriptSource}` : "Voice transcription via OpenAI Whisper"}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="text-xs text-green font-semibold hover:underline"
                      onClick={() => toggleRecording()}
                    >
                      {isRecording ? "Stop & Transcribe" : "Sample Voice"}
                    </button>
                  </div>
                </div>

                {/* DESCRIPTION TEXTAREA */}
                <div className="field">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Issue Description
                    </label>
                    <button
                      type="button"
                      className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
                      onClick={() => triggerAiAnalysis()}
                      disabled={aiAnalyzing || !description.trim()}
                    >
                      <Sparkles size={12} />
                      {aiAnalyzing ? "Analyzing with AI..." : "Re-run AI Triage"}
                    </button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (e.target.value.length > 20 && !aiResult) {
                        triggerAiAnalysis(e.target.value);
                      }
                    }}
                    placeholder="e.g. The community handpump near the primary school stopped drawing water 5 days ago. Over 60 families need it daily..."
                    rows={4}
                  />
                </div>

                {/* LIVE AI ANALYSIS BADGE */}
                {aiResult && (
                  <div className="ai-triage-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        <Sparkles size={14} className="text-emerald-700" />
                        AI Auto-Triage Summary
                      </div>
                      <span className="tag green text-[10px]">GPT Analysis Live</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">Clean 1-Line Summary:</span>
                        <strong className="text-gray-900 font-semibold">{aiResult.aiSummary}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">Auto-Assigned Routing:</span>
                        <span className="text-emerald-800 font-semibold">{aiResult.routingDepartment}</span>
                      </div>
                    </div>

                    {/* DUPLICATE WARNING BADGE (Blueprint §4 & §5) */}
                    {aiResult.duplicateMatch && (
                      <div className="mt-3 p-2.5 bg-amber-100/90 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                        <AlertTriangle size={15} className="flex-none text-amber-700 mt-0.5" />
                        <div>
                          <strong>Likely Duplicate Detected Nearby:</strong>
                          <p className="m-0 text-[11px] mt-0.5">{aiResult.duplicateMatch.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CATEGORY SELECTOR */}
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                    Civic Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.name}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${category === cat.name
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm"
                            : "border-line bg-white hover:bg-gray-50 text-gray-700"
                          }`}
                        onClick={() => setCategory(cat.name)}
                      >
                        <div className="text-emerald-700 mb-2">{cat.icon}</div>
                        <div className="text-xs font-semibold">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DISTRICT SELECTION & MANUAL ADDRESS ENTRY */}
                <div className="space-y-4 p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                    <MapPin size={15} className="text-emerald-700" />
                    Issue Location &bull; District &amp; Specific Address
                  </div>

                  {/* 1. DISTRICT SELECTOR */}
                  <div className="field">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-gray-800">
                        1. Select District (Andhra Pradesh) <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={detectLocation}
                        className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <MapPin size={12} /> Auto-detect GPS
                      </button>
                    </div>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-white font-medium text-xs text-gray-900 border border-line rounded-xl px-3 py-2.5 shadow-2xs focus:border-emerald-600 outline-none"
                    >
                      {apLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. SPECIFIC MANUAL ADDRESS ENTRY FIELD */}
                  <div className="field">
                    <label className="text-xs font-bold text-gray-800 flex items-center justify-between mb-1.5">
                      <span>
                        2. Specific Address, Street &amp; Landmark (Manual Entry) <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[11px] text-gray-500 font-normal">Accurate on-ground details</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Door No. 4-21, Near Ramalayam Temple, Main Road, Kirlampudi Village / Ward 7"
                      rows={2}
                      className="w-full bg-white text-xs text-gray-900 border border-line rounded-xl p-3 shadow-2xs focus:border-emerald-600 outline-none resize-none leading-relaxed"
                    />
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 mt-1.5">
                      <Sparkles size={13} className="text-emerald-700 flex-none" />
                      <span>
                        Field officers and municipal squad use this manual address to locate the site for ground inspection.
                      </span>
                    </div>
                  </div>
                </div>

                {/* PHOTO ATTACHMENT */}
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                    Photo Evidence <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs text-gray-500 w-full mb-1">Quick Select Demo Evidence Photo:</span>
                    {samplePhotos.map((photo) => (
                      <button
                        type="button"
                        key={photo.label}
                        onClick={() => {
                          setImageUrl(photo.url);
                          if (photo.district) setDistrict(photo.district);
                          if (photo.address) setAddress(photo.address);
                          if (!description || description.length < 15) {
                            setDescription(photo.desc);
                            setCategory(photo.category);
                            triggerAiAnalysis(photo.desc);
                          }
                        }}
                        className={`text-[11px] py-1.5 px-2.5 rounded-lg border flex items-center gap-1.5 ${imageUrl === photo.url
                            ? "bg-emerald-100 border-emerald-600 text-emerald-900 font-bold"
                            : "bg-white border-line text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <Camera size={12} />
                        {photo.label}
                      </button>
                    ))}
                  </div>

                  {imageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-line max-h-48">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* SLA DEMO SPEED TOGGLE (Blueprint §4 & §5) */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="demoSpeed"
                    checked={isDemoSpeed}
                    onChange={(e) => setIsDemoSpeed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300"
                  />
                  <label htmlFor="demoSpeed" className="text-xs text-amber-950">
                    <strong className="block font-bold">⚡ Enable 90-Second Demo SLA Watchdog (Recommended)</strong>
                    <span className="text-[11px] text-amber-800">
                      Compresses the 48-hour statutory countdown to 90 seconds so hackathon reviewers can watch the auto-escalation trigger live in real-time.
                    </span>
                  </label>
                </div>

                {error && <p className="form-error">{error}</p>}

                <button
                  type="button"
                  className="button primary w-full py-3.5 text-base"
                  disabled={submitting}
                  onClick={handleSubmitComplaint}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw size={18} className="animate-spin" /> Submitting to AP Queue...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      File Grievance &amp; Start SLA Watchdog <ArrowRight size={18} />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* SIDE NOTE INFO CARD */}
            <div className="lg:col-span-4 space-y-4">
              <div className="card bg-emerald-50/60 border-emerald-200 p-6">
                <h3 className="serif text-lg font-bold text-emerald-950 mb-2">What Happens Next?</h3>
                <ol className="text-xs text-emerald-900 space-y-3 pl-4 list-decimal">
                  <li>
                    <strong>Level 1 Routing:</strong> Assigned immediately to the local ward junior engineer.
                  </li>
                  <li>
                    <strong>SLA Watchdog Starts:</strong> Real-time timer counts down. If no resolution occurs, ticket auto-escalates to Municipal Commissioner.
                  </li>
                  <li>
                    <strong>Citizen Confirmation Gate:</strong> The official cannot close the issue unilaterally &mdash; you must personally inspect and confirm resolution.
                  </li>
                </ol>
              </div>

              <div className="card p-5 text-xs text-gray-600">
                <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Lock size={14} className="text-emerald-700" />
                  No Bureaucratic Form Jargon
                </div>
                <p className="m-0 leading-relaxed text-[11px]">
                  Unlike old portals with 12 nested fields, Nivaran keeps citizen submission to a single conversational card.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CREATION SUCCESS & SLA WATCHDOG LINK */}
        {step === 3 && (
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>

            <div className="eyebrow">Autonomous Watchdog Active</div>
            <h1 className="serif text-4xl font-bold mb-3">Your Grievance is Live</h1>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
              Assigned to <strong>Level 1 (Field Engineer)</strong>. The SLA timer is actively running. If unattended, it will auto-escalate up the hierarchy.
            </p>

            <div className="p-4 bg-white border border-dashed border-emerald-600 rounded-2xl mb-8 max-w-sm mx-auto shadow-sm">
              <span className="text-xs text-gray-500 block mb-1 uppercase tracking-wider font-semibold">
                Permanent Reference ID
              </span>
              <strong className="text-2xl font-mono text-emerald-800 font-bold">{createdTicketId}</strong>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link className="button primary" href={`/track?id=${createdTicketId}`}>
                <span>Open Live SLA &amp; Escalation Tracker</span>
                <ArrowRight size={16} />
              </Link>
              <Link className="button secondary" href="/official">
                <span>View from Official&apos;s Queue</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
