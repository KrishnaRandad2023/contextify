import express, { Request, Response } from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/extract", async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;
  console.log("📩 Received body:", req.body);

  if (!url || !url.startsWith("http")) {
    res.status(400).json({ error: "❌ Invalid or unsupported chat link." });
    return;
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    let chat = "";

    if (url.includes("chat.openai.com")) {
      await page.waitForSelector('[data-message-author-role]', { timeout: 60000 });
      chat = await page.$$eval('[data-message-author-role]', (nodes) =>
        nodes.map((node) => {
          const role = node.getAttribute("data-message-author-role") || "user";
          const text = node.textContent?.trim() || "";
          return `${role.toUpperCase()}: ${text}`;
        }).join("\n\n")
      );

    } else if (url.includes("poe.com")) {
      await page.waitForSelector('[class*="Message"]', { timeout: 60000 });
      chat = await page.$$eval('[class*="Message"]', (nodes) =>
        nodes.map((node) => node.textContent?.trim() || "")
             .filter(Boolean)
             .join("\n\n")
      );

    } else if (url.includes("claude.ai")) {
      await page.waitForSelector('main [class*="Message"]', { timeout: 60000 });
      chat = await page.$$eval('main [class*="Message"]', (nodes) =>
        nodes.map((node) => node.textContent?.trim() || "")
             .filter(Boolean)
             .join("\n\n")
      );

    } else if (url.includes("gemini.google.com")) {
      await page.waitForSelector("cib-shared", { timeout: 60000 });
      const html = await page.content();
      chat = html.slice(0, 3000) + "\n\n⚠️ Google Gemini fallback – showing raw HTML.";

    } else {
      chat = "⚠️ Unsupported platform. Please paste plain text instead.";
    }

    await browser.close();
    res.json({ content: chat });

  } catch (err) {
    console.error("❌ Scraping failed:", err);
    res.status(500).json({ error: "❌ Failed to extract chat content." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper backend running on http://localhost:${PORT}`);
});
