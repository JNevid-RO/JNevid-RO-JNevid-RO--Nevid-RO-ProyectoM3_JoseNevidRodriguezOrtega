import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "../api/functions.js";

describe("API proxy /api/functions", () => {
  let res;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    res = {
      status: vi.fn(() => res),
      json: vi.fn(() => res)
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devuelve 405 para métodos distintos a POST", async () => {
    const req = { method: "GET" };
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it("devuelve 500 cuando falta GEMINI_API_KEY", async () => {
    process.env.GEMINI_API_KEY = "";
    const req = { method: "POST", body: { messages: [{ text: "Hola", sender: "user" }] } };
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it("invoca a Gemini y devuelve la respuesta correcta", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: [
              { text: "Respuesta de prueba" }
            ]
          }
        ]
      })
    });

    const req = { method: "POST", body: { messages: [{ text: "Hola", sender: "user" }] } };
    await handler(req, res);

    expect(global.fetch).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ reply: "Respuesta de prueba" });
  });
});
