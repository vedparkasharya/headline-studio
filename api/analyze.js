export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY is missing. Add it in Vercel → Project Settings → Environment Variables, then redeploy." });
  try {
    const { image, language = "Hindi" } = req.body || {};
    if (typeof image !== "string" || !image.startsWith("data:image/")) return res.status(400).json({ error: "Upload a valid image screenshot." });
    if (image.length > 12_000_000) return res.status(413).json({ error: "Image is too large. Please use an image under about 9 MB." });
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions: "You are a careful bilingual newsroom editor. Read the provided screenshot. Do not invent facts, names, dates, quotes, or context. If something is unclear, say so in claims_to_verify. Produce a short natural two-line overlay headline, plus a useful caption and description. Keep the headline concise, avoid unsupported sensational claims, and return only valid JSON.",
        input: [{ role: "user", content: [
          { type: "input_text", text: "Language preference: " + language + ". Analyse this news/social post screenshot. Return JSON with keys headline1, headline2, caption, description, hashtags (array of 5-10 strings), claims_to_verify (string). If text is unreadable, mention uncertainty." },
          { type: "input_image", image_url: image, detail: "high" }
        ]}],
        text: { format: { type: "json_object" } }
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "OpenAI request failed." });
    const text = (data.output || []).flatMap(x => x.content || []).find(x => x.type === "output_text")?.text;
    if (!text) return res.status(502).json({ error: "The AI returned no text. Please retry." });
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ error: e.message || "Analysis failed." });
  }
}