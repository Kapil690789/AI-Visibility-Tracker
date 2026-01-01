# AI Visibility Tracker

A production-ready SaaS tool that helps brands understand their visibility in AI-generated answers (ChatGPT, Gemini, etc.).

## 🎯 What It Does

- **Input**: A product category and list of brands
- **Process**: Generates 5 diverse user-intent prompts, queries Gemini AI, analyzes responses
- **Output**: Dashboard showing:
  - AI Visibility Score (% of prompts where brand was mentioned)
  - Citation Share (leaderboard comparing brands)
  - Context Analysis (exact prompts and mentions)
  - Analytics charts

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Google Gemini API key ([get one here](https://makersuite.google.com/app/apikey))

### 2. Setup

```bash
# Install dependencies
npm install

# Add environment variables
# Create .env.local and add:
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### 3. Usage

1. Enter a **Category** (e.g., "CRM software")
2. Add **Brands** to track (e.g., Salesforce, HubSpot, Pipedrive)
3. Click "Analyze AI Visibility"
4. View results in the Analytics tab

## 📊 How It Works

### Step 1: Prompt Generation
- Takes user's category and generates 5 diverse, realistic prompts
- Example: "What's the best CRM for a startup?"

### Step 2: AI Querying
- Sends each prompt to Google Gemini 1.5 Flash
- Gets realistic, natural responses

### Step 3: Mention Extraction
- Analyzes responses for brand mentions
- Extracts context (where and how the brand was mentioned)
- Uses Gemini's JSON parsing for accuracy

### Step 4: Metrics Calculation
- **Visibility Score**: % of prompts where brand appeared
- **Citation Share**: Total mentions per brand
- **Leaderboard**: Rankings and competitive analysis

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Next.js 16 App Router           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Frontend (React Components)   │   │
│  │  - Search Dashboard             │   │
│  │  - Analytics Dashboard          │   │
│  │  - Charts & Leaderboards        │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │   API Route: /api/analyze       │   │
│  │  - Prompt generation            │   │
│  │  - Gemini querying              │   │
│  │  - Mention extraction           │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │   Google Gemini 1.5 Flash API   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Next.js 16, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Next.js API Routes |
| AI | Google Gemini 1.5 Flash (text generation + JSON parsing) |
| Charts | Recharts (bar, pie charts) |
| Icons | Lucide Icons |

## 💡 Key Design Decisions

### Why Gemini API over ChatGPT Web Scraping?

| Aspect | Gemini API | ChatGPT Scraping |
|--------|-----------|-----------------|
| Cost | $0.075 / 1M input tokens | Expensive (browser overhead) |
| Speed | 2-3s per prompt | 10-20s per prompt |
| Reliability | 99.9% uptime | Anti-bot measures |
| Deployment | Serverless ready | Requires browser (not serverless) |
| Production Ready | ✅ Yes | ❌ No |

**Bonus**: `scripts/scrape-chatgpt-bonus.ts` demonstrates Playwright automation for UI crawling (local-only).

### Why Gemini 1.5 Flash?

- **Fast**: 2-3x faster than Claude
- **Cheap**: $0.075 per 1M input tokens
- **Context**: 1M token window (can handle long analyses)
- **JSON Mode**: Native JSON output for accurate data extraction

### Why shadcn/ui + Tailwind?

- Unstyled components (full customization)
- Dark mode compatible (via CSS variables)
- Production-ready, accessible components
- Minimal bundle size

## 📈 Metrics Explained

### AI Visibility Score
```
Visibility Score = (Brands mentioned / Total brands tracked) × 100
```
If you're tracking 4 brands and 3 get mentioned, your score is 75%.

### Citation Share
```
Citation Share = (Brand mentions / Total mentions) × 100
```
Shows which brand dominates AI-generated answers in your category.

## 🎯 Future Improvements

- [ ] Supabase integration for persistent report history
- [ ] Email alerts when visibility changes
- [ ] Compare visibility trends over time
- [ ] Export reports as PDF
- [ ] Track competitor changes week-over-week
- [ ] AI-powered recommendations to improve visibility
- [ ] Multiple API integrations (Claude, Grok, Cohere)

## 📝 Development Notes

### Running Locally
```bash
npm run dev
# http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```env
# Required for Gemini integration
GEMINI_API_KEY=your_google_api_key

# Optional (for Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 🎬 Demo

1. Go to http://localhost:3000
2. Enter category: "CRM software"
3. Add brands: Salesforce, HubSpot, Pipedrive, Zoho
4. Click "Analyze AI Visibility"
5. Wait 15-30 seconds for results
6. View analytics in the Analytics tab

## 🤝 Contributing

Feel free to submit issues or PRs! This is a demo for the Writesonic engineering challenge.

## 📄 License

MIT - Open source and free to use.

---

**Built with ❤️ for Writesonic Engineering Challenge**
