import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod"; // Proper validation for production

const MODEL_NAME = "gemini-2.5-flash"; 
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Input validation schema
const RequestSchema = z.object({
  category: z.string().min(1),
  brands: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result_val = RequestSchema.safeParse(body);
    
    if (!result_val.success) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const { category, brands } = result_val.data;
    const model = client.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: "You are a professional market researcher. Always return data in strict JSON format without markdown backticks."
    });

    // BATCH PROMPT: Advanced Engineering to ensure brand mention accuracy
    const batchPrompt = `
      For the product category "${category}", perform a 5-prompt analysis.
      1. Generate 5 unique user queries (e.g., "Best ${category} for beginners?").
      2. Provide a 60-word natural response for each.
      3. Track if these specific brands are mentioned: [${brands.join(", ")}].
      
      OUTPUT FORMAT (Strict JSON Array):
      [
        {
          "prompt": "query text",
          "response": "detailed response",
          "mentions": [{"brand": "BrandName", "context": "why it was chosen"}]
        }
      ]
    `;

    const aiResult = await model.generateContent(batchPrompt);
    const responseText = aiResult.response.text().trim();
    
    // Production-ready JSON cleaning
    const cleanJson = responseText.replace(/```json|```/g, "");
    const analysisResults = JSON.parse(cleanJson);

    // Visibility Score: (Brands mentioned / Total brands tracked) * 100
    const uniqueMentioned = new Set(
      analysisResults.flatMap((r: any) => r.mentions.map((m: any) => m.brand))
    );
    const visibilityScore = (uniqueMentioned.size / brands.length) * 100;

    // Database Persistence
    const report = await prisma.report.create({
      data: {
        category,
        brands,
        results: analysisResults as any,
        visibilityScore,
      },
    });

    return NextResponse.json(report);

  } catch (error: any) {
    console.error("Selection-critical Error:", error);
    const status = error.message.includes("429") ? 429 : 500;
    return NextResponse.json({ 
      error: error.message.includes("429") ? "API Quota exceeded. Please try later." : "Internal Server Error" 
    }, { status });
  }
}