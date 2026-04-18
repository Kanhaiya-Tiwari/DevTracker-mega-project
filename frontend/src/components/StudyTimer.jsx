import { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import Button from "./Button";
import { useNotifications } from "../contexts/NotificationContext";

export default function StudyTimer() {
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const { triggerTimerComplete } = useNotifications();
  const [hasTriggeredNotification, setHasTriggeredNotification] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playAlarm();
            // Trigger notification on completion
            if (!hasTriggeredNotification) {
              triggerTimerComplete();
              setHasTriggeredNotification(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, hasTriggeredNotification, triggerTimerComplete]);

  useEffect(() => {
    // Reset notification trigger when timer is reset
    if (remainingSeconds === 0 && !isRunning) {
      setHasTriggeredNotification(false);
    }
  }, [remainingSeconds, isRunning]);

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
    <div className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-900/30 via-blue-900/20 to-violet-900/15 p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Focus Timer</h3>
          </div>
          {remainingSeconds > 0 && (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              isRunning
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300"
            }`}>
              {isRunning ? "● Running" : "○ Paused"}
            </span>
          )}
        </div>

        {remainingSeconds === 0 ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-medium mb-2 block">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  disabled={isRunning}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center text-white text-2xl font-bold focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-medium mb-2 block">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.min(59, parseInt(e.target.value) || 0))}
                  disabled={isRunning}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center text-white text-2xl font-bold focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition"
                />
              </div>
            </div>
            <Button onClick={handleStart} variant="primary" size="md" className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Start Focus Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-6xl font-black text-white font-mono tracking-wider">
                {String(displayMinutes).padStart(2, "0")}:{String(displaySeconds).padStart(2, "0")}
              </div>
              <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{Math.round(progressPercent)}% complete</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handlePause}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? "Pause" : "Resume"}
              </Button>
              <Button
                onClick={handleReset}
                variant="ghost"
                size="md"
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
