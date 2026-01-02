"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, Target, TrendingUp } from "lucide-react"

interface RecommendationsProps {
  report: any
}

export default function Recommendations({ report }: RecommendationsProps) {
  if (!report) return null

  const brandMentions: Record<string, number> = {}
  report.results?.forEach((result: any) => {
    result.mentions?.forEach((mention: any) => {
      brandMentions[mention.brand] = (brandMentions[mention.brand] || 0) + 1
    })
  })

  const recommendations = []

  // Low visibility recommendation
  if (report.visibilityScore < 30) { 
    recommendations.push({
      icon: AlertCircle,
      title: "Increase Content Marketing",
      description:
        "Your brand has low AI visibility. Invest in content that positions your product as an industry solution.",
      color: "text-amber-600",
    })
  }

  // High competition recommendation
  if (Object.keys(brandMentions).length > 3) {
    recommendations.push({
      icon: Target,
      title: "Niche Down Your Strategy",
      description: "High competitive density detected. Consider focusing on specific use cases where you excel.",
      color: "text-blue-600",
    })
  }

  // Growth opportunity
  if (report.visibilityScore > 50 && report.visibilityScore < 80) {
    recommendations.push({
      icon: TrendingUp,
      title: "Capitalize on Momentum",
      description:
        "You're gaining traction in AI responses. Amplify this through strategic partnerships and thought leadership.",
      color: "text-emerald-600",
    })
  }

  return (
    <Card className="p-6 border-border/50">
      <h2 className="text-xl font-bold mb-4">Strategic Recommendations</h2>
      <div className="space-y-4">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon
          return (
            <div key={idx} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <Icon className={`w-5 h-5 ${rec.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="font-semibold text-sm">{rec.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
