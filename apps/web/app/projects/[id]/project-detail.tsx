'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
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
  Clock,
  Zap,
  Download,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  FileCode2,
} from 'lucide-react'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false }
)

type Generation = {
  id: string
  prompt: string
  code: string | null
  status: string
  model: string
  tokensUsed: number | null
  cost: number | null
  executionTime: number | null
  createdAt: Date
}

type Project = {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  generations: Generation[]
}

type ProjectDetailProps = {
  project: Project
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(
    project.generations[0] || null
  )

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete project')

      router.push('/projects')
    } catch (error) {
      alert('Failed to delete project')
    }
  }

  const handleRegenerateFromGeneration = (generation: Generation) => {
    // Navigate to studio with pre-filled prompt
    const params = new URLSearchParams({
      prompt: generation.prompt,
      projectId: project.id,
    })
    router.push(`/studio?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground mt-1">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  {project.generations.length} generation{project.generations.length !== 1 ? 's' : ''}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated {new Date(project.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/studio?projectId=${project.id}`}>
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  New Generation
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {project.generations.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileCode2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">No generations yet</CardTitle>
            <p className="text-muted-foreground mb-6">
              Create your first generation to see code here
            </p>
            <Link href={`/studio?projectId=${project.id}`}>
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Code
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Generations List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Generation History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto">
                    {project.generations.map((gen, idx) => (
                      <button
                        key={gen.id}
                        onClick={() => setSelectedGeneration(gen)}
                        className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors ${
                          selectedGeneration?.id === gen.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              gen.status === 'COMPLETED'
                                ? 'default'
                                : gen.status === 'FAILED'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            #{project.generations.length - idx}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(gen.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2 mb-2">{gen.prompt}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="font-normal">
                            {gen.model}
                          </Badge>
                          {gen.executionTime && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {(gen.executionTime / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Code Viewer */}
            <div className="lg:col-span-2">
              {selectedGeneration && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Generated Code</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedGeneration.prompt}
                        </p>
                      </div>
                      {selectedGeneration.code && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => copyToClipboard(selectedGeneration.code!)}
                            size="sm"
                            variant={copied ? 'default' : 'outline'}
                          >
                            {copied ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() =>
                              downloadCode(
                                selectedGeneration.code!,
                                `${project.name.replace(/\s+/g, '-').toLowerCase()}.tsx`
                              )
                            }
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            size="sm"
                            variant="outline"
                          >
                            {isDarkMode ? '☀️' : '🌙'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="code" className="w-full">
                      <TabsList className="w-full">
                        <TabsTrigger value="code" className="flex-1">
                          <Code2 className="h-4 w-4 mr-2" />
                          Code
                        </TabsTrigger>
                        <TabsTrigger value="details" className="flex-1">
                          <FileCode2 className="h-4 w-4 mr-2" />
                          Details
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="code" className="mt-4">
                        {selectedGeneration.code ? (
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
                                maxHeight: '600px',
                              }}
                              lineNumberStyle={{
                                minWidth: '3em',
                                paddingRight: '1em',
                                color: isDarkMode ? '#858585' : '#999',
                                userSelect: 'none',
                              }}
                            >
                              {selectedGeneration.code}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
                            <p className="text-muted-foreground">No code generated</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="details" className="mt-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">
                                    {selectedGeneration.model}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    AI Model
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">
                                    {selectedGeneration.tokensUsed?.toLocaleString() || 'N/A'}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Tokens Used
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">
                                    ${selectedGeneration.cost?.toFixed(4) || '0.0000'}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">Cost</div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">
                                    {selectedGeneration.executionTime
                                      ? `${(selectedGeneration.executionTime / 1000).toFixed(1)}s`
                                      : 'N/A'}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Execution Time
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleRegenerateFromGeneration(selectedGeneration)}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerate from this prompt
                              </Button>
                              <Button variant="outline" className="w-full" disabled>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Deploy to Production
                                <Badge variant="secondary" className="ml-auto">
                                  Coming Soon
                                </Badge>
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
