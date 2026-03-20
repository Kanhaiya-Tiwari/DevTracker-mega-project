import { useState, useEffect } from "react";
import Button from "./Button";

export default function StudyTimer() {
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  const playAlarm = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleStart = () => {
    if (!isRunning) {
      const mins = parseInt(minutes) || 0;
      const secs = parseInt(seconds) || 0;
      const total = mins * 60 + secs;
      if (total > 0) {
        setTotalSeconds(total);
        setRemainingSeconds(total);
        setIsRunning(true);
      }
    }
  };

  const handlePause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    setMinutes("25");
    setSeconds("0");
  };

  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/8 to-purple-600/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <h3 className="text-sm font-bold text-violet-300">Study Timer</h3>
        </div>
        {remainingSeconds > 0 && (
          <span className="text-xs font-medium text-violet-200 bg-violet-500/20 px-2 py-1 rounded-full">
            {isRunning ? "🟢 Running" : "⏸️ Paused"}
          </span>
        )}
      </div>

      {remainingSeconds === 0 ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 font-medium mb-1 block">Minutes</label>
              <input
                type="number"
                min="0"
                max="120"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                disabled={isRunning}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-center text-white text-lg font-semibold focus:border-violet-400 focus:outline-none transition"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 font-medium mb-1 block">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.min(59, parseInt(e.target.value) || 0))}
                disabled={isRunning}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-center text-white text-lg font-semibold focus:border-violet-400 focus:outline-none transition"
              />
            </div>
          </div>
          <Button onClick={handleStart} variant="primary" size="sm" className="w-full">
            ▶️ Start Timer
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-5xl font-black text-violet-300 font-mono">
              {String(displayMinutes).padStart(2, "0")}:{String(displaySeconds).padStart(2, "0")}
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePause}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              {isRunning ? "⏸️ Pause" : "▶️ Resume"}
            </Button>
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="flex-1"
            >
              🔄 Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
