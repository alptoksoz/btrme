import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@btrme/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@btrme/ui'
import { Badge } from '@btrme/ui'

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { generations: true },
      },
    },
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Manage your AI-generated projects</p>
        </div>
        <Link href="/generate">
          <Button size="lg">New Project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>Create your first AI-generated project</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/generate">
              <Button size="lg">Generate Your First Project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {project._count.generations} generation{project._count.generations !== 1 ? 's' : ''}
                    </Badge>
                    <span>•</span>
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
