export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY is missing. Add it in Vercel → Project Settings → Environment Variables, then redeploy." });
  try {
    const { query, language = "Hindi" } = req.body || {};
    if (typeof query !== "string" || query.trim().length < 4) return res.status(400).json({ error: "Enter a headline or story first." });
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_RESEARCH_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini",
        tools: [{ type: "web_search_preview" }],
        instructions: "Research the story using web search. Prefer official statements and reputable news organizations. Clearly separate confirmed facts from allegations or uncertainty. Never invent sources. Return valid JSON only with keys summary (string) and sources (array of objects with title and url). Include only URLs actually returned by web search.",
        input: "Research this story in " + language + ": " + query + ". Give a concise fact-check-oriented summary and source links. If evidence is weak or contradictory, say so."
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Research request failed." });
    const text = (data.output || []).flatMap(x => x.content || []).find(x => x.type === "output_text")?.text;
    if (!text) return res.status(502).json({ error: "Research returned no text. Please retry." });
    const parsed = JSON.parse(text);
    return res.status(200).json({ summary: parsed.summary || "", sources: Array.isArray(parsed.sources) ? parsed.sources.filter(s => typeof s.url === "string" && /^https?:\/\//.test(s.url)) : [] });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Research failed." });
  }
}