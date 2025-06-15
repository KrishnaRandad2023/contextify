import express, { Request, Response } from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("✅ Scraper backend is running.");
});

app.post("/extract", async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;
  console.log("📩 Received URL:", url);

  if (!url || !url.startsWith("http")) {
    res.status(400).json({ error: "❌ Invalid or unsupported chat link." });
    return;
  }

  try {
    const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // ✅ Buffer to allow dynamic content to fully render
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("🌐 Navigated to URL:", url);

    let chat = "";

    if (url.includes("chat.openai.com")) {
      // ✅ Wait for ChatGPT message blocks
      await page.waitForSelector('[data-message-author-role]', { timeout: 60000 });

      chat = await page.$$eval('[data-message-author-role]', (nodes) =>
        nodes.map((node) => {
          const role = node.getAttribute("data-message-author-role") || "user";
          const text = node.textContent?.trim() || "";
          return `${role.toUpperCase()}: ${text}`;
        }).join("\n\n")
      );
    } else {
      chat = "⚠️ Only ChatGPT share links are currently supported.";
    }

    await browser.close();
    res.json({ content: chat });

  } catch (err: any) {
    console.error("❌ Scraping failed:", err.message || err);
    res.status(500).json({ error: "❌ Failed to extract chat content." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper backend running on http://localhost:${PORT}`);
});
