import { openai, EMBED_MODEL, ensureOpenAI } from "./openaiClient.js";

export async function embedText(text) {
  const input = (text || "").trim();
  if (!input) return null;

  ensureOpenAI();

  const res = await openai.embeddings.create({
    model: EMBED_MODEL,
    input,
  });

  return res.data?.[0]?.embedding || null;
}
