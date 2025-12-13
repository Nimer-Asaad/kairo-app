import OpenAI from "openai";

// Safe initialization: allow server to start even if API key is missing
const apiKey = process.env.OPENAI_API_KEY;
let openaiInstance = null;

if (apiKey && apiKey.trim()) {
  openaiInstance = new OpenAI({ apiKey });
} else {
  console.warn(
    "[openaiClient] OPENAI_API_KEY is missing. AI features will be disabled until you set it in .env"
  );
}

export const openai = openaiInstance;

export const CHAT_MODEL = process.env.OPENAI_MODEL || "gpt-4";
export const EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";

// Helper to guard calls when openai is not configured
export function ensureOpenAI() {
  if (!openai) {
    throw new Error(
      "OpenAI is not configured. Set OPENAI_API_KEY in your environment (.env) to enable AI features."
    );
  }
}
