"use client"

import { useEffect, useState } from "react"
import SearchDashboard from "@/components/search-dashboard"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, BarChart3, Search, Download } from "lucide-react"

export default function Home() {
  const [reports, setReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("search")

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch("/api/reports")
        if (res.ok) {
          const data = await res.json()
          setReports(data)
        }
      } catch (e) {
        console.error("History load failed", e)
      }
    }
    loadReports()
  }, [])

  const handleRunSearch = async (category: string, brands: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, brands }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze")
      }

      const data = await response.json()
      setReports([data, ...reports])
      setSelectedReport(data)
    } catch (error: any) {
      alert(error.message)
      console.error("Analysis error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistoryItemClick = (report: any) => {
    setSelectedReport(report)
    setActiveTab("analytics")
  }

  const handleExportPDF = async () => {
    if (!selectedReport) return
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedReport),
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${selectedReport.category.replace(/\s+/g, "-")}.pdf`
      a.click()
    } catch (error) {
      alert("Failed to export PDF")
    }
  }

  const handleExportCSV = () => {
    if (!selectedReport) return
    const csv = generateCSVContent(selectedReport)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${selectedReport.category.replace(/\s+/g, "-")}.csv`
    a.click()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header Section */}
      <div className="border-b border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  AI Visibility Tracker
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Enterprise-Grade AI Monitoring</p>
              </div>
            </div>
            {selectedReport && activeTab === "analytics" && (
              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card hover:bg-card/80 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card hover:bg-card/80 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            Discover how often your brand appears in AI-generated responses across multiple models
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-fit gap-2 bg-muted/50 p-1 border border-border/50">
            <TabsTrigger value="search" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">New Search</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analysis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <SearchDashboard onSearch={handleRunSearch} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {selectedReport ? (
              <AnalyticsDashboard report={selectedReport} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl">
                <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">No analysis yet</p>
                <p className="text-sm text-muted-foreground/70">Run a search to view detailed analytics</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Recent Reports History */}
        {reports.length > 0 && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">History</h2>
              <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full">
                {reports.length} report{reports.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-3">
              {reports.map((report, idx) => (
                <button
                  key={idx}
                  onClick={() => handleHistoryItemClick(report)}
                  className="group text-left p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-border hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {report.category}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {report.brands?.join(", ") || "No brands"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function generateCSVContent(report: any): string {
  let csv = "AI Visibility Tracker Report\n"
  csv += `Category,${report.category}\n`
  csv += `Date,${new Date(report.createdAt).toLocaleDateString()}\n`
  csv += `Visibility Score,${report.visibilityScore?.toFixed(1) || 0}%\n\n`

  csv += "Brand,Mentions,Visibility %\n"
  const brandMentions: Record<string, number> = {}
  report.results?.forEach((result: any) => {
    result.mentions?.forEach((mention: any) => {
      brandMentions[mention.brand] = (brandMentions[mention.brand] || 0) + 1
    })
  })

  Object.entries(brandMentions)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .forEach(([brand, count]) => {
      const visibility = Math.round(((count as number) / (report.results?.length || 1)) * 100)
      csv += `${brand},${count},${visibility}%\n`
    })

  return csv
}
