"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"

interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral"
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

export default function HomePage() {
  const [review, setReview] = useState("")
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!review.trim()) return

      setLoading(true)
      setError("")
      setResult(null)

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ review: review.trim() }),
        })

        if (!response.ok) {
          throw new Error("Failed to analyze sentiment")
        }

        const data = await response.json()
        setResult(data)
      } catch (err) {
        setError("Failed to analyze sentiment. Please try again.")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    },
    [review],
  )

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with theater image */}
        <div className="relative h-64 bg-gradient-to-r from-red-900 via-red-800 to-red-900 overflow-hidden rounded-b-2xl md:rounded-b-none">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/theater-bg.webp')",
              backgroundBlendMode: "overlay",
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-white text-2xl font-bold">Sentiment Analyzer</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Sentiment Analysis Results</h2>

          {/* Sentiment and Confidence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-100 rounded-xl">
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-2">Sentiment</div>
                <div className="text-2xl font-bold text-gray-900 capitalize">{result.sentiment}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-100 rounded-xl">
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-2">Confidence</div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(result.confidence * 100)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Explanation */}
          <div className="mb-8">
            <p className="text-gray-700 text-center leading-relaxed">{result.explanation}</p>
          </div>

          {/* Word Analysis */}
          <div className="space-y-6">
            {/* Positive Words */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Positive Words</h3>
              <Card className="bg-gray-50 rounded-xl">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-2">Count</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">{result.wordCounts.positive}</div>
                  {result.positiveWords.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {result.positiveWords.slice(0, 10).join(", ")}
                      {result.positiveWords.length > 10 && "..."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Negative Words */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Negative Words</h3>
              <Card className="bg-gray-50 rounded-xl">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-2">Count</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">{result.wordCounts.negative}</div>
                  {result.negativeWords.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {result.negativeWords.slice(0, 10).join(", ")}
                      {result.negativeWords.length > 10 && "..."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Neutral Words */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Neutral Words</h3>
              <Card className="bg-gray-50 rounded-xl">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-2">Count</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">{result.wordCounts.neutral}</div>
                  <div className="text-sm text-gray-600">
                    Words that maintain narrative balance without emotional weight
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Analyze Another Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => {
                setReview("")
                setResult(null)
                setError("")
              }}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-xl font-medium"
            >
              Analyze Another Review
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500">
            © 2025 Sentiment Analyzer. Built with ❤️ by Dinkar Dubey.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-4">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Sentiment Analyzer</h1>

        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden rounded-2xl">
          <div className="relative h-64 md:h-80">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/images/theater-bg.webp')",
              }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Analyze Movie Reviews</h2>
              <p className="text-white/90 text-lg max-w-2xl">
                Enter your movie review below to get a sentiment analysis.
              </p>
            </div>
          </div>
        </Card>

        {/* Input Form */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Textarea
                  placeholder="Enter your movie review here..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[200px] md:min-h-[300px] resize-none text-base border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 rounded-xl"
                  disabled={loading}
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <Button
                type="submit"
                disabled={!review.trim() || loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 text-lg font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Footer */}
        <div className="mt-16 mb-8 text-center text-sm text-gray-500">
          © 2025 Sentiment Analyzer. Built with ❤️ by Dinkar Dubey.
        </div>
      </div>
    </div>
  )
}
