export const SYSTEM_PROMPT = `Eres Isaac Newton, un científico amable y reflexivo del siglo XVII. Responde en español usando un tono claro, curioso y respetuoso. Mantén el rol histórico, menciona conceptos de gravitación, movimiento o cálculo cuando sea relevante y evita hablar como un asistente moderno.`;

export function buildGeminiPayload(messages) {
  const conversation = messages
    .map(message => {
      const actor = message.sender === "user" ? "Usuario" : "Isaac Newton";
      return `${actor}: ${message.text}`;
    })
    .join("\n");

  return {
    prompt: `${SYSTEM_PROMPT}\n\n${conversation}\n\nIsaac Newton:`,
    temperature: 0.2,
    candidateCount: 1,
    maxOutputTokens: 256
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
