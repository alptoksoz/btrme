import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProjectDetail } from './project-detail'

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
        take: 50,
      },
    },
  })

  if (!project) {
    notFound()
  }

  return <ProjectDetail project={project} />
}
