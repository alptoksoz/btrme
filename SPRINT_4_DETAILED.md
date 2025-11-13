# SPRINT 4: Templates & Iteration Engine (85 SP, 2 Weeks)

**Sprint Goal:** Build template marketplace, iteration engine, and user customization features.

**Sprint Duration:** 2 weeks
**Total Story Points:** 85 SP
**Estimated Hours:** 204 hours

---

## Epic 4.1: Template Marketplace (25 SP, 60 hours)

### Story 4.1.1: Template Discovery & Browse (10 SP, 24h)

`apps/web/app/templates/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { TemplateCard } from '@/components/templates/template-card'
import { TemplateFilters } from '@/components/templates/filters'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [filters, setFilters] = useState({
    category: 'all',
    tags: [],
    sort: 'popular',
  })

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Template Marketplace</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Filters */}
        <aside className="col-span-3">
          <TemplateFilters filters={filters} onChange={setFilters} />
        </aside>

        {/* Templates Grid */}
        <main className="col-span-9">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
```

`apps/web/components/templates/template-card.tsx`:
```typescript
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Download, Eye } from 'lucide-react'

export function TemplateCard({ template }: any) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Preview Image */}
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />

        {/* Info */}
        <div>
          <h3 className="font-bold text-lg">{template.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {template.rating}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {template.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {template.views}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1">Use Template</Button>
          <Button variant="outline">Preview</Button>
        </div>
      </div>
    </Card>
  )
}
```

### Story 4.1.2: Template Ratings & Reviews (8 SP, 18h)

`apps/web/lib/templates/reviews.ts`:
```typescript
export async function rateTemplate(
  userId: string,
  templateId: string,
  rating: number,
  review?: string
) {
  return prisma.templateReview.create({
    data: {
      userId,
      templateId,
      rating,
      review,
    },
  })
}

export async function getTemplateReviews(templateId: string) {
  return prisma.templateReview.findMany({
    where: { templateId },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
```

Prisma schema:
```prisma
model TemplateReview {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())

  userId     String
  user       User     @relation(fields: [userId], references: [id])

  templateId String
  template   PromptTemplate @relation(fields: [templateId], references: [id])

  rating     Int      // 1-5
  review     String?
  helpful    Int      @default(0)

  @@unique([userId, templateId])
  @@map("template_reviews")
}
```

### Story 4.1.3: Template Publishing (7 SP, 18h)

`apps/web/app/api/templates/publish/route.ts`:
```typescript
import { apiHandler } from '@/lib/api/handler'
import { z } from 'zod'

const publishSchema = z.object({
  templateId: z.string(),
  pricing: z.object({
    type: z.enum(['free', 'paid']),
    price: z.number().optional(),
  }),
  license: z.enum(['MIT', 'Apache', 'GPL', 'Proprietary']),
})

export const POST = apiHandler(
  async (req, { body, userId }) => {
    const { templateId, pricing, license } = body!

    const template = await prisma.promptTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template || template.userId !== userId) {
      throw new Error('Unauthorized')
    }

    await prisma.promptTemplate.update({
      where: { id: templateId },
      data: {
        public: true,
        pricing,
        license,
        publishedAt: new Date(),
      },
    })

    return { message: 'Template published successfully' }
  },
  {
    requireAuth: true,
    bodySchema: publishSchema,
  }
)
```

---

## Epic 4.2: Iteration Engine (30 SP, 72 hours)

### Story 4.2.1: Code Modification System (12 SP, 28h)

`apps/web/lib/iteration/modifier.ts`:
```typescript
import { generateCompletion } from '@/lib/ai/service'
import { parseAIResponse } from '@/lib/codegen/parser'

export interface IterationRequest {
  projectId: string
  instruction: string
  targetFiles?: string[]
}

export async function iterateOnCode(request: IterationRequest) {
  const { projectId, instruction, targetFiles } = request

  // Get existing project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) throw new Error('Project not found')

  const structure = project.structure as any

  // Build context with existing code
  const context = targetFiles
    ? structure.files.filter((f: any) => targetFiles.includes(f.path))
    : structure.files

  const prompt = buildIterationPrompt(context, instruction)

  // Generate modifications
  const result = await generateCompletion(
    [
      {
        role: 'system',
        content: 'You are modifying existing code. Only output changed files.',
      },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.2 }
  )

  // Parse modifications
  const modifications = parseAIResponse(result.content)

  // Apply modifications
  await applyModifications(projectId, modifications)

  return modifications
}

function buildIterationPrompt(files: any[], instruction: string): string {
  return `
# Existing Code

${files.map((f) => `
## ${f.path}
\`\`\`${f.language}
${f.content}
\`\`\`
`).join('\n')}

# Modification Request

${instruction}

# Instructions

- Only output files that need to be changed
- Provide complete file contents, not diffs
- Maintain existing code style
- Add comments explaining changes
`
}

async function applyModifications(projectId: string, modifications: any) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) throw new Error('Project not found')

  const structure = project.structure as any

  // Merge modifications
  for (const modFile of modifications.files) {
    const existingIdx = structure.files.findIndex((f: any) => f.path === modFile.path)

    if (existingIdx >= 0) {
      // Update existing file
      structure.files[existingIdx] = modFile
    } else {
      // Add new file
      structure.files.push(modFile)
    }
  }

  // Update project
  await prisma.project.update({
    where: { id: projectId },
    data: { structure },
  })
}
```

### Story 4.2.2: Chat-based Iteration (10 SP, 24h)

`apps/web/app/api/projects/[id]/chat/route.ts`:
```typescript
import { apiHandler } from '@/lib/api/handler'
import { z } from 'zod'
import { iterateOnCode } from '@/lib/iteration/modifier'

const chatSchema = z.object({
  message: z.string(),
  conversationId: z.string().optional(),
})

export const POST = apiHandler(
  async (req, { params, body, userId }) => {
    const projectId = params.id
    const { message, conversationId } = body!

    // Create or get conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      })
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: userId!,
          projectId,
        },
      })
    }

    // Add user message
    await prisma.message.create({
      data: {
        conversationId: conversation!.id,
        role: 'user',
        content: message,
      },
    })

    // Process iteration
    const result = await iterateOnCode({
      projectId,
      instruction: message,
    })

    // Add assistant response
    await prisma.message.create({
      data: {
        conversationId: conversation!.id,
        role: 'assistant',
        content: JSON.stringify(result),
      },
    })

    return {
      conversationId: conversation!.id,
      modifications: result,
    }
  },
  {
    requireAuth: true,
    bodySchema: chatSchema,
  }
)
```

### Story 4.2.3: Version Control (8 SP, 20h)

`apps/web/lib/projects/versions.ts`:
```typescript
export async function createVersion(projectId: string, message: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) throw new Error('Project not found')

  return prisma.projectVersion.create({
    data: {
      projectId,
      structure: project.structure,
      message,
      createdBy: project.userId,
    },
  })
}

export async function rollbackToVersion(projectId: string, versionId: string) {
  const version = await prisma.projectVersion.findUnique({
    where: { id: versionId },
  })

  if (!version || version.projectId !== projectId) {
    throw new Error('Version not found')
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      structure: version.structure,
    },
  })

  return version
}
```

---

## Epic 4.3: User Customization (20 SP, 48 hours)

### Story 4.3.1: Theme Customization (8 SP, 18h)

`apps/web/lib/customization/themes.ts`:
```typescript
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: 'compact' | 'normal' | 'spacious'
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
}

export function applyTheme(config: ThemeConfig, code: string): string {
  // Apply theme to generated code
  return code
    .replace(/{{PRIMARY_COLOR}}/g, config.colors.primary)
    .replace(/{{SECONDARY_COLOR}}/g, config.colors.secondary)
    .replace(/{{HEADING_FONT}}/g, config.fonts.heading)
    .replace(/{{BODY_FONT}}/g, config.fonts.body)
}
```

### Story 4.3.2: Component Library Selection (7 SP, 18h)

`apps/web/lib/customization/components.ts`:
```typescript
export const COMPONENT_LIBRARIES = {
  'shadcn-ui': {
    name: 'shadcn/ui',
    install: 'npx shadcn-ui@latest init',
    components: ['button', 'card', 'input', 'dialog'],
  },
  'chakra-ui': {
    name: 'Chakra UI',
    install: 'npm i @chakra-ui/react',
    components: ['Button', 'Box', 'Input', 'Modal'],
  },
  'material-ui': {
    name: 'Material UI',
    install: 'npm i @mui/material',
    components: ['Button', 'Card', 'TextField', 'Dialog'],
  },
}

export function injectComponentLibrary(
  library: keyof typeof COMPONENT_LIBRARIES,
  code: string
): string {
  const lib = COMPONENT_LIBRARIES[library]
  // Update imports and components
  return code
}
```

### Story 4.3.3: Code Style Preferences (5 SP, 12h)

`apps/web/lib/customization/style.ts`:
```typescript
export interface CodeStyle {
  indentSize: 2 | 4
  quotes: 'single' | 'double'
  semicolons: boolean
  trailingComma: 'none' | 'es5' | 'all'
  arrowParens: 'always' | 'avoid'
}

export async function formatCode(code: string, style: CodeStyle): Promise<string> {
  const prettier = await import('prettier')

  return prettier.format(code, {
    parser: 'typescript',
    tabWidth: style.indentSize,
    singleQuote: style.quotes === 'single',
    semi: style.semicolons,
    trailingComma: style.trailingComma,
    arrowParens: style.arrowParens,
  })
}
```

---

## Epic 4.4: Collaboration Features (10 SP, 24 hours)

### Story 4.4.1: Project Sharing (5 SP, 12h)

`apps/web/lib/projects/sharing.ts`:
```typescript
export async function shareProject(
  projectId: string,
  userId: string,
  permissions: 'view' | 'edit' | 'admin'
) {
  return prisma.projectShare.create({
    data: {
      projectId,
      userId,
      permissions,
    },
  })
}

export async function getSharedProjects(userId: string) {
  return prisma.projectShare.findMany({
    where: { userId },
    include: {
      project: true,
    },
  })
}
```

### Story 4.4.2: Real-time Collaboration (5 SP, 12h)

Using Partykit for real-time:
```typescript
// apps/web/lib/collaboration/party.ts
import type { Party, PartyKitServer } from 'partykit/server'

export default class ProjectRoom implements PartyKitServer {
  constructor(public party: Party) {}

  onConnect(conn: Party.Connection) {
    console.log(`User ${conn.id} connected`)
  }

  onMessage(message: string, sender: Party.Connection) {
    // Broadcast to all connected users
    this.party.broadcast(message, [sender.id])
  }
}
```

---

## SPRINT 4 COMPLETE! ✅

**Total:** 85 SP, 204 hours
**Epics:**
- ✅ Epic 4.1: Template Marketplace (25 SP)
- ✅ Epic 4.2: Iteration Engine (30 SP)
- ✅ Epic 4.3: User Customization (20 SP)
- ✅ Epic 4.4: Collaboration (10 SP)

---
