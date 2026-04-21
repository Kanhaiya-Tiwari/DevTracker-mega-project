import { useMemo, useState, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import ProgressBar from "../components/ProgressBar";
import ChartCard from "../components/ChartCard";
import AIInsightCard from "../components/AIInsightCard";
import SkillHistoryPanel from "../components/SkillHistoryPanel";
import { Upload, X, FileImage, FileText, Download } from "lucide-react";
import { formatDate, hours } from "../utils/format";
import { skillProgress, weekSeries } from "../utils/metrics";
import { api } from "../services/api";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

const QUALITY_OPTS = [
  { value: "deep", label: "Deep Focus", emoji: "🧠", color: "text-emerald-300" },
  { value: "medium", label: "Normal", emoji: "⚡", color: "text-slate-300" },
  { value: "light", label: "Casual", emoji: "📖", color: "text-slate-400" },
];

export default function SkillDetailPage({ skill, logs, insight, onLog, onRefreshInsight, insightLoading, token }) {
  const [hoursInput, setHoursInput] = useState("1");
  const [quality, setQuality] = useState("medium");
  const [notes, setNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedLogForProof, setSelectedLogForProof] = useState(null);
  const [logProofs, setLogProofs] = useState({});
  const [loadingProof, setLoadingProof] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submittingSession, setSubmittingSession] = useState(false);
  const [lastSubmittedLogId, setLastSubmittedLogId] = useState(null);
  const [sessionSubmitted, setSessionSubmitted] = useState(false);
  const [currentSessionLogId, setCurrentSessionLogId] = useState(null);
  const [proofUploaded, setProofUploaded] = useState(false);

  const progress = useMemo(() => skillProgress(skill, logs, logProofs), [skill, logs, logProofs]);
  const chart = useMemo(() => weekSeries(logs), [logs]);
  const daysLeft = skill?.deadline ? Math.max(0, Math.ceil((new Date(skill.deadline) - Date.now()) / 86400000)) : null;
  const recentLogs = useMemo(() => [...(logs || [])].reverse().slice(0, 10), [logs]);
  const totalDays = logs?.length || 0;
  const bestSession = logs?.reduce((best, l) => l.hours > (best?.hours || 0) ? l : best, null);

  // Load proof of work for each log when logs change
  useEffect(() => {
    if (logs && token) {
      logs.forEach(log => {
        loadProofOfWorkForLog(log.id);
      });
    }
  }, [logs, token]);

  const loadProofOfWorkForLog = async (logId) => {
    if (!logId || !token) return;
    setLoadingProof(prev => ({ ...prev, [logId]: true }));
    try {
      const data = await api.getProofOfWorkByLog(token, logId);
      setLogProofs(prev => ({ ...prev, [logId]: data || [] }));
    } catch (error) {
      console.error("Failed to load proof of work:", error);
    } finally {
      setLoadingProof(prev => ({ ...prev, [logId]: false }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setUploadFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setUploadPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setUploadPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedLogForProof) return;
    setUploading(true);
    try {
      await api.uploadProofOfWork(token, selectedLogForProof, uploadFile, uploadNotes);
      
      // If this was the current session, mark it as complete
      if (selectedLogForProof === currentSessionLogId) {
        setSessionSubmitted(false);
        setCurrentSessionLogId(null);
        alert("Session completed! Proof of work uploaded successfully.");
      } else {
        alert("Proof of work uploaded successfully!");
      }
      
      setShowProofModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadNotes("");
      setSelectedLogForProof(null);
      loadProofOfWorkForLog(selectedLogForProof);
    } catch (error) {
      alert(error?.message || "Failed to upload proof of work");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProof = async (proofId, logId) => {
    if (!confirm("Are you sure you want to delete this proof of work?")) return;
    try {
      await api.deleteProofOfWork(token, proofId);
      loadProofOfWorkForLog(logId);
    } catch (error) {
      alert(error?.message || "Failed to delete proof of work");
    }
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSession(true);
    try {
      console.log("Submitting session with proof...");
      
      // First upload proof of work
      if (!uploadFile) {
        alert("Please upload proof of work before submitting your session.");
        setSubmittingSession(false);
        return;
      }
      
      // Submit the session first
      const result = await onLog(skill.id, Number(hoursInput), quality, notes);
      console.log("Session submitted result:", result);
      
      setHoursInput("1");
      setNotes("");
      
      // Extract log ID from different possible response formats
      let logId;
      if (typeof result === 'string') {
        logId = result;
      } else if (result && typeof result === 'object') {
        logId = result.id || result.skillId || result.logId;
      }
      
      console.log("Extracted log ID:", logId);
      
      if (!logId) {
        console.error("No session ID found in response:", result);
        throw new Error("Failed to get session ID from response");
      }
      
      // Upload proof of work for the new session
      await api.uploadProofOfWork(token, logId, uploadFile, uploadNotes);
      
      // Reset form
      setUploadFile(null);
      setUploadPreview(null);
      setUploadNotes("");
      setProofUploaded(false);
      
      alert("Session submitted successfully with proof of work!");
    } catch (error) {
      console.error("Session submission error:", error);
      alert(error?.message || "Failed to submit session. Please try again.");
    } finally {
      setSubmittingSession(false);
    }
  };

  const openProofModal = (logId) => {
    setSelectedLogForProof(logId);
    setShowProofModal(true);
  };

  if (!skill) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
        <p className="text-4xl mb-3">🎯</p>
        <p className="text-white font-semibold text-lg">Select a skill to view details</p>
        <p className="text-slate-400 text-sm mt-1">Choose any skill card from the Dashboard to explore its progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-900/25 via-green-900/15 to-teal-900/10 p-5 shadow-xl shadow-black/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{skill.icon || "⚡"}</span>
                <div>
                  <h2 className="text-xl font-black text-white">{skill.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {daysLeft !== null && (
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${daysLeft <= 3 ? "bg-rose-500/20 text-rose-300" : daysLeft <= 7 ? "bg-amber-500/20 text-amber-300" : "bg-slate-700 text-slate-300"}`}>
                        {daysLeft === 0 ? "🔴 Due today" : `${daysLeft} days left`}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">Deadline {formatDate(skill.deadline)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 font-medium">{progress.pct}% complete</span>
                  <span className="text-slate-400">{hours(progress.remaining)} remaining</span>
                </div>
                <ProgressBar value={progress.pct} tone={progress.pct >= 70 ? "emerald" : progress.pct >= 35 ? "yellow" : "red"} height="h-3" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-2 shadow-lg shadow-emerald-500/5"
              >
                📅 Date History
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4 mt-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Completed</p><p className="text-lg font-bold text-emerald-300 mt-0.5">{hours(progress.completed)}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Remaining</p><p className="text-lg font-bold text-amber-300 mt-0.5">{hours(progress.remaining)}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Daily Avg</p><p className="text-lg font-bold text-teal-300 mt-0.5">{hours(progress.dailyAvg)}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Sessions</p><p className="text-lg font-bold text-purple-300 mt-0.5">{totalDays}</p></div>
          </div>
        </div>
      </section>

      {/* Log Session */}
      <section className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Log a Session</h3>
        
        {/* Proof of Work Upload Section */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-purple-300 mb-3">Step 1: Upload Proof of Work (Required)</h4>
          <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              id="session-proof-upload"
            />
            <label htmlFor="session-proof-upload" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">Click to upload proof</p>
              <p className="text-slate-400 text-xs">Screenshot of your work</p>
              <p className="text-slate-500 text-xs mt-1">PNG, JPG, PDF up to 10MB</p>
            </label>
          </div>
          
          {uploadFile && (
            <div className="mt-3 bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-lg p-3 flex items-center gap-3">
              {uploadPreview ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden ring-2 ring-purple-500/30">
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-700 to-violet-600 flex items-center justify-center">
                  {uploadFile.type.startsWith("image/") ? (
                    <FileImage className="w-6 h-6 text-white" />
                  ) : (
                    <FileText className="w-6 h-6 text-white" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{uploadFile.name}</p>
                <p className="text-xs text-slate-400">{(uploadFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-rose-400" />
              </button>
            </div>
          )}
          
          <Input
            label="Proof Notes (optional)"
            value={uploadNotes}
            onChange={(e) => setUploadNotes(e.target.value)}
            placeholder="Add a note about this proof..."
            className="mt-3"
          />
        </div>

        {/* Session Details Section */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-xs font-semibold text-purple-300 mb-3">Step 2: Session Details</h4>
          <form className="flex flex-col gap-3"
            onSubmit={handleSessionSubmit}
          >
            <div className="flex gap-3 flex-wrap">
              <Input label="Hours" type="number" step="0.25" min="0.25" max="12" value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} className="w-28" />
              <div className="flex-1">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Session Quality</span>
                  <div className="flex gap-2">
                    {QUALITY_OPTS.map((q) => (
                      <button key={q.value} type="button" onClick={() => setQuality(q.value)}
                        className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition ${quality === q.value ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-white/8 bg-white/4 text-slate-400 hover:bg-white/8"}`}>
                        {q.emoji} {q.label}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            </div>
            <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you work on?" />
            
            <Button 
              variant="success" 
              type="submit" 
              disabled={submittingSession || !uploadFile}
              className="w-full"
            >
              {submittingSession ? "Submitting..." : "Submit Session with Proof"}
            </Button>
            
            {!uploadFile && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs text-amber-300 font-semibold">Required:</p>
                <p className="text-xs text-amber-200 mt-1">Please upload proof of work before submitting your session.</p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Charts & History */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Daily Hours (7 days)" subtitle="Recent activity" data={chart} color="emerald" />

        <section className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <h3 className="text-sm font-bold text-white mb-3">📋 Session History</h3>
          {recentLogs.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No sessions logged yet. Start your journey!</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => {
                const proofs = logProofs[log.id] || [];
                const hasProof = proofs.length > 0;
                return (
                  <div key={log.id} className="rounded-xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-slate-200 font-medium">{formatDate(log.log_date || log.date)}</p>
                          {log.quality && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{log.quality}</span>
                          )}
                        </div>
                        {log.notes && <p className="text-xs text-slate-500">{log.notes}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white text-lg">{hours(log.hours)}</p>
                      </div>
                    </div>

                    {/* Proof of Work Section for this session */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-purple-300">📸 Proof of Work</p>
                        {!hasProof && (
                          <button
                            onClick={() => openProofModal(log.id)}
                            className="text-xs px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                          >
                            <Upload className="w-3 h-3 inline mr-1" />
                            Upload
                          </button>
                        )}
                      </div>

                      {loadingProof[log.id] ? (
                        <p className="text-xs text-slate-500">Loading...</p>
                      ) : hasProof ? (
                        <div className="grid grid-cols-3 gap-2">
                          {proofs.map((proof) => (
                            <div key={proof.id} className="relative group">
                              {proof.file_type?.startsWith("image/") ? (
                                <img
                                  src={`http://localhost:8000/uploads/${proof.file_url.split("/").pop()}`}
                                  alt={proof.file_name}
                                  className="w-full h-16 object-cover rounded-lg border border-purple-500/30"
                                />
                              ) : (
                                <div className="w-full h-16 rounded-lg border border-purple-500/30 bg-purple-900/20 flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-purple-400" />
                                </div>
                              )}
                              <button
                                onClick={() => handleDeleteProof(proof.id, log.id)}
                                className="absolute top-1 right-1 p-1 bg-rose-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete proof"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No proof uploaded yet</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* AI Insight */}
      {insight && <AIInsightCard insight={insight} onRefresh={onRefreshInsight} loading={insightLoading} />}

      {/* Skill Milestones */}
      {progress.pct > 0 && (
        <section className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/8 to-orange-500/5 p-5">
          <h3 className="text-sm font-bold text-amber-300 mb-3">🎯 Milestones</h3>
          <div className="space-y-2">
            {[25, 50, 75, 100].map((milestone) => (
              <div key={milestone} className={`flex items-center gap-3 rounded-xl p-2.5 ${progress.pct >= milestone ? "bg-emerald-500/10 border border-emerald-400/20" : "bg-white/4 border border-white/6 opacity-50"}`}>
                <span className="text-lg">{progress.pct >= milestone ? "✅" : "⏳"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{milestone}% Complete</p>
                  <p className="text-xs text-slate-400">{hours(skill.total_hours * milestone / 100)} of {hours(skill.total_hours)}</p>
                </div>
                {progress.pct >= milestone && <span className="text-xs text-emerald-300 font-bold">Achieved!</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Best Session */}
      {bestSession && (
        <section className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/8 to-green-600/5 p-4">
          <p className="text-xs font-bold text-emerald-300 mb-1">🥇 Your Best Session</p>
          <p className="text-white font-bold">{hours(bestSession.hours)} on {formatDate(bestSession.log_date || bestSession.date)}</p>
          <p className="text-slate-400 text-xs mt-0.5">Every session counts. This was your personal best — beat it!</p>
        </section>
      )}

      {/* Date History Modal */}
      {showHistory && (
        <SkillHistoryPanel skill={skill} token={token} onClose={() => setShowHistory(false)} />
      )}

      {/* Proof of Work Upload Modal */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-md px-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                Upload Proof of Work
              </h3>
              <button
                onClick={() => setShowProofModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-10 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="cursor-pointer block">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-1">Click to upload</p>
                  <p className="text-slate-400 text-sm">or drag and drop</p>
                  <p className="text-slate-500 text-xs mt-2">PNG, JPG, PDF, DOC up to 10MB</p>
                </label>
              </div>

              <Input
                label="Notes (optional)"
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Add a note about this proof..."
              />

              {uploadFile && (
                <div className="bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-xl p-4 flex items-center gap-4 animate-slide-up">
                  {uploadPreview ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden ring-2 ring-purple-500/30">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-700 to-violet-600 flex items-center justify-center">
                      {uploadFile.type.startsWith("image/") ? (
                        <FileImage className="w-7 h-7 text-white" />
                      ) : (
                        <FileText className="w-7 h-7 text-white" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{uploadFile.name}</p>
                    <p className="text-xs text-slate-400">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                    className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowProofModal(false)}
                  className="flex-1 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="flex-1 font-medium bg-purple-600 hover:bg-purple-700"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : "Upload Proof"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
