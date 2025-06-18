"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import ReactTextareaAutosize from "react-textarea-autosize";

const samplePrompts = [
  "Write a professional email to a client apologizing for a delay.",
  "Summarize this paragraph in 2 sentences.",
  "Rewrite this text to sound more friendly and casual.",
  "Give me 5 blog ideas on remote work productivity.",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("Formal");
  const [history, setHistory] = useState<{ prompt: string; result: string }[]>(
    []
  );

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, tone }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.result);
      setHistory((prev) => [...prev, { prompt, result: data.result }]);
    } catch (err) {
      setResult("⚠️ Failed to get response from AI");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6 px-4">
      {/* Sample Prompts */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Try a sample:</p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => setPrompt(p)}
              className="text-sm border border-muted rounded px-3 py-1 hover:bg-muted"
            >
              {p.slice(0, 40)}...
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <ReactTextareaAutosize
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your request here..."
        className="w-full border p-2 rounded resize-none"
        minRows={3}
      />

      {/* Tone Selector */}
      <div className="my-2">
        <label className="text-sm font-medium">Tone:</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="block mt-1 border px-3 py-2 rounded"
        >
          {["Formal", "Casual", "Technical", "Persuasive"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Thinking..." : "Submit"}
      </Button>

      {/* AI Result or Loading Skeleton */}
      {loading ? (
        <div className="space-y-2 mt-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : (
        result && (
          <Textarea
            value={result}
            readOnly
            rows={10}
            className="mt-4 w-full bg-muted/30 resize-none"
          />
        )
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <button
              className="text-sm text-red-500 underline"
              onClick={() => setHistory([])}
            >
              Clear History
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {history.map((entry, index) => (
              <div key={index} className="border p-4 rounded bg-muted/20">
                <p className="text-sm text-muted-foreground font-semibold">
                  Prompt:
                </p>
                <p>{entry.prompt}</p>
                <p className="text-sm text-muted-foreground font-semibold mt-2">
                  AI Response:
                </p>
                <p>{entry.result}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
