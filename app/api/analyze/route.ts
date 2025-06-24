import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

/* ------------------------------------------------------------------ */
/* 1. Rule-based fallback helpers                                     */
/* ------------------------------------------------------------------ */
const POSITIVE_WORDS = [
  "amazing",
  "awesome",
  "brilliant",
  "excellent",
  "fantastic",
  "fun",
  "good",
  "great",
  "incredible",
  "love",
  "loved",
  "marvelous",
  "outstanding",
  "superb",
  "wonderful",
]

const NEGATIVE_WORDS = [
  "awful",
  "bad",
  "boring",
  "confusing",
  "disappointing",
  "dreadful",
  "hate",
  "hated",
  "horrible",
  "poor",
  "terrible",
  "trash",
  "worst",
]

type Sentiment = "positive" | "negative" | "neutral"

interface RuleBasedResult {
  sentiment: Sentiment
  confidence: number
  explanation: string
  positiveWords: string[]
  negativeWords: string[]
  wordCounts: {
    positive: number
    negative: number
    neutral: number
  }
}

function analyzeRuleBased(review: string): RuleBasedResult {
  const words = review
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)

  let pos = 0
  let neg = 0
  const posFound: string[] = []
  const negFound: string[] = []

  for (const w of words) {
    if (POSITIVE_WORDS.includes(w)) {
      pos++
      posFound.push(w)
    } else if (NEGATIVE_WORDS.includes(w)) {
      neg++
      negFound.push(w)
    }
  }

  let sentiment: Sentiment = "neutral"
  if (pos > neg) sentiment = "positive"
  else if (neg > pos) sentiment = "negative"

  const explanation =
    sentiment === "neutral"
      ? "The review contains a similar number of positive and negative words."
      : `The review contains more ${sentiment} words (${sentiment === "positive" ? pos : neg}) than ${
          sentiment === "positive" ? "negative" : "positive"
        } words (${sentiment === "positive" ? neg : pos}).`

  return {
    sentiment,
    confidence: 0.5, // heuristic
    explanation,
    positiveWords: posFound,
    negativeWords: negFound,
    wordCounts: {
      positive: pos,
      negative: neg,
      neutral: words.length - pos - neg,
    },
  }
}

/* ------------------------------------------------------------------ */
/* 2. AI-powered schema (unchanged)                                   */
/* ------------------------------------------------------------------ */
const sentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  positiveWords: z.array(z.string()),
  negativeWords: z.array(z.string()),
  wordCounts: z.object({
    positive: z.number(),
    negative: z.number(),
    neutral: z.number(),
  }),
})

/* ------------------------------------------------------------------ */
/* 3. POST handler                                                    */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    const { review } = await req.json()
    if (!review || typeof review !== "string") {
      return Response.json({ error: "Review text is required" }, { status: 400 })
    }

    const hasApiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY

    /* ------------ A. AI path (needs OPENAI_API_KEY) ---------------- */
    if (hasApiKey) {
      const { object } = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: sentimentSchema,
        prompt: `Analyze the sentiment of this movie review and provide detailed insights:

Review: "${review}"

Please analyze this review and provide:
1. Overall sentiment (positive, negative, or neutral)
2. Confidence score (0-1) based on how clear the sentiment is
3. A clear explanation of why this sentiment was determined
4. Lists of positive and negative words found in the review
5. Word counts for positive, negative, and neutral words

Consider context, sarcasm, and nuanced language. Remember that "not good" is negative, etc.`,
      })

      return Response.json(object)
    }

    /* ------------ B. Fallback path (no key) ------------------------ */
    const fallback = analyzeRuleBased(review)
    return Response.json(fallback)
  } catch (err) {
    console.error("Error analyzing sentiment:", err)
    return Response.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
