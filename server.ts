import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON payloads
  app.use(express.json());

  // API endpoint to handle customer feedback generation
  app.post("/api/generate-reply", async (req, res) => {
    try {
      const { review } = req.body;

      if (!review || typeof review !== "string" || !review.trim()) {
        return res.status(400).json({ error: "Please provide a valid customer review." });
      }

      const ai = getAiClient();
      
      const systemInstruction = 
        "You are the friendly owner of Chai Point, a small café in Kolkata. " +
        "Write a short, warm, sincere reply to this customer review. " +
        "Apologise genuinely if it is negative, thank them if positive, " +
        "never be defensive, and invite them back. Keep it under 90 words. " +
        "Sign off as 'Warm regards, Team Chai Point'.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Customer Review: "${review.trim()}"`,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text;
      if (!reply) {
        return res.status(500).json({ error: "Failed to generate a reply. Please try again." });
      }

      return res.json({ reply: reply.trim() });
    } catch (error: any) {
      console.error("Error generating reply:", error);
      return res.status(500).json({
        error: error.message || "An unexpected error occurred while communicating with the Gemini API."
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
