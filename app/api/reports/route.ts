import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reports)
}