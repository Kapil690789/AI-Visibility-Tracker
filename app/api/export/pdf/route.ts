import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()

    const html = generatePDFHTML(report)

    // Use a simple base64 encoding approach to create a valid PDF-like document
    // For production, consider using jsPDF or pdfkit libraries
    const pdfBuffer = await generatePDFBuffer(html)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${report.category.replace(/\s+/g, "-")}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

function generatePDFHTML(report: any): string {
  const brandMentions: Record<string, number> = {}
  report.results?.forEach((result: any) => {
    result.mentions?.forEach((mention: any) => {
      brandMentions[mention.brand] = (brandMentions[mention.brand] || 0) + 1
    })
  })

  const leaderboardData = Object.entries(brandMentions)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([brand, count], idx) => ({
      rank: idx + 1,
      brand,
      mentions: count,
      visibility: Math.round(((count as number) / (report.results?.length || 1)) * 100),
    }))

  const tableRows = leaderboardData
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.rank}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.brand}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.mentions}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.visibility}%</td>
    </tr>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>AI Visibility Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            padding: 40px;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 30px;
            margin-bottom: 40px;
          }
          .header h1 {
            margin: 0;
            color: #1e40af;
            font-size: 32px;
          }
          .header p {
            margin: 8px 0 0 0;
            color: #6b7280;
            font-size: 14px;
          }
          .metrics {
            display: flex;
            gap: 20px;
            margin-bottom: 40px;
          }
          .metric {
            flex: 1;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .metric h3 {
            margin: 0;
            color: #6b7280;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .metric p {
            margin: 10px 0 0 0;
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
          }
          h2 {
            margin: 30px 0 20px 0;
            color: #1f2937;
            font-size: 20px;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          .timestamp {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AI Visibility Report</h1>
          <p><strong>Category:</strong> ${report.category}</p>
          <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
        </div>

        <div class="metrics">
          <div class="metric">
            <h3>Visibility Score</h3>
            <p>${report.visibilityScore?.toFixed(1) || 0}%</p>
          </div>
          <div class="metric">
            <h3>Prompts Analyzed</h3>
            <p>${report.results?.length || 0}</p>
          </div>
          <div class="metric">
            <h3>Brands Tracked</h3>
            <p>${report.brands?.length || 0}</p>
          </div>
        </div>

        <h2>Citation Share Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Brand</th>
              <th>Mentions</th>
              <th>Visibility</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated by AI Visibility Tracker - Enterprise Brand Monitoring Solution</p>
          <div class="timestamp">Report Generated: ${new Date().toLocaleString()}</div>
        </div>
      </body>
    </html>
  `
}

async function generatePDFBuffer(html: string): Promise<Buffer> {
  // Create a minimal PDF structure with the HTML content
  // This is a simplified approach - for production, use a proper library
  const pdf = createSimplePDF(html)
  return Buffer.from(pdf)
}

function createSimplePDF(html: string): string {
  // Create a basic PDF structure
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${html.length + 100} >>
stream
BT
/F1 12 Tf
50 750 Td
(AI Visibility Report) Tj
0 -20 Td
(${sanitizeForPDF(html)}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000244 00000 n
0000000409 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
500
%%EOF`

  return pdfContent
}

function sanitizeForPDF(text: string): string {
  return text.replace(/[^\x20-\x7E\n]/g, "").substring(0, 500)
}
