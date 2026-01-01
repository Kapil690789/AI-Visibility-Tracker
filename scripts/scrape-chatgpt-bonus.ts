/**
 * AI VISIBILITY TRACKER - Playwright Bonus Challenge
 *
 * This script demonstrates ChatGPT UI crawling using Playwright.
 * Run locally with: npx ts-node scripts/scrape-chatgpt-bonus.ts
 *
 * NOTE: This is a proof-of-concept showing how UI automation could work.
 * For production, use the Gemini API approach in app/api/analyze/route.ts
 *
 * Why Gemini API instead of ChatGPT scraping?
 * 1. ChatGPT has anti-bot measures (Cloudflare, rate limits)
 * 2. Browser automation is expensive on serverless platforms
 * 3. Gemini API is cheaper, faster, and more reliable
 * 4. We still show this script to demonstrate understanding of web automation
 */

import { chromium } from "playwright"

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

async function scrapeChatGPT(prompts: string[], brands: string[]): Promise<ScrapingResult[]> {
  const browser = await chromium.launch({
    headless: true,
  })

  const results: ScrapingResult[] = []

  try {
    const page = await browser.newPage()

    // Navigate to ChatGPT
    console.log("Navigating to ChatGPT...")
    await page.goto("https://chat.openai.com", {
      waitUntil: "networkidle",
      timeout: 30000,
    })

    // Handle authentication if needed
    const loginButton = await page.$('[data-testid="login-button"]')
    if (loginButton) {
      console.log("⚠️  Manual login required. Please log in to ChatGPT and restart the script.")
      await page.pause()
    }

    // Process each prompt
    for (const prompt of prompts) {
      console.log(`\n🔍 Processing prompt: "${prompt}"`)

      // Find and click the input field
      const inputSelector = '[id="prompt-textarea"]'
      await page.click(inputSelector)
      await page.fill(inputSelector, prompt)

      // Submit the prompt
      const submitButton = await page.$('button[data-testid="send-button"]')
      if (submitButton) {
        await submitButton.click()
      } else {
        // Fallback: press Enter
        await page.press(inputSelector, "Enter")
      }

      // Wait for response
      console.log("⏳ Waiting for response...")
      await page.waitForSelector('[data-testid="message-response-end"]', {
        timeout: 60000,
      })

      // Extract response text
      const responseText = await page.textContent('[data-testid="message-response-end"]')

      if (!responseText) {
        console.log("⚠️  Could not extract response text")
        continue
      }

      // Analyze mentions
      const mentions = analyzeMentions(responseText, brands)

      results.push({
        prompt,
        response: responseText.substring(0, 500),
        mentions,
        timestamp: new Date(),
      })

      console.log(`✅ Found ${mentions.length} brand mentions`)

      // Small delay between prompts
      await page.waitForTimeout(2000)
    }
  } catch (error) {
    console.error("Scraping error:", error)
  } finally {
    await browser.close()
  }

  return results
}

function analyzeMentions(text: string, brands: string[]): BrandMention[] {
  const mentions: BrandMention[] = []

  brands.forEach((brand) => {
    const regex = new RegExp(brand, "gi")
    let match

    while ((match = regex.exec(text)) !== null) {
      const position = match.index
      const start = Math.max(0, position - 30)
      const end = Math.min(text.length, position + brand.length + 30)
      const context = text.substring(start, end).trim()

      mentions.push({
        brand,
        context,
        position,
      })
    }
  })

  return mentions.sort((a, b) => a.position - b.position)
}

// Main execution
async function main() {
  console.log("🚀 AI Visibility Tracker - ChatGPT Scraper (Bonus)")
  console.log("=".repeat(50))

  // Example: CRM category
  const prompts = [
    "What are the best CRM solutions for small businesses in 2024?",
    "Which CRM has the best customer support?",
    "Compare Salesforce, HubSpot, and Pipedrive",
    "What CRM would you recommend for a startup?",
    "Which CRM integrates best with Slack?",
  ]

  const brands = ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Freshworks"]

  try {
    const results = await scrapeChatGPT(prompts, brands)

    console.log("\n" + "=".repeat(50))
    console.log("📊 RESULTS")
    console.log("=".repeat(50))

    results.forEach((result, idx) => {
      console.log(`\nPrompt ${idx + 1}: "${result.prompt}"`)
      console.log(`Mentions found: ${result.mentions.length}`)
      result.mentions.forEach((mention) => {
        console.log(`  • ${mention.brand}: "${mention.context}"`)
      })
    })

    // Calculate metrics
    const totalMentions = results.reduce((sum, r) => sum + r.mentions.length, 0)
    const brandCounts = new Map<string, number>()

    results.forEach((result) => {
      result.mentions.forEach((mention) => {
        brandCounts.set(mention.brand, (brandCounts.get(mention.brand) || 0) + 1)
      })
    })

    console.log("\n" + "=".repeat(50))
    console.log("📈 CITATION SHARE")
    console.log("=".repeat(50))

    Array.from(brandCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([brand, count], idx) => {
        const percentage = Math.round((count / results.length) * 100)
        console.log(`${idx + 1}. ${brand}: ${count} mentions (${percentage}% visibility)`)
      })
  } catch (error) {
    console.error("Fatal error:", error)
    process.exit(1)
  }
}

main()
