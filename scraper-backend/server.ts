import express, { Request, Response } from "express";
import cors from "cors";
import { chromium } from "playwright"; // ✅ Using Playwright

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Scraper backend is running.");
});

// ✅ Chat extraction endpoint
app.post("/extract", async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;

  console.log("📩 Received URL:", url);

  // ❌ Basic validation
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    res.status(400).json({ error: "❌ Invalid or unsupported chat link." });
    return;
  }

  // ✅ Allow only valid ChatGPT share links
  const isValidChatGPTLink =
    url.includes("chat.openai.com/share/") || url.includes("chatgpt.com/share/");

  if (!isValidChatGPTLink) {
    res.status(400).json({
      content: "⚠️ Only ChatGPT share links are currently supported.",
    });
    return;
  }

  try {
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'], // ✅ This is the fix
});
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    console.log("⏳ Waiting for <main> selector...");
    await page.waitForSelector("main", { timeout: 15000 });

    const chatContent = await page.$eval("main", (el) => el.textContent?.trim() || "");
    await browser.close();

    if (!chatContent || chatContent.length < 30) {
      console.error("❌ Extracted content too short or empty.");
      res.status(500).json({
        error: "❌ Failed to extract meaningful chat content.",
      });
      return;
    }

    console.log("✅ Chat content extracted successfully.");
    res.json({ content: chatContent });
  } catch (err: any) {
    console.error("❌ Scraping failed:", err.message || err);
    res.status(500).json({
      error: "❌ Failed to extract chat content.",
    });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Scraper backend running on http://localhost:${PORT}`);
});
