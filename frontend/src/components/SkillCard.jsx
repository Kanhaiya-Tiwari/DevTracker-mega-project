import { useState, useEffect } from "react";
import { Upload, X, FileImage, FileText, Download } from "lucide-react";
import Button from "./Button";
import ProgressBar from "./ProgressBar";
import { hours } from "../utils/format";
import { skillProgress } from "../utils/metrics";
import { api } from "../services/api";

function ProofOfWorkModal({ open, onClose, skillId, token }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadProofOfWork(token, skillId, file);
      alert("Proof of work uploaded successfully!");
      onClose();
    } catch (error) {
      alert(error?.message || "Failed to upload proof of work");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-md px-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            Upload Proof of Work
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="border-2 border-dashed border-slate-600 rounded-2xl p-10 text-center hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-300">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              id="proof-upload"
            />
            <label htmlFor="proof-upload" className="cursor-pointer block">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-sky-400" />
              </div>
              <p className="text-white font-semibold text-lg mb-1">Click to upload</p>
              <p className="text-slate-400 text-sm">or drag and drop</p>
              <p className="text-slate-500 text-xs mt-2">PNG, JPG, PDF, DOC up to 10MB</p>
            </label>
          </div>

          {file && (
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 flex items-center gap-4 animate-slide-up">
              {preview ? (
                <div className="w-14 h-14 rounded-lg overflow-hidden ring-2 ring-sky-500/30">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                  {file.type.startsWith("image/") ? (
                    <FileImage className="w-7 h-7 text-sky-400" />
                  ) : (
                    <FileText className="w-7 h-7 text-violet-400" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-rose-400" />
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 font-medium"
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
  );
}

export default function SkillCard({ skill, logs = [], selected, onSelect, onLog, token }) {
  const [showProofModal, setShowProofModal] = useState(false);
  const [hasProofOfWork, setHasProofOfWork] = useState(false);
  const [loadingProof, setLoadingProof] = useState(false);

  // Check if proof of work exists for this skill
  const checkProofOfWork = async () => {
    if (!token || !skill.id) return;
    setLoadingProof(true);
    try {
      const proof = await api.getProofOfWork(token, skill.id);
      setHasProofOfWork(!!proof);
    } catch (error) {
      setHasProofOfWork(false);
    } finally {
      setLoadingProof(false);
    }
  };

  // Check proof of work on mount
  useEffect(() => {
    checkProofOfWork();
  }, [skill.id, token]);

  const p = skillProgress(skill, logs);
  const tone = p.pct >= 70 ? "green" : p.pct >= 35 ? "yellow" : "red";
  const daysLeft = skill.deadline
    ? Math.max(0, Math.ceil((new Date(skill.deadline) - Date.now()) / 86400000))
    : null;

  return (
    <div
      onClick={() => onSelect?.(skill.id)}
      className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        selected
          ? "border-sky-500/50 bg-gradient-to-br from-sky-500/15 via-blue-600/10 to-violet-600/5 shadow-xl shadow-sky-900/30 animate-pulse-glow"
          : "border-white/8 bg-gradient-to-br from-slate-800/50 to-slate-900/30 hover:border-sky-500/30 hover:bg-gradient-to-br hover:from-sky-500/10 hover:to-violet-600/5 hover:shadow-lg hover:shadow-sky-900/20"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
            selected
              ? "bg-gradient-to-br from-sky-500 to-violet-600 shadow-lg shadow-sky-900/30"
              : "bg-gradient-to-br from-slate-700 to-slate-800 group-hover:from-sky-600 group-hover:to-violet-600"
          }`}>
            {skill.icon || "⚡"}
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">{skill.name}</p>
            {daysLeft !== null && (
              <p className={`text-xs mt-1 font-medium transition-colors ${
                daysLeft === 0 ? "text-rose-400 animate-pulse" :
                daysLeft <= 3 ? "text-rose-400" :
                daysLeft <= 7 ? "text-amber-400" :
                "text-slate-500"
              }`}>
                {daysLeft === 0 ? "🔴 Due today!" : `${daysLeft} days left`}
              </p>
            )}
          </div>
        </div>
        <span className={`text-sm font-bold rounded-full px-3 py-1 transition-all duration-300 ${
          p.pct >= 70 ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/30" :
          p.pct >= 35 ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30" :
          "bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-300 border border-rose-500/30"
        }`}>{p.pct}%</span>
      </div>

      <ProgressBar value={p.pct} tone={tone} height="h-2" />

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-400 font-medium">{hours(p.completed)} completed</span>
        <span className="text-slate-500">{hours(p.remaining)} remaining</span>
      </div>

      {!hasProofOfWork && (
        <div className="mt-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-2 animate-pulse">
          <p className="text-xs text-amber-400 font-semibold flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" />
            Upload proof of work to enable logging
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          variant={selected ? "primary" : "secondary"}
          className="flex-1 font-medium"
          onClick={(e) => { e.stopPropagation(); onSelect?.(skill.id); }}
        >
          View Details
        </Button>
        <Button
          size="sm"
          variant={hasProofOfWork ? "success" : "ghost"}
          disabled={!hasProofOfWork}
          onClick={(e) => { e.stopPropagation(); onLog?.(skill.id); }}
          className={!hasProofOfWork ? "opacity-50 cursor-not-allowed" : "font-medium"}
          title={hasProofOfWork ? "Log hours" : "Upload proof of work first"}
        >
          ⚡ Log
        </Button>
        <Button
          size="sm"
          variant={hasProofOfWork ? "secondary" : "primary"}
          onClick={(e) => { e.stopPropagation(); setShowProofModal(true); }}
          title={hasProofOfWork ? "Update proof of work" : "Upload proof of work"}
          className="transition-all duration-200 hover:scale-105"
        >
          {hasProofOfWork ? (
            <span className="text-emerald-400">✓</span>
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
      </div>
      <ProofOfWorkModal
        open={showProofModal}
        onClose={() => {
          setShowProofModal(false);
          checkProofOfWork(); // Refresh proof of work status
        }}
        skillId={skill.id}
        token={token}
      />
    </div>
  );
}
