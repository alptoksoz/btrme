'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Textarea,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@btrme/ui'
import {
  Sparkles,
  Code2,
  Eye,
  Copy,
  Download,
  Save,
  Settings2,
  Zap,
  Brain,
  Rocket,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react'

// Dynamically import Prism for syntax highlighting (client-side only)
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false }
)
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Dynamically import react-live for live preview (client-side only)
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

const AI_MODELS = [
  {
    value: 'GPT4_TURBO',
    label: 'GPT-4 Turbo',
    cost: '$$$$',
    speed: 'Fast',
    icon: '🚀',
    description: 'Most capable, best for complex tasks',
  },
  {
    value: 'CLAUDE_OPUS',
    label: 'Claude Opus',
    cost: '$$$$$',
    speed: 'Medium',
    icon: '🎯',
    description: 'Creative & nuanced understanding',
  },
  {
    value: 'GPT35_TURBO',
    label: 'GPT-3.5 Turbo',
    cost: '$',
    speed: 'Very Fast',
    icon: '⚡',
    description: 'Fast & economical for simple tasks',
  },
  {
    value: 'CLAUDE_HAIKU',
    label: 'Claude Haiku',
    cost: '$',
    speed: 'Very Fast',
    icon: '💨',
    description: 'Fastest Claude model',
  },
]

const PROMPT_SUGGESTIONS = [
  'Create a responsive navigation bar with dark mode toggle',
  'Build a todo list with drag & drop functionality',
  'Design a pricing table with 3 tiers and animations',
  'Create a dashboard with charts and metrics cards',
  'Build a contact form with validation and error handling',
  'Design a landing page hero section with gradient background',
]

const COMPLEXITY_LEVELS = [
  { value: 'SIMPLE', label: 'Simple', icon: Zap, color: 'text-green-500' },
  { value: 'STANDARD', label: 'Standard', icon: Brain, color: 'text-blue-500' },
  { value: 'COMPLEX', label: 'Complex', icon: Settings2, color: 'text-orange-500' },
  { value: 'EXPERT', label: 'Expert', icon: Rocket, color: 'text-purple-500' },
]

export default function StudioPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [projectName, setProjectName] = useState('')
  const [selectedModel, setSelectedModel] = useState('GPT4_TURBO')
  const [complexity, setComplexity] = useState('STANDARD')
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [generationStats, setGenerationStats] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleGenerate = async () => {
    if (!prompt.trim() || !projectName.trim()) {
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

      // Generate code
      const genRes = await fetch('/api/generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          prompt,
          model: selectedModel,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Generation Studio</h1>
                <p className="text-xs text-muted-foreground">Create with AI, ship instantly</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Prompt & Settings */}
          <div className="space-y-6">
            {/* Project Name */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Project Name</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome App"
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </CardContent>
            </Card>

            {/* Prompt Builder */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Describe What You Want</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {prompt.length}/2000
                  </Badge>
                </div>
                <CardDescription>Be specific about features and design</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 2000))}
                  placeholder="e.g., Create a modern dashboard with user analytics, real-time charts, and a sidebar navigation..."
                  disabled={loading}
                  className="min-h-[200px] resize-none"
                />

                {/* Prompt Suggestions */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_SUGGESTIONS.slice(0, 3).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(suggestion)}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                      >
                        {suggestion.length > 40
                          ? suggestion.substring(0, 40) + '...'
                          : suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            <Card>
              <CardHeader className="pb-3">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-between w-full"
                >
                  <CardTitle className="text-base">Generation Settings</CardTitle>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showSettings ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <CardDescription>Customize AI model and complexity</CardDescription>
              </CardHeader>

              {showSettings && (
                <CardContent className="space-y-6">
                  {/* Complexity Selector */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Complexity Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMPLEXITY_LEVELS.map((level) => {
                        const Icon = level.icon
                        return (
                          <button
                            key={level.value}
                            onClick={() => setComplexity(level.value)}
                            disabled={loading}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              complexity === level.value
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`h-4 w-4 ${level.color}`} />
                              <span className="font-medium text-sm">{level.label}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Model Selector */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">AI Model</label>
                    <div className="space-y-2">
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.value}
                          onClick={() => setSelectedModel(model.value)}
                          disabled={loading}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            selectedModel === model.value
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{model.icon}</span>
                              <span className="font-medium text-sm">{model.label}</span>
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{model.cost}</span>
                              <span>•</span>
                              <span>{model.speed}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{model.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || !projectName.trim()}
              size="lg"
              className="w-full relative overflow-hidden group"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Generate Code
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Code Preview */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-24">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Output</CardTitle>
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
                            AI is crafting your code...
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
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
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
                        <p className="font-medium mt-1">${generationStats.cost?.toFixed(4)}</p>
                      </div>
                    </div>
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
