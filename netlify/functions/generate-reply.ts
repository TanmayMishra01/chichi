import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const { review } = await req.json();

    if (!review || typeof review !== "string" || !review.trim()) {
      return new Response(JSON.stringify({ error: "Please provide a valid customer review." }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Retrieve API key from Netlify environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "GEMINI_API_KEY is not configured on Netlify. Please configure it in your Netlify Site Settings > Environment Variables." 
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Initialize the Gemini client
    const ai = new GoogleGenAI({ apiKey });
    
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
      return new Response(JSON.stringify({ error: "Failed to generate a reply from the Gemini API. Please try again." }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response(JSON.stringify({ reply: reply.trim() }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error in Netlify generate-reply function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred while communicating with the Gemini API." }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
