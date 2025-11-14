import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@btrme/ui'
import {
  Sparkles,
  FolderCode,
  Zap,
  TrendingUp,
  Clock,
  Code2,
  Layers,
  ArrowRight,
  FileCode2,
  Calendar,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch user stats
  const [projectCount, generationCount, recentProjects, recentGenerations] = await Promise.all([
    prisma.project.count({
      where: { userId: session.user.id },
    }),
    prisma.generation.count({
      where: {
        project: { userId: session.user.id },
      },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: { generations: true },
        },
      },
    }),
    prisma.generation.findMany({
      where: {
        project: { userId: session.user.id },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    }),
  ])

  // Calculate this week's generations
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const thisWeekGenerations = await prisma.generation.count({
    where: {
      project: { userId: session.user.id },
      createdAt: { gte: oneWeekAgo },
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {session.user.name || 'there'}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-3xl font-bold mt-2">{projectCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FolderCode className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Generations</p>
                  <p className="text-3xl font-bold mt-2">{generationCount}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-3xl font-bold mt-2">{thisWeekGenerations}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg per Project</p>
                  <p className="text-3xl font-bold mt-2">
                    {projectCount > 0 ? Math.round(generationCount / projectCount) : 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with AI-powered development</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Link href="/studio">
                  <Card className="border-2 border-primary/20 hover:border-primary transition-all cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        AI Studio
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create with advanced AI generation
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/generate">
                  <Card className="border-2 border-border hover:border-primary transition-all cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        Quick Generate
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Fast code generation with instant preview
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/templates">
                  <Card className="border-2 border-border hover:border-primary transition-all cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                        <Layers className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        Templates
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Browse ready-to-use component templates
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/projects">
                  <Card className="border-2 border-border hover:border-primary transition-all cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                        <FolderCode className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        Projects
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage all your AI-generated projects
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your latest AI-generated projects</CardDescription>
                </div>
                <Link href="/projects">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentProjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCode2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No projects yet</p>
                    <p className="text-sm mt-1">Create your first project to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProjects.map((project) => (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors cursor-pointer">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                              <FileCode2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{project.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {project.description || 'No description'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Badge variant="secondary">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {project._count.generations}
                            </Badge>
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest AI generations</CardDescription>
              </CardHeader>
              <CardContent>
                {recentGenerations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentGenerations.map((gen) => (
                      <div key={gen.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              gen.status === 'COMPLETED'
                                ? 'bg-green-500/10 text-green-500'
                                : gen.status === 'FAILED'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
                            <Code2 className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{gen.project.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {gen.prompt.substring(0, 60)}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
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
                              {gen.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(gen.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="pt-6">
                <Sparkles className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Ready to create?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a new project with AI Studio or browse templates
                </p>
                <div className="flex gap-2">
                  <Link href="/studio" className="flex-1">
                    <Button className="w-full" size="sm">
                      AI Studio
                    </Button>
                  </Link>
                  <Link href="/templates" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Templates
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
