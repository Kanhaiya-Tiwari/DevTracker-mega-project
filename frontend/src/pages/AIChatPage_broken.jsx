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
      console.log("Sending AI chat request...");
      const response = await fetch("http://localhost:8000/api/v1/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: msg,
          skill_name: skill?.name,
          context: insight?.coach_message
        })
      });

      console.log("AI chat response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("AI chat response data:", data);

      if (data && data.reply) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          text: data.reply,
          model: data.model || "fallback",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
        
        setModel(data.model || "fallback");
        setProvider(data.powered_by || "DevTrackr");
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">???</span>
          <div>
            <h2 className="text-xl font-bold text-white">AI Coach</h2>
            <p className="text-sm text-slate-400">
              {skill ? `Coaching you on ${skill.name}` : "General learning advice"}
            </p>
          </div>
        </div>

        <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-900/50 rounded-xl">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : msg.error
                    ? "bg-red-600/20 text-red-300 border border-red-600/50"
                    : "bg-slate-700 text-white"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                {msg.model && (
                  <p className="text-xs opacity-50 mt-1">{msg.model}</p>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-white px-4 py-2 rounded-2xl">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
              <Button
                key={prompt}
                variant="secondary"
                size="sm"
                onClick={() => handleQuickPrompt(prompt)}
                className="text-xs px-2 py-1 whitespace-nowrap"
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your learning..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={thinking}
              className="flex-1"
            />
            <Button
              onClick={() => send()}
              disabled={thinking || !text.trim()}
              variant="primary"
            >
              Send
            </Button>
          </div>
        </div>

        {model !== "..." && (
          <div className="mt-4 text-xs text-slate-400 text-center">
            Powered by {provider} · {model}
          </div>
        )}
      </div>
    </div>
  );
}
