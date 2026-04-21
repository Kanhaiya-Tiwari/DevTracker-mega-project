import { useState, useRef, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { chatStream } from "../lib/ai";
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
  const [provider, setProvider] = useState("OpenRouter");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send(overrideText) {
    const msg = (overrideText || text).trim();
    if (!msg || thinking) return;
    setText("");

    // Check if token is available
    if (!token) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "Please log in to use the AI coach.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
      return;
    }

    const userMsg = { role: "user", text: msg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    try {
      const response = await api.chat(
        token,
        {
          message: msg,
          skill_name: skill?.name,
          context: insight?.coach_message,
          history: messages.slice(-6).slice(0, -1).map(m => ({
            role: m.role,
            text: m.text
          }))
        }
      );

      if (response && response.reply) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          text: response.reply,
          model: response.model || "fallback",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        
        setModel(response.model || "fallback");
        setProvider(response.powered_by || "DevTrackr");
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "Sorry, I'm having trouble connecting right now. Try again in a moment!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        error: true
      }]);
      setModel("error");
      setProvider("offline");
    } finally {
      setThinking(false);
    }
  }

  const handleQuickPrompt = (prompt) => {
    setText(prompt);
    send(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">AI Coach</h2>
            <p className="text-sm text-purple-300">Personalized learning guidance</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Model: {model}</p>
            <p className="text-xs text-slate-400">Provider: {provider}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === "user" 
                ? "bg-purple-600 text-white" 
                : "bg-slate-800 text-slate-100 border border-purple-500/20"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs mt-1 opacity-70">{msg.time}</p>
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-100 border border-purple-500/20 p-3 rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-t border-purple-500/20 p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1 text-xs bg-purple-600/20 text-purple-300 rounded-full hover:bg-purple-600/30 transition-colors"
              disabled={thinking}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask me anything about your learning..."
            onKeyPress={(e) => e.key === "Enter" && send()}
            disabled={thinking}
            className="flex-1"
          />
          <Button
            onClick={() => send()}
            disabled={thinking || !text.trim()}
            className="px-4 py-2"
          >
            {thinking ? "..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
