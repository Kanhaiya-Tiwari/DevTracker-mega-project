import { useState, useRef, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { api } from "../services/api";

const QUICK_PROMPTS = [
  "What should I focus on today?",
  "How do I stay consistent?",
  "Give me a study schedule",
  "I'm feeling stuck and unmotivated",
  "How do I measure my progress?",
  "Best resources for this skill?",
];

const INITIAL_MSG = {
  role: "assistant",
  text: "Hey! I'm your DevTrackr AI Coach. I analyse your learning data and give real, actionable advice.\n\nWhat's blocking your progress today?",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function AIChatPage({ skill, insight, token }) {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [model, setModel] = useState("...");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send(overrideText) {
    const msg = (overrideText || text).trim();
    if (!msg || thinking) return;
    setText("");

    const userMsg = { role: "user", text: msg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    try {
      const res = await api.chat(token, {
        message: msg,
        skill_name: skill?.name || null,
        context: insight?.coach_message || null,
        history: messages.slice(-6),
      });
      setModel(res.model || "llama3");
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: res.reply,
        model: res.model,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "I'm having trouble reaching the AI service. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[600px] max-h-[85vh] rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-gradient-to-r from-sky-500/8 to-blue-600/5 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-lg shadow-lg shadow-sky-900/30 pulse-glow">🤖</div>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">DevTrackr AI Coach</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-emerald-300">Powered by OpenRouter AI &bull; {model !== "..." ? model : "LLM"}</p>
          </div>
        </div>
        {skill && (
          <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 text-right">
            <p className="text-xs text-slate-400">Context</p>
            <p className="text-xs font-semibold text-sky-300 max-w-28 truncate">{skill.icon} {skill.name}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} slide-up`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white mr-2 mt-1 shrink-0">🤖</div>
            )}
            <div className={`max-w-[80%]`}>
              <div className={`px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "chat-bubble-user text-white" : "chat-bubble-ai text-slate-100"}`}>
                {m.text}
              </div>
              <div className={`flex items-center gap-1 mt-1 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <span className="text-xs text-slate-600">{m.time}</span>
                {m.model && <span className="text-xs text-slate-600">&bull; {m.model}</span>}
              </div>
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white ml-2 mt-1 shrink-0">U</div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2 slide-up">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-xs text-white shrink-0">🤖</div>
            <div className="chat-bubble-ai px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
                <span className="text-xs text-slate-400 ml-1">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto shrink-0">
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => send(p)}
            className="rounded-full border border-sky-500/25 bg-sky-500/8 px-3 py-1 text-xs text-sky-300 hover:bg-sky-500/18 transition whitespace-nowrap shrink-0">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/8 flex gap-2 shrink-0 bg-black/30">
        <input
          className="field flex-1 text-sm py-2.5"
          placeholder="Ask your AI coach anything..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          disabled={thinking}
        />
        <Button onClick={() => send()} disabled={thinking || !text.trim()} variant="primary" size="md">
          {thinking ? "..." : "🚀 Send"}
        </Button>
      </div>
    </div>
  );
}
