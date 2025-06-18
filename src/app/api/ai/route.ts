import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, tone } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an assistant that responds in a ${tone.toLowerCase()} tone.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error(text);
      return NextResponse.json({ error: "API Error" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
