import { auth } from '@/auth'
import { redirect } from 'next/navigation'
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
            <Button className="w-full">View Projects</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate</CardTitle>
            <CardDescription>Create new project from prompt</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">New Generation</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Browse template marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Explore Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
