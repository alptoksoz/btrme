import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@btrme/ui'
import { Sparkles, Plus } from 'lucide-react'
import { ProjectsList } from './projects-list'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your AI-generated projects
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/studio">
              <Button size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Studio
              </Button>
            </Link>
            <Link href="/generate">
              <Button size="lg" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        <ProjectsList projects={projects} />
      </div>
    </div>
  )
}
