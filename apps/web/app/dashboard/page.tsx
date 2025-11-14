import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@btrme/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@btrme/ui'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name || session.user.email}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Manage your AI-generated projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/projects">
              <Button className="w-full">View Projects</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Studio</CardTitle>
            <CardDescription>Create with advanced AI generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/studio">
              <Button className="w-full">✨ Open AI Studio</Button>
            </Link>
            <Link href="/generate">
              <Button className="w-full" variant="outline">Quick Generate</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Browse template marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/templates">
              <Button className="w-full" variant="outline">
                Explore Templates
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
