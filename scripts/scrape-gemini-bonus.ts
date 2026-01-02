/**
 * AI VISIBILITY TRACKER - Final Stable Gemini Crawler (Bonus)
 * Purpose: Reliable UI automation even without login.
 */

import { chromium } from "playwright"
import type { Page } from "playwright"

interface ScrapingResult {
  prompt: string;
  response: string;
  mentions: Array<{ brand: string; context: string }>;
}

// Logic to extract citations
function analyzeMentions(text: string, brands: string[]) {
  const mentions: Array<{ brand: string; context: string }> = []
  brands.forEach((brand) => {
    const regex = new RegExp(`\\b${brand}\\b`, "gi");
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - 40);
      const end = Math.min(text.length, match.index + brand.length + 40);
      const context = text.substring(start, end).trim().replace(/\n/g, " ");
      mentions.push({ brand, context: `...${context}...` });
    }
  });
  return mentions;
}

async function scrapeGemini(prompts: string[], brands: string[]) {
  // Headless: false ensures you see the browser
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results: ScrapingResult[] = [];

  try {
    console.log("🚀 Navigating to Gemini...");
    
    // Changed to 'domcontentloaded' to avoid hanging on slow network assets
    await page.goto("https://gemini.google.com/app", { 
      waitUntil: "domcontentloaded",
      timeout: 60000 
    });

    console.log("\n🛑 ACTION REQUIRED:");
    console.log("1. Check the browser window.");
    console.log("2. If you see 'Sign in', you can ignore it or close the popup.");
    console.log("3. Once the 'Ask Gemini' box is visible, click 'RESUME' in the Playwright Inspector window.");
    
    // This will open the Playwright Inspector with the Resume button
    await page.pause();

    for (const prompt of prompts) {
      console.log(`\n🔍 Sending Prompt: "${prompt}"`);
      
      const inputSelector = 'div[role="textbox"]';
      await page.waitForSelector(inputSelector, { state: 'visible' });
      await page.fill(inputSelector, prompt);
      await page.keyboard.press("Enter");

      console.log("⏳ Waiting for Gemini to finish response...");
      
      // We wait for the message content to appear and stabilize
      await page.waitForTimeout(10000); 

      const responseElements = await page.$$('.message-content');
      if (responseElements.length > 0) {
        const lastResponseText = await responseElements[responseElements.length - 1].innerText();
        const foundMentions = analyzeMentions(lastResponseText, brands);
        
        results.push({
          prompt,
          response: lastResponseText.substring(0, 500),
          mentions: foundMentions
        });
        console.log(`✅ Success: Found ${foundMentions.length} brand citations.`);
      }
    }
  } catch (err) {
    console.error("❌ Scraping failed:", err);
  } finally {
    await browser.close();
  }
  return results;
}

async function main() {
  console.log("====================================================");
  console.log("🏆 AI VISIBILITY TRACKER - GEMINI UI CRAWLER (BONUS)");
  console.log("====================================================");
  
  const prompts = [
    "Recommend the best CRM for a sales team of 50 people.",
    "Which is better for a startup: HubSpot, Zoho, or Salesforce?"
  ];
  const brands = ["Salesforce", "HubSpot", "Zoho", "Pipedrive"];

  const results = await scrapeGemini(prompts, brands);
  
  console.log("\n📊 FINAL CRAWLER REPORT");
  console.log("-".repeat(50));
  
  results.forEach((r, idx) => {
    console.log(`\nPrompt ${idx + 1}: ${r.prompt}`);
    if (r.mentions.length > 0) {
      r.mentions.forEach(m => console.log(`  - ${m.brand}: ${m.context}`));
    } else {
      console.log("  - No brands mentioned in this response.");
    }
  });
}

main();