const SYSTEM_PROMPT = `Eres Isaac Newton, un científico amable y reflexivo del siglo XVII. Responde en español con claridad y curiosidad. Mantén el rol histórico y menciona conceptos de gravitación, movimiento o cálculo cuando sean relevantes. Nunca digas que eres un asistente moderno ni reveles detalles de la implementación.`;

function buildGeminiPayload(messages) {
  const formattedMessages = messages.map(message => ({
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
      ...formattedMessages
    ]
  };
}

function extractReply(data) {
  return (
    data?.candidates?.[0]?.content?.[0]?.text ||
    data?.messages?.[0]?.content?.[0]?.text ||
    data?.output?.[0]?.content?.[0]?.text ||
    "Lo siento, no pude generar una respuesta."
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  let body = req.body;

  if (!body && typeof req.json === "function") {
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON inválido en la petición:", parseError);
      return res.status(400).json({ error: "Body JSON inválido." });
    }
  }

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (parseError) {
      console.error("JSON inválido en la petición:", parseError);
      return res.status(400).json({ error: "Body JSON inválido." });
    }
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("Falta GEMINI_API_KEY en el entorno");
    return res.status(500).json({ error: "Falta la clave GEMINI_API_KEY en el entorno." });
  }

  const { messages } = body || {};
  console.error("api/functions request", {
    method: req.method,
    contentType: req.headers?.["content-type"] || req.headers?.["Content-Type"],
    bodyType: typeof body,
    messagesCount: Array.isArray(messages) ? messages.length : 0
  });

  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: "El cuerpo debe incluir un arreglo de mensajes." });
  }

  const payload = buildGeminiPayload(messages);

  const fetchFn = typeof fetch === "function" ? fetch : undefined;

  if (!fetchFn) {
    console.error("Fetch no está disponible en el runtime de la función.");
    return res.status(500).json({ error: "Fetch no está disponible en el runtime." });
  }

  try {
    const response = await fetchFn(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateMessage?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    let data = {};
    let text = "";

    if (typeof response.text === "function") {
      text = await response.text();
    }

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Error parseando respuesta Gemini:", parseError, "texto:", text);
        return res.status(502).json({ error: "Respuesta inválida de Gemini AI." });
      }
    } else if (typeof response.json === "function") {
      data = await response.json();
    }

    if (!response.ok) {
      console.error("Gemini API respondió con error", {
        status: response.status,
        statusText: response.statusText,
        body: data
      });
      return res.status(502).json({ error: data.error?.message || "Error en Gemini AI." });
    }

    const reply = extractReply(data);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error en proxy Gemini:", error?.message || error, error?.stack || "");
    const detail = process.env.NODE_ENV !== "production" ? error?.message || String(error) : "Error interno en el proxy de Gemini AI.";
    return res.status(500).json({ error: detail });
  }
}
