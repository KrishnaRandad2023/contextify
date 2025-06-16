import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { chatText, summaryType } = await request.json();

    if (!chatText || chatText.trim() === '') {
      return NextResponse.json(
        { summary: '❌ No chat text provided.' },
        { status: 400 }
      );
    }

    let prompt = '';
    switch (summaryType) {
      case 'brief':
        prompt = `Summarize this chat conversation in 2–3 sentences:\n\n${chatText}`;
        break;
      case 'detailed':
        prompt = `Write a detailed summary of the following conversation:\n\n${chatText}`;
        break;
      case 'bullets':
        prompt = `Summarize this conversation as bullet points:\n\n${chatText}`;
        break;
      case 'json':
        prompt = `Extract the main points of this conversation into a structured JSON format with these keys:
{
  "mainIdea": "",
  "supportingPoints": [],
  "actionItems": []
}

Conversation:\n\n${chatText}`;
        break;
      default:
        prompt = `Summarize this conversation:\n\n${chatText}`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes conversations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    });

    const summary = response.choices[0]?.message?.content?.trim() || '⚠️ No summary generated.';
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('❌ Summarization error:', error.message);
    return NextResponse.json(
      { summary: '❌ Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
}
// This code defines a Next.js API route that summarizes chat conversations using OpenAI's GPT-3.5 Turbo model.
// It handles different summary types (brief, detailed, bullets, JSON) and returns the generated summary.   