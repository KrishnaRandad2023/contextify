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
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for main content to load
    await page.waitForSelector("main", { timeout: 15000 });

    let chat = "";

    if (url.includes("chat.openai.com")) {
      try {
        const mainText = await page.$eval("main", (el) => el.innerText.trim());

        if (!mainText || mainText.length < 20) {
          throw new Error("Extracted text too short or missing.");
        }

        chat = mainText;
      } catch (err) {
        console.error("❌ Error scraping ChatGPT shared page:", err);
        chat = "⚠️ Could not extract content from the ChatGPT share link.";
      }
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
