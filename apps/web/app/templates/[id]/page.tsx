'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@btrme/ui'
import {
  ArrowLeft,
  Code2,
  Eye,
  Copy,
  Download,
  Check,
  Sparkles,
  TrendingUp,
  Calendar,
  Loader2,
} from 'lucide-react'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false }
)

const LiveProvider = dynamic(
  () => import('react-live').then((mod) => mod.LiveProvider),
  { ssr: false }
)
const LivePreview = dynamic(
  () => import('react-live').then((mod) => mod.LivePreview),
  { ssr: false }
)
const LiveError = dynamic(
  () => import('react-live').then((mod) => mod.LiveError),
  { ssr: false }
)

type Template = {
  id: string
  name: string
  description: string
  code: string
  category: string
  tags: string[]
  usageCount: number
  createdAt: string
  updatedAt: string
}

export default function TemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [using, setUsing] = useState(false)

  useEffect(() => {
    fetchTemplate()
  }, [params.id])

  const fetchTemplate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/templates/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch template')

      const data = await res.json()
      setTemplate(data)
    } catch (error) {
      console.error('Error fetching template:', error)
      router.push('/templates')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (template?.code) {
      await navigator.clipboard.writeText(template.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadCode = () => {
    if (template?.code) {
      const blob = new Blob([template.code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.tsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const useTemplate = async () => {
    if (!template) return

    setUsing(true)
    try {
      // Increment usage count
      await fetch(`/api/templates/${params.id}/use`, {
        method: 'POST',
      })

      // Navigate to studio with template code pre-filled
      const studioUrl = `/studio?template=${template.id}&name=${encodeURIComponent(
        template.name
      )}`
      router.push(studioUrl)
    } catch (error) {
      console.error('Error using template:', error)
      setUsing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto p-6">
          <div className="h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (!template) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/templates">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{template.name}</h1>
                <Badge variant="outline">{template.category}</Badge>
                {template.usageCount > 50 && (
                  <Badge className="bg-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{template.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {template.usageCount} uses
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(template.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button onClick={useTemplate} size="lg" disabled={using}>
              {using ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Opening Studio...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Use This Template
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={useTemplate} className="w-full" disabled={using}>
                  {using ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Use Template
                    </>
                  )}
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant={copied ? 'default' : 'outline'}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button onClick={downloadCode} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Template Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium mt-1">{template.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Uses:</span>
                  <p className="font-medium mt-1">{template.usageCount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium mt-1">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium mt-1">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Code Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Preview</CardTitle>
                  <Button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    size="sm"
                    variant="outline"
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="preview" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Live Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex-1">
                      <Code2 className="h-4 w-4 mr-2" />
                      Source Code
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    <div className="h-[500px] bg-white dark:bg-gray-950 rounded-lg border overflow-auto">
                      <LiveProvider code={template.code} scope={{ useState }}>
                        <div className="p-4">
                          <LivePreview />
                        </div>
                        <LiveError className="mt-2 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded" />
                      </LiveProvider>
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="mt-4">
                    <div className="relative">
                      <SyntaxHighlighter
                        language="typescript"
                        style={isDarkMode ? vscDarkPlus : vs}
                        showLineNumbers
                        wrapLines
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          maxHeight: '500px',
                        }}
                        lineNumberStyle={{
                          minWidth: '3em',
                          paddingRight: '1em',
                          color: isDarkMode ? '#858585' : '#999',
                          userSelect: 'none',
                        }}
                      >
                        {template.code}
                      </SyntaxHighlighter>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Ready to use this template?</h3>
                <p className="text-sm text-muted-foreground">
                  Start building with this template in AI Studio
                </p>
              </div>
              <Button onClick={useTemplate} size="lg" disabled={using}>
                {using ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Opening Studio...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Use This Template
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
