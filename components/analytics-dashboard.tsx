"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Eye, TrendingUp, Share2, Award } from "lucide-react"

interface AnalyticsDashboardProps {
  report: any
}

export default function AnalyticsDashboard({ report }: AnalyticsDashboardProps) {
  if (!report) return null

  // Calculate metrics
  const totalPrompts = report.results?.length || 0
  const brandMentions: Record<string, number> = {}
  const mentionDetails: Array<{ prompt: string; brand: string | null; context: string }> = []

  report.results?.forEach((result: any) => {
    result.mentions?.forEach((mention: any) => {
      brandMentions[mention.brand] = (brandMentions[mention.brand] || 0) + 1
      mentionDetails.push({
        prompt: result.prompt,
        brand: mention.brand,
        context: mention.context || "Mentioned",
      })
    })
  })

  const leaderboardData = Object.entries(brandMentions)
    .map(([brand, count]) => ({
      brand,
      mentions: count,
      visibility: Math.round((count / totalPrompts) * 100),
    }))
    .sort((a, b) => b.mentions - a.mentions)

  const brandColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visibility Score */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 dark:from-blue-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">AI Visibility Score</p>
              <p className="text-4xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                {report.visibilityScore?.toFixed(1) || "0"}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Overall brand visibility</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Prompts Tracked */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 dark:from-purple-950/30 border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Prompts Tracked</p>
              <p className="text-4xl font-bold mt-2 text-purple-600 dark:text-purple-400">{totalPrompts}</p>
              <p className="text-xs text-muted-foreground mt-1">Diverse AI prompts analyzed</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Brands Competing */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Brands Competing</p>
              <p className="text-4xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
                {report.brands?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Brands in analysis</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <Share2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Citation Share Leaderboard */}
      {leaderboardData.length > 0 && (
        <Card className="p-6 border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Citation Share Leaderboard</h2>
              <p className="text-sm text-muted-foreground mt-1">Brand mentions across AI responses</p>
            </div>
            <Award className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-3">
            {leaderboardData.map((item, idx) => (
              <div
                key={item.brand}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/70 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.brand}</p>
                    <p className="text-xs text-muted-foreground">{item.mentions} mentions</p>
                  </div>
                </div>
                <Badge className="gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-0">
                  {item.visibility}% visible
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {leaderboardData.length > 0 && (
          <Card className="p-6 border-border/50">
            <h3 className="font-semibold text-lg mb-4">Brand Mentions Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaderboardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="brand" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Bar dataKey="mentions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Pie Chart */}
        {leaderboardData.length > 0 && (
          <Card className="p-6 border-border/50">
            <h3 className="font-semibold text-lg mb-4">Citation Share Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaderboardData}
                  dataKey="mentions"
                  nameKey="brand"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {leaderboardData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={brandColors[idx % brandColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Detailed Results */}
      <Card className="p-6 border-border/50">
        <h2 className="text-xl font-bold mb-4">Detailed AI Response Analysis</h2>
        <div className="space-y-4">
          {report.results?.map((result: any, idx: number) => (
            <div
              key={idx}
              className="border border-border/50 rounded-lg p-4 bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Prompt Analysis</p>
                  <p className="text-sm italic text-foreground mt-1">"{result.prompt}"</p>
                </div>
              </div>

              {result.mentions && result.mentions.length > 0 ? (
                <div className="space-y-2 ml-10">
                  {result.mentions.map((mention: any, midx: number) => (
                    <div
                      key={midx}
                      className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 p-2.5 rounded border-l-2 border-blue-500"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{mention.brand}</span>
                        {mention.context && <span className="text-xs text-muted-foreground">— {mention.context}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ml-10 text-sm text-muted-foreground italic">No brands mentioned in this response</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
