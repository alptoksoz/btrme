import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Badge } from '@btrme/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@btrme/ui'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const project = await prisma.project.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      generations: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generations ({project.generations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.generations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No generations yet</p>
              ) : (
                project.generations.map((gen) => (
                  <div
                    key={gen.id}
                    className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            gen.status === 'COMPLETED'
                              ? 'default'
                              : gen.status === 'FAILED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {gen.status}
                        </Badge>
                        <Badge variant="outline">{gen.model}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(gen.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{gen.prompt}</p>
                    {gen.tokensUsed && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{gen.tokensUsed.toLocaleString()} tokens</span>
                        {gen.cost && <span>${gen.cost.toFixed(4)}</span>}
                      </div>
                    )}
                    {gen.code && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          View Code
                        </summary>
                        <pre className="mt-2 rounded bg-muted p-4 text-xs overflow-x-auto">
                          <code>{gen.code}</code>
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
