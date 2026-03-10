import { useState } from "react";
import api from "../api"; // adjust path to your axios instance

export default function AnalyzeProductPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await api.post("/api/analyze-product", { productUrl: url });
      const { productName, analysis: rawAnalysis } = res.data;

      // Try to parse score, red flags, verdict if formatted clearly
      // Example AI output format:
      // "Safety Score: 7.5\nRed Flags: Fragrance, Phthalates\nVerdict: Caution"
      const scoreMatch = rawAnalysis.match(/Safety Score[:\-]\s*(\d+(\.\d+)?)/i);
      const redFlagsMatch = rawAnalysis.match(/Red Flags[:\-]\s*(.*)/i);
      const verdictMatch = rawAnalysis.match(/Verdict[:\-]\s*(.*)/i);

      setAnalysis({
        productName,
        rawAnalysis,
        score: scoreMatch?.[1] || null,
        redFlags: redFlagsMatch?.[1] || null,
        verdict: verdictMatch?.[1] || null,
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        setError("AI is resting. Try again in 1 minute.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to analyze product. Make sure the URL is valid.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Analyze Product</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="url"
          placeholder="Enter Amazon product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>
      )}

      {analysis && (
        <div className="bg-gray-50 p-4 rounded border">
          <h2 className="text-xl font-semibold mb-2">{analysis.productName}</h2>

          {analysis.score && (
            <p>
              <strong>Safety Score:</strong> {analysis.score}/10
            </p>
          )}
          {analysis.redFlags && (
            <p>
              <strong>Red Flags:</strong> {analysis.redFlags}
            </p>
          )}
          {analysis.verdict && (
            <p>
              <strong>Verdict:</strong> {analysis.verdict}
            </p>
          )}

          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Full Report</summary>
            <pre className="whitespace-pre-wrap mt-1">{analysis.rawAnalysis}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
