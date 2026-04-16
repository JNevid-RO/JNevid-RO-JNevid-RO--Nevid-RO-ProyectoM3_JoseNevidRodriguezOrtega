import { describe, it, expect } from "vitest";
import { buildGeminiPayload, createMessageHtml } from "../src/utils.js";

describe("utils helpers", () => {
  it("construye el payload con system y roles", () => {
    const payload = buildGeminiPayload([
      { text: "Hola", sender: "user" },
      { text: "Hola humano", sender: "assistant" }
    ]);

    expect(payload.messages[0].role).toBe("SYSTEM");
    expect(payload.messages[1].role).toBe("HUMAN");
    expect(payload.messages[2].role).toBe("ASSISTANT");
    expect(payload.model).toBe("gemini-1.5-pro");
  });

  it("escapa HTML en los mensajes", () => {
    const html = createMessageHtml({ text: "<script>alert(1)</script>", sender: "assistant" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
