import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export interface AIJudgment {
  headline: string;
  payout: number;
  heat: number;
  verdict: string;
  rating: "BORING" | "CLICKBAIT" | "VIRAL MASTERPIECE" | "DANGEROUS SCANDAL";
  producerQuote: string;
}

export const evaluateHeadlineServerFn = createServerFn({ method: "POST" })
  .validator((data: { who: string; action: string; target: string; baseRisk: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const headline = `${data.who} ${data.action} ${data.target}`;

    if (!apiKey) {
      return getHeuristicJudgment(headline, data.baseRisk);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a ruthless, sensation-hungry, tabloid TV News Producer judging fabricated clickbait headlines made by an intern.
Headline to judge: "${headline}"
Base card risk level: ${data.baseRisk}

Evaluate how funny, absurd, viral, and sensational this fabricated headline is, and determine how much advertising cash ($200 to $1200) it generates and how much legal heat/lawsuit risk (5 to 40) it attracts.

Respond in JSON format:
{
  "payout": <integer between 200 and 1200>,
  "heat": <integer between 5 and 40>,
  "verdict": "<short punchy 3-6 word tabloid verdict, e.g. 'ABSOLUTE TABLOID GOLD!' or 'MILD CHUCKLE, BUT IT SELLS'>",
  "rating": "<one of: 'BORING' | 'CLICKBAIT' | 'VIRAL MASTERPIECE' | 'DANGEROUS SCANDAL'>",
  "producerQuote": "<one funny, snarky sentence from the TV News Producer reacting to this headline>"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 1.0,
        },
      });

      const parsed = JSON.parse(response.text ?? "{}");
      return {
        headline,
        payout: Math.max(150, Math.min(1500, Number(parsed.payout) || 450)),
        heat: Math.max(5, Math.min(50, Number(parsed.heat) || 18)),
        verdict: String(parsed.verdict || "BREAKING SENSATION!"),
        rating: (parsed.rating || "CLICKBAIT") as AIJudgment["rating"],
        producerQuote: String(parsed.producerQuote || "Get this on the teleprompter immediately!"),
      };
    } catch (err) {
      console.error("Gemini AI evaluation failed, using fallback:", err);
      return getHeuristicJudgment(headline, data.baseRisk);
    }
  });

function getHeuristicJudgment(headline: string, baseRisk: string): AIJudgment {
  const isWild =
    baseRisk === "extreme" ||
    headline.includes("Core") ||
    headline.includes("Alien") ||
    headline.includes("Submarine") ||
    headline.includes("Explodes") ||
    headline.includes("Moon");

  const payout = isWild
    ? Math.floor(700 + Math.random() * 400)
    : Math.floor(350 + Math.random() * 300);

  const heat = isWild ? 32 : 16;
  const quotes = [
    "Legal will have a stroke, but the ad revenue is through the roof!",
    "This will break Twitter. Roll the teleprompter right now!",
    "Sensational! Our sponsors are screaming and our viewership is soaring!",
    "Pure chaotic gold. You might actually survive this internship!",
  ];

  return {
    headline,
    payout,
    heat,
    verdict: isWild ? "VIRAL EXPLOSION!" : "CERTIFIED CLICKBAIT!",
    rating: isWild ? "VIRAL MASTERPIECE" : "CLICKBAIT",
    producerQuote: quotes[Math.floor(Math.random() * quotes.length)],
  };
}
