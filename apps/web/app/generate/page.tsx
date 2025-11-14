'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@btrme/ui'
import { Input } from '@btrme/ui'
import { Label } from '@btrme/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@btrme/ui'
import { Badge } from '@btrme/ui'

const AI_MODELS = [
  { value: 'GPT4_TURBO', label: 'GPT-4 Turbo', cost: '$$$$', speed: 'Fast' },
  { value: 'GPT4', label: 'GPT-4', cost: '$$$$$', speed: 'Medium' },
  { value: 'GPT35_TURBO', label: 'GPT-3.5 Turbo', cost: '$', speed: 'Very Fast' },
  { value: 'CLAUDE_OPUS', label: 'Claude Opus', cost: '$$$$$', speed: 'Medium' },
  { value: 'CLAUDE_SONNET', label: 'Claude Sonnet', cost: '$$$', speed: 'Fast' },
  { value: 'CLAUDE_HAIKU', label: 'Claude Haiku', cost: '$', speed: 'Very Fast' },
]

const COMPLEXITY_LEVELS = [
  { value: 'SIMPLE', label: 'Simple', description: 'Basic components or utilities' },
  { value: 'STANDARD', label: 'Standard', description: 'Full features with logic' },
  { value: 'COMPLEX', label: 'Complex', description: 'Multiple integrations' },
  { value: 'EXPERT', label: 'Expert', description: 'Architecture & design' },
]

export default function GeneratePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<string>('')
  const [complexity, setComplexity] = useState<string>('')
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // Create project first
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
          model: model || undefined,
          complexity: complexity || undefined,
        }),
      })

      if (!genRes.ok) throw new Error('Failed to generate code')

      const generation = await genRes.json()
      setResult(generation)

      // Redirect to project detail after 2 seconds
      setTimeout(() => {
        router.push(`/projects/${project.id}`)
      }, 2000)
    } catch (error: any) {
      alert(error.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generate AI Code</h1>
        <p className="text-muted-foreground">
          Describe what you want to build and let AI generate it for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome App"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="prompt">What do you want to build?</Label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Create a todo app with authentication, categories, and due dates..."
                required
                disabled={loading}
                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Be specific about features, design, and functionality
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation Settings (Optional)</CardTitle>
            <CardDescription>Leave empty for automatic selection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Complexity Level</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {COMPLEXITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setComplexity(level.value)}
                    disabled={loading}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      complexity === level.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-muted-foreground">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>AI Model</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {AI_MODELS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModel(m.value)}
                    disabled={loading}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      model === m.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{m.label}</div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
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

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Code'}
        </Button>
      </form>

      {result && (
        <Card className="mt-6 border-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Generation Complete!</CardTitle>
              <Badge>Success</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-4 text-sm">
              <span>Model: <strong>{result.model}</strong></span>
              <span>Tokens: <strong>{result.tokensUsed?.toLocaleString()}</strong></span>
              <span>Cost: <strong>${result.cost?.toFixed(4)}</strong></span>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting to project page...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
