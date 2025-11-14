'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
} from '@btrme/ui'
import {
  Search,
  Code2,
  TrendingUp,
  FileCode2,
  Layers,
  ShoppingBag,
  Users,
  Layout,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'

type Template = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  usageCount: number
  createdAt: string
}

const CATEGORIES = [
  { value: 'all', label: 'All Templates', icon: Layers },
  { value: 'components', label: 'Components', icon: Code2 },
  { value: 'ecommerce', label: 'E-Commerce', icon: ShoppingBag },
  { value: 'dashboards', label: 'Dashboards', icon: Layout },
  { value: 'landing-pages', label: 'Landing Pages', icon: FileCode2 },
  { value: 'forms', label: 'Forms & Inputs', icon: Users },
]

export default function TemplatesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  )

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.set('category', selectedCategory)

      const res = await fetch(`/api/templates?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch templates')

      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates

    const query = searchQuery.toLowerCase()
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [templates, searchQuery])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (searchQuery) params.set('search', searchQuery)
    router.push(`/templates?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Template Marketplace</h1>
              <p className="text-muted-foreground">
                Ready-to-use components and templates for your projects
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedCategory === category.value
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            )
          })}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTemplates.length === templates.length ? (
              <span>
                {templates.length} template{templates.length !== 1 ? 's' : ''} available
              </span>
            ) : (
              <span>
                {filteredTemplates.length} of {templates.length} template
                {templates.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <FileCode2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search or browse different categories'
                : 'No templates available in this category yet'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Link key={template.id} href={`/templates/${template.id}`}>
                <Card className="h-full transition-all hover:shadow-lg group">
                  {/* Preview Area */}
                  <div className="h-40 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center border-b relative overflow-hidden">
                    <Code2 className="h-16 w-16 text-primary/30 group-hover:scale-110 transition-transform" />
                    {template.usageCount > 50 && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline" className="flex-shrink-0 text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {template.usageCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {!loading && filteredTemplates.length > 0 && (
          <Card className="mt-12 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Can't find what you need?</h3>
              <p className="text-muted-foreground mb-6">
                Use our AI Studio to create custom components from scratch
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/studio">
                  <Button size="lg">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Open AI Studio
                  </Button>
                </Link>
                <Link href="/generate">
                  <Button size="lg" variant="outline">
                    Quick Generate
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
