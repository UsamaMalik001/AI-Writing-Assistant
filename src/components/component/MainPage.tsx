"use client";

import { useState, useRef, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ReactTextareaAutosize from "react-textarea-autosize";
import {
  Sparkles,
  Send,
  History,
  Trash2,
  Copy,
  MessageSquare,
  Zap,
  Brain,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

const samplePrompts = [
  {
    text: "Write a professional email to a client apologizing for a delay.",
    icon: "\uD83D\uDCE7",
    category: "Business",
  },
  {
    text: "Summarize this paragraph in 2 sentences.",
    icon: "\uD83D\uDCDD",
    category: "Writing",
  },
  {
    text: "Rewrite this text to sound more friendly and casual.",
    icon: "\uD83D\uDE0A",
    category: "Tone",
  },
  {
    text: "Give me 5 blog ideas on remote work productivity.",
    icon: "\uD83D\uDCA1",
    category: "Ideas",
  },
];

const toneOptions = [
  {
    value: "Formal",
    icon: "\uD83C\uDFA9",
    description: "Professional and structured",
  },
  {
    value: "Casual",
    icon: "\uD83D\uDE0E",
    description: "Relaxed and friendly",
  },
  {
    value: "Technical",
    icon: "\uD83D\uDD27",
    description: "Precise and detailed",
  },
  {
    value: "Persuasive",
    icon: "\uD83C\uDFAF",
    description: "Compelling and convincing",
  },
];

export default function MainPage() {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const supabase = createClientComponentClient();

  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("Formal");
  const [chatId, setChatId] = useState(null);
  const [history, setHistory] = useState<{ prompt: string; result: string }[]>(
    []
  );

  const fetchHistory = async () => {
    if (!chatId) return;
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (messages) {
      const pairs: { prompt: string; result: string }[] = [];

      for (let i = 0; i < messages.length; i += 2) {
        if (messages[i] && messages[i + 1]) {
          pairs.push({
            prompt: messages[i].content,
            result: messages[i + 1].content,
          });
        }
      }
      setHistory(pairs);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [chatId]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tone, chat_id: chatId }),
      });

      const data = await res.json();
      setResult(data.result);
      setChatId(data.chat_id);
      setHistory((prev) => [...prev, { prompt, result: data.result }]);
    } catch (err) {
      console.error(err);
      setResult("\u26A0\uFE0F Failed to get response from AI");
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", {
      description: "The response has been copied to your clipboard.",
      icon: <Copy className="w-4 h-4" />,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Assistant
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Transform your ideas with the power of AI
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sample Prompts */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Quick Start Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {samplePrompts.map((sample, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPrompt(sample.text);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="group p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white/50 hover:bg-white/80"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{sample.icon}</span>
                        <div className="flex-1 min-w-0">
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {sample.category}
                          </Badge>
                          <p className="text-sm text-gray-700 group-hover:text-gray-900 line-clamp-2">
                            {sample.text}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Input */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Your Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <ReactTextareaAutosize
                    ref={inputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you need help with..."
                    className="w-full border-2 border-gray-200 focus:border-blue-400 p-4 rounded-lg resize-none bg-white/80 placeholder:text-gray-400 transition-colors"
                    minRows={4}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {prompt.length} characters
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Response Tone
                    </label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-white border-2 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {toneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              <div>
                                <div className="font-medium">
                                  {option.value}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !prompt.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 h-auto"
                  >
                    {loading ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Response */}
            {(loading || result) && (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wand2 className="w-5 h-5 text-purple-500" />
                      AI Response
                    </CardTitle>
                    {result && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                      <Skeleton className="h-4 w-3/6" />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                        {result || "No response received."}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm sticky top-8">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="w-5 h-5 text-green-500" />
                    Chat History
                  </CardTitle>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistory([])}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      Your conversation history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto space-y-4">
                    {history
                      .slice()
                      .reverse()
                      .map((entry, index) => (
                        <div
                          key={index}
                          className="bg-white/80 rounded-lg p-4 border border-gray-100 hover:shadow-sm transition-shadow"
                        >
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-blue-600 mb-1">
                                PROMPT
                              </p>
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {entry.prompt}
                              </p>
                            </div>
                            <Separator />
                            <div>
                              <p className="text-xs font-medium text-purple-600 mb-1">
                                RESPONSE
                              </p>
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {entry.result}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(entry.result)}
                              className="w-full text-xs text-gray-500 hover:text-gray-700"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Response
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
