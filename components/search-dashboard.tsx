"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Zap, BookOpen } from "lucide-react"

interface SearchDashboardProps {
  onSearch: (category: string, brands: string[]) => Promise<void>
  isLoading: boolean
}

export default function SearchDashboard({ onSearch, isLoading }: SearchDashboardProps) {
  const [category, setCategory] = useState("")
  const [brandInput, setBrandInput] = useState("")
  const [brands, setBrands] = useState<string[]>([])
  const [showMethodology, setShowMethodology] = useState(false)

  const addBrand = () => {
    if (brandInput.trim() && !brands.includes(brandInput.trim())) {
      setBrands([...brands, brandInput.trim()])
      setBrandInput("")
    }
  }

  const removeBrand = (brand: string) => {
    setBrands(brands.filter((b) => b !== brand))
  }

  const handleSearch = async () => {
    if (category.trim() && brands.length > 0) {
      await onSearch(category, brands)
    }
  }

  const isValidForm = category.trim() && brands.length > 0 && !isLoading

  return (
    <div className="grid gap-6">
      {/* Main Form Card */}
      <Card className="p-8 border-2 border-border/50 bg-gradient-to-br from-card to-card/50">
        <div className="space-y-6">
          {/* Category Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Product Category</label>
            <Input
              placeholder="e.g., CRM software, project management, AI tools"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="h-11 border-border/50 focus:border-primary bg-background/50"
            />
            <p className="text-xs text-muted-foreground">The product/service category you want to analyze</p>
          </div>

          {/* Brand Input Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Brands to Track</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter brand name"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addBrand()}
                disabled={isLoading}
                className="h-11 border-border/50 focus:border-primary bg-background/50"
              />
              <Button
                onClick={addBrand}
                disabled={!brandInput.trim() || isLoading}
                variant="outline"
                size="lg"
                className="gap-2 border-border/50 bg-transparent"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>

            {/* Brand Badges */}
            {brands.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {brands.map((brand) => (
                  <Badge
                    key={brand}
                    variant="secondary"
                    className="gap-2 px-3 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {brand}
                    <button
                      onClick={() => removeBrand(brand)}
                      className="hover:text-primary/70 transition-colors ml-1"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleSearch}
            disabled={!isValidForm}
            size="lg"
            className="w-full h-12 gap-2 font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Analyze AI Visibility
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Info Box with Methodology Toggle */}
      <Card className="p-6 bg-accent/5 border-accent/20">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-xl">⚡</span> How it Works
              </h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>We generate 5 diverse prompts for your category</li>
                <li>Query Google Gemini AI with each unique prompt</li>
                <li>Extract and analyze brand mentions from responses</li>
                <li>Calculate visibility scores and citation distribution</li>
              </ol>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMethodology(!showMethodology)}
              className="gap-2 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Methodology</span>
              <span className="sm:hidden">Info</span>
            </Button>
          </div>

          {/* Methodology Details */}
          {showMethodology && (
            <div className="pt-4 border-t border-accent/30 space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Measurement Methodology</h4>
                <p className="text-xs text-muted-foreground">
                  Our analysis tracks how frequently your brand appears in AI-generated responses. This metric is
                  crucial for understanding your brand's visibility in the era of AI-driven content discovery.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Key Metrics</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <strong>Visibility Score:</strong> Percentage of brands mentioned across all prompts
                  </li>
                  <li>
                    <strong>Citation Share:</strong> Relative mention frequency vs competitors
                  </li>
                  <li>
                    <strong>Prompt Coverage:</strong> How many AI responses mentioned your brand
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
