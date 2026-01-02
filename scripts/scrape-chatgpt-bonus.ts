/**
 * AI VISIBILITY TRACKER - Playwright Bonus Challenge (Enhanced Version)
 * Purpose: Crawl ChatGPT Web UI to see exact answers and context.
 */

import { chromium } from "playwright"
import type { Page } from "playwright"
interface BrandMention {
  brand: string
  context: string
  position: number
}

interface ScrapingResult {
  prompt: string
  response: string
  mentions: BrandMention[]
  timestamp: Date
}

// Helper to analyze mentions in the extracted text
function analyzeMentions(text: string, brands: string[]): BrandMention[] {
  const mentions: BrandMention[] = []
  brands.forEach((brand) => {
    const regex = new RegExp(brand, "gi")
    let match
    while ((match = regex.exec(text)) !== null) {
      const position = match.index
      const start = Math.max(0, position - 40)
      const end = Math.min(text.length, position + brand.length + 40)
      const context = text.substring(start, end).trim()
      mentions.push({ brand, context: `...${context}...`, position })
    }
  })
  return mentions.sort((a, b) => a.position - b.position)
}

async function scrapeChatGPT(prompts: string[], brands: string[]): Promise<ScrapingResult[]> {
  // Launching in headed mode so you can solve Captcha/Cloudflare in the recording
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50 // Thoda slow chalega taaki recording mein natural lage
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  })

  const page = await context.newPage()
  const results: ScrapingResult[] = []

  try {
    console.log("🚀 Navigating to ChatGPT...")
    await page.goto("https://chat.openai.com", { waitUntil: "domcontentloaded" })

    // CLOUDFLARE/LOGIN HANDOVER
    console.log("\n🛑 ACTION REQUIRED:");
    console.log("1. Solve the 'Verify you are human' checkbox if it appears.");
    console.log("2. Log in to your ChatGPT account.");
    console.log("3. Once you see the new chat screen, come back to the Playwright Inspector and click 'RESUME'.\n");
    
    // This opens the Playwright Inspector. You must click the 'Play/Resume' button there after logging in.
    await page.pause() 

    for (const prompt of prompts) {
      console.log(`\n🔍 Sending Prompt: "${prompt}"`)
      
      const inputSelector = 'div[id="prompt-textarea"]'
      await page.waitForSelector(inputSelector)
      await page.fill(inputSelector, prompt)
      await page.press(inputSelector, "Enter")

      // Wait for AI to finish typing
      console.log("⏳ AI is thinking...")
      // ChatGPT specifically uses 'button[data-testid="stop-button"]' while generating
      await page.waitForSelector('button[data-testid="send-button"]', { timeout: 90000 })

      // Extract the last response
      const responses = await page.$$('[data-testid^="conversation-turn-"]')
      const lastResponse = responses[responses.length - 1]
      const responseText = await lastResponse.innerText()

      const mentions = analyzeMentions(responseText, brands)
      results.push({
        prompt,
        response: responseText.substring(0, 500),
        mentions,
        timestamp: new Date()
      })

      console.log(`✅ Analyzed: Found ${mentions.length} mentions.`)
      await page.waitForTimeout(3000) // Brief pause between queries
    }
  } catch (error) {
    console.error("❌ Scraping error:", error)
  } finally {
    await browser.close()
  }
  return results
}

async function main() {
  console.log("====================================================")
  console.log("🏆 AI VISIBILITY TRACKER - WEB UI CRAWLER (BONUS)")
  console.log("====================================================")

  const prompts = [
    "Which CRM is best for a 20-person startup focused on sales?",
    "Compare Salesforce and HubSpot for small businesses.",
    "I need a simple CRM to track leads, any recommendations?"
  ]
  const brands = ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Zendesk"]

  const results = await scrapeChatGPT(prompts, brands)

  console.log("\n📊 FINAL CITATION SHARE REPORT")
  console.log("-".repeat(30))
  
  const brandCounts: Record<string, number> = {}
  results.forEach(r => {
    r.mentions.forEach(m => {
      brandCounts[m.brand] = (brandCounts[m.brand] || 0) + 1
    })
  })

  Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([brand, count], idx) => {
      const visibility = Math.round((count / results.length) * 100)
      console.log(`${idx + 1}. ${brand}: ${count} citations (${visibility}% visibility)`)
    })
}

main()