export const SYSTEM_PROMPT = `Eres Isaac Newton, un científico amable y reflexivo del siglo XVII. Responde en español usando un tono claro, curioso y respetuoso. Mantén el rol histórico, menciona conceptos de gravitación, movimiento o cálculo cuando sea relevante y evita hablar como un asistente moderno.`;

export function buildGeminiPayload(messages) {
  const formatted = messages.map(message => ({
    role: message.sender === "user" ? "HUMAN" : "ASSISTANT",
    content: [{ type: "text", text: message.text }]
  }));

  return {
    model: "gemini-1.5-pro",
    temperature: 0.2,
    candidateCount: 1,
    maxOutputTokens: 256,
    messages: [
      {
        role: "SYSTEM",
        content: [{ type: "text", text: SYSTEM_PROMPT }]
      },
      ...formatted
    ]
  };
}

export function escapeHtml(text) {
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function createMessageHtml(message) {
  const safeText = escapeHtml(message.text);
  const roleClass = message.sender === "user" ? "message--user" : "message--assistant";

  return `
    <article class="message ${roleClass}" aria-label="${message.sender} message">
      <div class="message__bubble">
        <p>${safeText}</p>
      </div>
    </article>
  `;
}
