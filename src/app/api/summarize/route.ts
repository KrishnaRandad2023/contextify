import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { chatText, summaryType } = await req.json();

    if (!chatText || !summaryType) {
      return NextResponse.json({ summary: "❌ Missing chat text or summary type." }, { status: 400 });
    }

    let formatInstruction = '';

    switch (summaryType) {
      case 'brief':
        formatInstruction = 'Summarize the conversation briefly in 2-3 lines.';
        break;
      case 'detailed':
        formatInstruction = 'Give a detailed summary covering all important points.';
        break;
      case 'bullets':
        formatInstruction = 'Summarize the conversation using concise bullet points.';
        break;
      case 'json':
        formatInstruction = `Analyze the chat and return structured JSON summary.

Instructions:
1. Infer the context (e.g. coding, health, business).
2. Generate appropriate keys.
3. Respond with only valid JSON (no explanation).

Example:
{
  "mainIdea": "",
  "supportingPoints": [],
  "actionItems": []
}`;
        break;
      default:
        formatInstruction = 'Provide a short and useful summary.';
    }

    // 🧠 TRUNCATE chatText if too long (gpt-3.5 supports 16k tokens ~ approx 50k chars max)
    const MAX_CHARS = 15000;
    const trimmedChat = chatText.length > MAX_CHARS
      ? chatText.slice(0, MAX_CHARS) + '\n\n⚠️ Note: input truncated due to token limit.'
      : chatText;

    const prompt = `You are an intelligent assistant. ${formatInstruction}\n\nChat:\n${trimmedChat}`;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ summary: "❌ Server error: API key missing." }, { status: 500 });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok || !data.choices?.[0]?.message?.content) {
      console.error("OpenAI API Error:", data);
      return NextResponse.json({ summary: "❌ Failed to generate summary from OpenAI." }, { status: 500 });
    }

    const summary = data.choices[0].message.content.trim();
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("❌ summarize error:", err);
    return NextResponse.json({ summary: "❌ Internal error while summarizing." }, { status: 500 });
  }
}
