import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const { prompt, tone, chat_id } = await req.json();

  if (!prompt)
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });

  const supabase = createServerActionClient({ cookies: () => cookies() });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create chat if needed
  let chatId = chat_id;
  if (!chatId) {
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id })
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    chatId = data.id;
  }

  // AI call
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
    const error = await response.text();
    console.error(error);
    return NextResponse.json({ error: "OpenAI Error" }, { status: 500 });
  }

  const data = await response.json();
  const aiReply = data.choices[0].message.content;

  // Save both user & AI messages
  const { error: messageError } = await supabase.from("messages").insert([
    { chat_id: chatId, role: "user", content: prompt },
    { chat_id: chatId, role: "assistant", content: aiReply },
  ]);

  if (messageError) {
    console.error(messageError.message);
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  return NextResponse.json({ result: aiReply, chat_id: chatId });
}
