import { api } from "../services/api";

// Simple AI chat using our backend API
export async function chatStream(messages, onChunk, options = {}) {
  const response = await api.chat(
    options.token || localStorage.getItem("token"),
    {
      message: messages[messages.length - 1].content,
      skill_name: options.skillName,
      context: options.context,
      history: messages.slice(0, -1).map(m => ({
        role: m.role,
        text: m.content
      }))
    }
  );

  if (response && response.reply) {
    // Simulate streaming by sending chunks
    const chunks = response.reply.split(' ');
    let currentText = '';
    
    for (const chunk of chunks) {
      currentText += (currentText ? ' ' : '') + chunk;
      onChunk(chunk + ' ');
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } else {
    throw new Error("No response from AI");
  }
}

export async function chat(messages, options = {}) {
  const response = await api.chat(
    options.token || localStorage.getItem("token"),
    {
      message: messages[messages.length - 1].content,
      skill_name: options.skillName,
      context: options.context,
      history: messages.slice(0, -1).map(m => ({
        role: m.role,
        text: m.content
      }))
    }
  );

  return response?.reply || "Sorry, I couldn't process your request.";
}
