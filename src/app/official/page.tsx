"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Filter,
  MessageCircle,
  Plus,
  X,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Camera,
  RotateCcw,
  RefreshCw,
  Send,
  Sparkles,
  ArrowRight,
  Edit3,
  Sliders,
  Settings,
  AlertCircle
} from "lucide-react";
import { Header } from "@/components/site";
import { officialLevels, apLocations, type Complaint } from "@/data";

export default function Official() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState("All");
  const [selectedOfficialLevel, setSelectedOfficialLevel] = useState(1);
  const [feedback, setFeedback] = useState("");

  // Edit / Action Modal State
  const [activeModalItem, setActiveModalItem] = useState<Complaint | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "resolve" | "progress">("edit");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Edit Form Fields
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPriority, setEditPriority] = useState<"Normal" | "High" | "Critical">("Normal");
  const [editStatus, setEditStatus] = useState<Complaint["status"]>("In progress");
  const [editLevel, setEditLevel] = useState<1 | 2 | 3>(1);
  const [editOwner, setEditOwner] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [proofPhotoUrl, setProofPhotoUrl] = useState("");

  const currentOfficial = officialLevels.find((l) => l.level === selectedOfficialLevel) || officialLevels[0];

  const fetchQueue = () => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const openItemModal = (c: Complaint, tab: "edit" | "resolve" | "progress" = "edit") => {
    setActiveModalItem(c);
    setActiveTab(tab);
    setEditTitle(c.title);
    setEditDescription(c.description);
    setEditCategory(c.category);
    setEditDistrict(c.district || (c.location.includes("District") ? c.location.split(",").slice(-2).join(",").trim() : apLocations[0]));
    setEditAddress(c.address || c.location.split(",")[0] || "");
    setEditPriority(c.priority);
    setEditStatus(c.status);
    setEditLevel(c.currentLevel);
    setEditOwner(c.owner);
    setEditImageUrl(c.imageUrl || "");
    setActionNote("");
    setProofPhotoUrl(
      c.resolutionProof?.photoUrl ||
        "https://images.unsplash.com/photo-1584463699039-44d47e4eb120?auto=format&fit=crop&w=1000&q=80"
    );
  };

  const visible = items.filter((c) => {
    if (filter === "All") return true;
    if (filter === "My Level") return c.currentLevel === selectedOfficialLevel;
    if (filter === "Escalated") return c.status === "Escalated" || (c.escalationLog && c.escalationLog.length > 0);
    if (filter === "Awaiting Confirmation") return c.status === "Awaiting confirmation";
    return c.status === filter;
  });

  const handleSaveAdminEdit = async () => {
    if (!activeModalItem) return;
    setSubmittingAction(true);

    const fullLocation = editAddress && editDistrict ? `${editAddress}, ${editDistrict}` : editAddress || editDistrict;

    try {
      const res = await fetch(`/api/complaints/${activeModalItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_edit",
          title: editTitle,
          description: editDescription,
          category: editCategory,
          district: editDistrict,
          address: editAddress,
          location: fullLocation,
          priority: editPriority,
          status: editStatus,
          currentLevel: editLevel,
          owner: editOwner,
          imageUrl: editImageUrl || undefined,
          author: `${currentOfficial.name} (${currentOfficial.title})`,
          message: actionNote || "Admin modified issue properties and status.",
        }),
      });

      if (res.ok) {
        setFeedback(`Grievance ${activeModalItem.id} updated successfully.`);
        setActiveModalItem(null);
        fetchQueue();
      }
    } catch {
      setFeedback("Failed to update grievance.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handlePerformOfficialAction = async (actionType: "resolve" | "progress") => {
    if (!activeModalItem) return;
    setSubmittingAction(true);

    const actionName = actionType === "resolve" ? "resolve_by_official" : "update_progress";

    try {
      const res = await fetch(`/api/complaints/${activeModalItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionName,
          message: actionNote || (actionType === "resolve" ? "Field repairs completed on-ground." : "Work is progressing on site."),
          author: `${currentOfficial.name} (${currentOfficial.title})`,
          proofPhoto: proofPhotoUrl,
          officialLevel: selectedOfficialLevel,
        }),
      });

      if (res.ok) {
        setFeedback(
          actionType === "resolve"
            ? `Resolution proof submitted for ${activeModalItem.id}. Ticket is now awaiting citizen confirmation.`
            : `Progress update logged for ${activeModalItem.id}.`
        );
        setActiveModalItem(null);
        fetchQueue();
      }
    } catch {
      setFeedback("Failed to update grievance.");
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="page bg-[#faf9f6] min-h-screen">
      <Header active="official" />

      <main className="dashboard max-w-6xl mx-auto py-8 px-4 md:px-6">
        {/* OFFICIAL PROFILE & PERSONA SWITCHER */}
        <div className="bg-white p-5 border border-line rounded-2xl shadow-xs mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="eyebrow text-emerald-800 m-0">Official Administrative Portal</div>
            <h1 className="serif text-2xl font-bold text-ink mt-1">
              Active Official: {currentOfficial.name}
            </h1>
            <p className="text-xs text-muted m-0">
              {currentOfficial.title} &bull; {currentOfficial.department}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Switch Official Persona:</span>
            <select
              value={selectedOfficialLevel}
              onChange={(e) => setSelectedOfficialLevel(Number(e.target.value))}
              className="text-xs font-semibold py-2 px-3 bg-gray-50 border border-line rounded-xl"
            >
              <option value={1}>Level 1: R. Kumar (Field Junior Engineer)</option>
              <option value={2}>Level 2: S. Balaji (Municipal Commissioner)</option>
              <option value={3}>Level 3: Dr. K. Venkata Ramana, IAS (District Collector)</option>
            </select>
          </div>
        </div>

        {feedback && (
          <div className="p-3 mb-6 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-xl flex items-center justify-between animate-fadeIn">
            <span>{feedback}</span>
            <button onClick={() => setFeedback("")} className="font-bold text-emerald-700">
              &times;
            </button>
          </div>
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-white border border-line rounded-xl p-4 shadow-xs">
            <small className="text-xs text-gray-500 font-medium">Total Live Queue</small>
            <strong className="text-2xl font-bold text-ink block mt-1">{items.length}</strong>
            <em className="text-[11px] text-emerald-700 not-italic font-semibold">AP Districts</em>
          </div>

          <div className="stat bg-white border border-line rounded-xl p-4 shadow-xs">
            <small className="text-xs text-gray-500 font-medium">My Level ({selectedOfficialLevel}) Tickets</small>
            <strong className="text-2xl font-bold text-indigo-700 block mt-1">
              {items.filter((c) => c.currentLevel === selectedOfficialLevel).length}
            </strong>
            <em className="text-[11px] text-indigo-600 not-italic font-semibold">Under your mandate</em>
          </div>

          <div className="stat bg-white border border-line rounded-xl p-4 shadow-xs">
            <small className="text-xs text-gray-500 font-medium">Auto-Escalated</small>
            <strong className="text-2xl font-bold text-amber-600 block mt-1">
              {items.filter((c) => c.status === "Escalated" || (c.escalationLog && c.escalationLog.length > 0)).length}
            </strong>
            <em className="text-[11px] text-amber-700 not-italic font-semibold">SLA Breached</em>
          </div>

          <div className="stat bg-white border border-line rounded-xl p-4 shadow-xs">
            <small className="text-xs text-gray-500 font-medium">Awaiting Citizen Confirmation</small>
            <strong className="text-2xl font-bold text-emerald-800 block mt-1">
              {items.filter((c) => c.status === "Awaiting confirmation").length}
            </strong>
            <em className="text-[11px] text-emerald-600 not-italic font-semibold">Citizen Gate Active</em>
          </div>
        </div>

        {/* QUEUE SECTION */}
        <section className="card p-0 overflow-hidden shadow-sm">
          <div className="p-4 md:p-6 border-b border-line flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
            <div>
              <h2 className="serif text-xl font-bold m-0">Live Village &amp; Ward Operational Queue</h2>
              <p className="text-xs text-muted m-0 mt-0.5">
                Showing {visible.length} issues. Click &ldquo;Manage / Edit&rdquo; to modify fields, update hierarchy, or submit resolution.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-white border border-line rounded-lg"
              >
                <option value="All">All Statuses</option>
                <option value="My Level">Assigned to My Level ({selectedOfficialLevel})</option>
                <option value="Submitted">Submitted</option>
                <option value="In progress">In Progress</option>
                <option value="Escalated">Auto-Escalated</option>
                <option value="Awaiting Confirmation">Awaiting Confirmation</option>
                <option value="Resolved">Closed &amp; Verified</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="divide-y divide-line">
            <div className="queue-table-header">
              <span>Grievance &amp; Evidence</span>
              <span>Category</span>
              <span>Hierarchy Tier</span>
              <span>Status</span>
              <span>SLA Due</span>
              <span className="text-right">Admin Controls</span>
            </div>

            {visible.map((c) => (
              <div key={c.id} className="queue-row hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt="Thumbnail"
                      className="w-12 h-12 rounded-lg object-cover flex-none border border-line shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-400 grid place-items-center text-[10px] flex-none">
                      No photo
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/track?id=${c.id}`}
                      className="font-bold text-xs text-ink hover:text-green hover:underline line-clamp-1"
                    >
                      {c.title}
                    </Link>
                    <div className="text-[11px] text-muted">
                      <span className="font-mono text-emerald-800 font-semibold">{c.id}</span> &bull; {c.location}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-700 font-medium">{c.category}</div>

                <div>
                  <span className="text-[11px] font-mono font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                    Level {c.currentLevel}
                  </span>
                </div>

                <div>
                  <span
                    className={`tag text-[10px] ${
                      c.status === "Resolved"
                        ? "green"
                        : c.status === "Awaiting confirmation"
                        ? "blue"
                        : c.status === "Escalated"
                        ? "amber"
                        : "gray"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="text-xs font-mono text-gray-600">
                  {c.status === "Resolved" ? "Closed" : c.due}
                </div>

                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => openItemModal(c, "edit")}
                    className="button secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <Edit3 size={12} /> Manage
                  </button>
                  <button
                    type="button"
                    onClick={() => openItemModal(c, "resolve")}
                    disabled={c.status === "Resolved" || c.status === "Awaiting confirmation"}
                    className="button primary text-[11px] py-1 px-2.5"
                  >
                    Resolve Proof
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ADMIN & OFFICIAL MANAGEMENT MODAL */}
      {activeModalItem && (
        <div className="modal-overlay" onClick={() => setActiveModalItem(null)}>
          <div className="modal-dialog max-w-lg" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setActiveModalItem(null)}
            >
              <X size={20} />
            </button>

            <div className="eyebrow">Admin / Official Management &bull; {activeModalItem.id}</div>
            <h2 className="serif text-xl font-bold mb-1">{activeModalItem.title}</h2>
            <p className="text-xs text-muted mb-4">{activeModalItem.location}</p>

            {/* TAB SELECTOR */}
            <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
                  activeTab === "edit" ? "bg-white shadow-xs text-green" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("edit")}
              >
                Edit Properties
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
                  activeTab === "resolve" ? "bg-white shadow-xs text-green" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("resolve")}
              >
                Submit Resolution
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
                  activeTab === "progress" ? "bg-white shadow-xs text-green" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("progress")}
              >
                Log Progress
              </button>
            </div>

            {/* TAB 1: EDIT PROPERTIES */}
            {activeTab === "edit" && (
              <div className="space-y-4 text-xs">
                <div className="field">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="field">
                    <label>Category</label>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                      <option value="Water & sanitation">Water &amp; sanitation</option>
                      <option value="Roads & transport">Roads &amp; transport</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Cleanliness">Cleanliness</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as "Normal" | "High" | "Critical")}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="field">
                    <label>Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Complaint["status"])}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="In progress">In progress</option>
                      <option value="Awaiting confirmation">Awaiting confirmation</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Resolved">Resolved (Closed)</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Hierarchy Level</label>
                    <select
                      value={editLevel}
                      onChange={(e) => setEditLevel(Number(e.target.value) as 1 | 2 | 3)}
                    >
                      <option value={1}>Level 1: Ward Field Officer</option>
                      <option value={2}>Level 2: Municipal Commissioner</option>
                      <option value={3}>Level 3: District Collector</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Assigned Department &amp; Officer</label>
                  <input
                    type="text"
                    value={editOwner}
                    onChange={(e) => setEditOwner(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>District (Andhra Pradesh)</label>
                  <select value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)}>
                    {apLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Specific Address / Landmark / Village</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. Door No. 4-21, Near Ramalayam, Main Road"
                  />
                </div>

                <div className="field">
                  <label>Issue Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="field">
                  <label>Evidence Photo URL</label>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-line">
                  <button className="button secondary text-xs" onClick={() => setActiveModalItem(null)}>
                    Cancel
                  </button>
                  <button
                    className="button primary text-xs"
                    disabled={submittingAction}
                    onClick={handleSaveAdminEdit}
                  >
                    {submittingAction ? "Saving..." : "Save Changes &rarr;"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: RESOLUTION PROOF */}
            {activeTab === "resolve" && (
              <div className="space-y-4 text-xs">
                <div className="field">
                  <label>Resolution Work Completion Note</label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="e.g. Broken pipe repaired with new PVC joint and tested for 2 hours..."
                    rows={3}
                  />
                </div>

                <div className="field">
                  <label className="flex items-center justify-between">
                    <span>After-Repair Evidence Photo (URL)</span>
                    <span className="text-[11px] text-gray-400 font-normal">Auto-filled demo proof</span>
                  </label>
                  <input
                    type="text"
                    value={proofPhotoUrl}
                    onChange={(e) => setProofPhotoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                {proofPhotoUrl && (
                  <div className="rounded-xl overflow-hidden border border-line max-h-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofPhotoUrl} alt="Proof preview" className="w-full h-36 object-cover" />
                  </div>
                )}

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <strong>Notice (§4 Citizen Gate):</strong> Submitting resolution proof will move the status to <em>&ldquo;Awaiting Confirmation&rdquo;</em>. The complaint will NOT close until the citizen confirms the fix on the ground.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-line">
                  <button className="button secondary text-xs" onClick={() => setActiveModalItem(null)}>
                    Cancel
                  </button>
                  <button
                    className="button primary text-xs"
                    disabled={submittingAction}
                    onClick={() => handlePerformOfficialAction("resolve")}
                  >
                    {submittingAction ? "Submitting..." : "Submit to Citizen Gate &rarr;"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PROGRESS UPDATE */}
            {activeTab === "progress" && (
              <div className="space-y-4 text-xs">
                <div className="field">
                  <label>Progress Log Note</label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="e.g. Field inspection team deployed on site. Heavy machinery scheduled for tomorrow morning."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-line">
                  <button className="button secondary text-xs" onClick={() => setActiveModalItem(null)}>
                    Cancel
                  </button>
                  <button
                    className="button primary text-xs"
                    disabled={submittingAction || !actionNote.trim()}
                    onClick={() => handlePerformOfficialAction("progress")}
                  >
                    {submittingAction ? "Logging..." : "Log Progress Entry &rarr;"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
