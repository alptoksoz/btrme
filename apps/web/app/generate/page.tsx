'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Button,
  Input,
  Textarea,
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
  Sparkles,
  Zap,
  ArrowLeft,
  Loader2,
  Check,
  Copy,
  Download,
  Code2,
  Eye,
  Wand2,
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

const PROMPT_SUGGESTIONS = [
  'Build a modern todo list with drag & drop',
  'Create a pricing table with 3 tiers',
  'Design a contact form with validation',
  'Build a product card with image gallery',
  'Create a dashboard stats widget',
  'Design a testimonial carousel',
]

const AI_MODELS = [
  { value: 'GPT4_TURBO', label: 'GPT-4 Turbo', cost: '$$$$', speed: 'Fast', icon: '🚀' },
  { value: 'CLAUDE_OPUS', label: 'Claude Opus', cost: '$$$$$', speed: 'Medium', icon: '🎯' },
  { value: 'GPT35_TURBO', label: 'GPT-3.5 Turbo', cost: '$', speed: 'Very Fast', icon: '⚡' },
  { value: 'CLAUDE_HAIKU', label: 'Claude Haiku', cost: '$', speed: 'Very Fast', icon: '💨' },
]

const COMPLEXITY_LEVELS = [
  { value: 'SIMPLE', label: 'Simple', description: 'Basic components' },
  { value: 'STANDARD', label: 'Standard', description: 'Full features' },
  { value: 'COMPLEX', label: 'Complex', description: 'Advanced logic' },
]

export default function GeneratePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('GPT4_TURBO')
  const [complexity, setComplexity] = useState('STANDARD')
  const [generatedCode, setGeneratedCode] = useState('')
  const [generationStats, setGenerationStats] = useState<any>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleGenerate = async () => {
    if (!projectName.trim() || !prompt.trim()) {
      alert('Please provide both project name and prompt')
      return
    }

    setLoading(true)
    setGeneratedCode('')
    setGenerationStats(null)

    try {
      // Create project
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description: prompt.substring(0, 200),
        }),
      })

      if (!projectRes.ok) throw new Error('Failed to create project')
      const project = await projectRes.json()
      setProjectId(project.id)

      // Generate code
      const genRes = await fetch('/api/generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          prompt,
          model,
          complexity,
        }),
      })

      if (!genRes.ok) throw new Error('Failed to generate code')
      const generation = await genRes.json()

      setGeneratedCode(generation.code || '')
      setGenerationStats({
        model: generation.model,
        tokensUsed: generation.tokensUsed,
        cost: generation.cost,
        executionTime: generation.executionTime,
      })
    } catch (error: any) {
      alert(error.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadCode = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.tsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const viewProject = () => {
    if (projectId) {
      router.push(`/projects/${projectId}`)
    }
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
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Quick Generate</h1>
              <p className="text-muted-foreground">
                Fast AI code generation with instant preview
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Input Form */}
          <div className="space-y-6">
            {/* Project Name */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Project Name</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Quick App"
                  disabled={loading}
                />
              </CardContent>
            </Card>

            {/* Prompt */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What do you want to build?</CardTitle>
                <CardDescription>
                  Describe your component or feature in detail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
                  placeholder="e.g., Create a responsive pricing table with 3 tiers, monthly/yearly toggle, and feature comparison..."
                  disabled={loading}
                  className="min-h-[150px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {prompt.length}/1000 characters
                  </span>
                </div>

                {/* Quick Suggestions */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Quick ideas:</p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_SUGGESTIONS.slice(0, 3).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(suggestion)}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Complexity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Complexity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COMPLEXITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setComplexity(level.value)}
                        disabled={loading}
                        className={`p-2 rounded-lg border-2 text-left transition-all ${
                          complexity === level.value
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium text-sm">{level.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {level.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Model */}
                <div>
                  <label className="text-sm font-medium mb-2 block">AI Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AI_MODELS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setModel(m.value)}
                        disabled={loading}
                        className={`p-2 rounded-lg border-2 text-left transition-all ${
                          model === m.value
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{m.icon}</span>
                          <span className="font-medium text-sm">{m.label}</span>
                        </div>
                        <div className="flex gap-1 text-xs text-muted-foreground">
                          <span>{m.cost}</span>
                          <span>•</span>
                          <span>{m.speed}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || !projectName.trim()}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Generate Now
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Live Preview</CardTitle>
                  {generatedCode && (
                    <div className="flex gap-2">
                      <Button
                        onClick={copyToClipboard}
                        size="sm"
                        variant={copied ? 'default' : 'outline'}
                        className="h-8"
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
                      <Button onClick={downloadCode} size="sm" variant="outline" className="h-8">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        size="sm"
                        variant="outline"
                        className="h-8"
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
                    <TabsTrigger value="preview" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="mt-4">
                    {loading ? (
                      <div className="h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-center space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="text-sm text-muted-foreground">
                            AI is generating your code...
                          </p>
                        </div>
                      </div>
                    ) : generatedCode ? (
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
                          {generatedCode}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <div className="h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-border">
                        <div className="text-center space-y-2">
                          <Code2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground">
                            Generated code will appear here
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="preview" className="mt-4">
                    {generatedCode ? (
                      <div className="h-[500px] bg-white dark:bg-gray-950 rounded-lg border overflow-auto">
                        <LiveProvider code={generatedCode} scope={{ useState }}>
                          <div className="p-4">
                            <LivePreview />
                          </div>
                          <LiveError className="mt-2 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded" />
                        </LiveProvider>
                      </div>
                    ) : (
                      <div className="h-[500px] flex items-center justify-center bg-white dark:bg-gray-950 rounded-lg border">
                        <div className="text-center space-y-2">
                          <Eye className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground">
                            Generate code to see live preview
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Generation Stats */}
                {generationStats && (
                  <div className="mt-4 space-y-3">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-500">Success</Badge>
                        <span className="text-xs text-muted-foreground">
                          Generated in {(generationStats.executionTime / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Model:</span>
                          <p className="font-medium mt-1">{generationStats.model}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tokens:</span>
                          <p className="font-medium mt-1">
                            {generationStats.tokensUsed?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>
                          <p className="font-medium mt-1">
                            ${generationStats.cost?.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {projectId && (
                      <Button onClick={viewProject} className="w-full" variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        View Full Project
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
