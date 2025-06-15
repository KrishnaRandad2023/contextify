"use client";
import { useState } from "react";

export default function Home() {
  const [chatText, setChatText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryType, setSummaryType] = useState("brief");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    alert("Copied to clipboard!");
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
  };

  const handleDownloadJson = () => {
    try {
      const json = JSON.parse(summary);
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "summary.json";
      a.click();
    } catch (_err) {
      alert("Invalid JSON. Cannot download.");
    }
  };

  //   async function extractChatFromURL(url: string): Promise<string> {
  //   const html = await fetch(url).then(res => res.text());

  //   if (url.includes('chat.openai.com')) {
  //     // ChatGPT
  //     const pattern = /"text":"(.*?)"/g;
  //     const matches = [...html.matchAll(pattern)];
  //     const messages = matches.map(m => m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
  //     return messages.join('\n\n');
  //   } else if (url.includes('poe.com')) {
  //     // Poe
  //     const pattern = /"text":"(.*?)"/g;
  //     const matches = [...html.matchAll(pattern)];
  //     const messages = matches.map(m => m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
  //     return messages.join('\n\n');
  //   } else if (url.includes('claude.ai')) {
  //     // Claude (Anthropic)
  //     const pattern = /"text":"(.*?)"/g;
  //     const matches = [...html.matchAll(pattern)];
  //     const messages = matches.map(m => m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
  //     return messages.join('\n\n');
  //   } else if (url.includes('gemini.google.com')) {
  //     // Gemini: Google formats text in <script> tags
  //     const textOnly = html
  //       .split('<script')
  //       .filter(script => script.includes('conversation'))
  //       .map(script => script.replace(/\\n/g, '\n').replace(/\\"/g, '"'))
  //       .join('\n\n');
  //     return textOnly || 'No readable chat found in Gemini.';
  //   } else {
  //     return '⚠️ This platform is not yet supported. Please paste plain text.';
  //   }
  // }

  const handleSubmit = async () => {
  if (!chatText.trim()) return;

  setLoading(true);
  setSummary("");

  const isUrl = chatText.startsWith("http");
  let finalChatText = chatText;

  if (isUrl) {
    try {
      const scrapeRes = await fetch("https://contextify-backend.onrender.com/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: chatText }),
      });

      const scrapeData = await scrapeRes.json();

      if (scrapeData.content) {
        finalChatText = scrapeData.content;
        setChatText(scrapeData.content);
      } else {
        throw new Error("No content extracted");
      }
    } catch (_error) {
      setSummary("❌ Failed to extract chat from URL. Please check the link.");
      setLoading(false);
      return;
    }
  }

  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatText: finalChatText,
        summaryType: summaryType,
      }),
    });

    const data = await response.json();
    setSummary(data.summary);
  } catch (error) {
    setSummary("❌ Failed to generate summary. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">
          \ud83e\udde0 Contextify
        </h1>
        <p className="text-center text-gray-400">
          Extract reusable context from your AI chat conversations (ChatGPT,
          Claude, Poe, etc.)
        </p>

        <textarea
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          placeholder="Paste your chat link or full text here..."
          className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Summary Type
          </label>
          <select
            value={summaryType}
            onChange={(e) => setSummaryType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded-lg focus:outline-none"
          >
            <option value="brief">Brief</option>
            <option value="detailed">Detailed</option>
            <option value="bullets">Bullet Points</option>
            <option value="json">JSON (Memory Format)</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Summarizing..." : "Generate Context Summary"}
        </button>

        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-sm whitespace-pre-wrap">
          <p className="text-gray-400 mb-2">\ud83d\udcdd Your Summary:</p>
          <div className="text-white">{summary || "No summary yet."}</div>

          {summary && (
            <div className="flex gap-4 mt-4 justify-center">
              <button
                onClick={handleCopy}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm text-white"
              >
                \ud83d\udccb Copy
              </button>

              <button
                onClick={handleDownloadTxt}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm text-white"
              >
                \ud83d\udcc4 Download TXT
              </button>

              {summaryType === "json" && (
                <button
                  onClick={handleDownloadJson}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm text-white"
                >
                  \ud83e\uddfe Download JSON
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500">
        <hr className="border-gray-800 my-6" />
        <p>
          Made by <strong>Krishna Randad</strong> – Developer at Quick Add
          Advertising Agency
        </p>
        <p>
          \ud83d\udce7{" "}
          <a
            href="mailto:krishnaengg.work2022@gmail.com"
            className="hover:underline"
          >
            krishnaengg.work2022@gmail.com
          </a>{" "}
          | \ud83d\udcde{" "}
          <a href="tel:+919422860229" className="hover:underline">
            +91-9422860229
          </a>{" "}
          | \ud83c\udf10{" "}
          <a
            href="https://krishnarandad.vercel.app"
            target="_blank"
            className="hover:underline"
          >
            krishnarandad.vercel.app
          </a>
        </p>
      </footer>
    </main>
  );
}
