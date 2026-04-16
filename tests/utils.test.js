import { describe, it, expect } from "vitest";
import { buildGeminiPayload, createMessageHtml } from "../src/utils.js";

describe("utils helpers", () => {
  it("construye el payload con system y roles", () => {
    const payload = buildGeminiPayload([
      { text: "Hola", sender: "user" },
      { text: "Hola humano", sender: "assistant" }
    ]);

    expect(payload.prompt).toContain("Eres Isaac Newton");
    expect(payload.prompt).toContain("Usuario: Hola");
    expect(payload.prompt).toContain("Isaac Newton: Hola humano");
    expect(payload.temperature).toBe(0.2);
  });

  it("escapa HTML en los mensajes", () => {
    const html = createMessageHtml({ text: "<script>alert(1)</script>", sender: "assistant" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
