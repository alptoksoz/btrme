import { auth } from '@/auth'
import { SignOutButton } from './sign-out-button'
import Link from 'next/link'
import { Button } from '@btrme/ui'

export async function UserNav() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="flex gap-2">
        <Link href="/auth/signin">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/auth/signup">
          <Button>Sign Up</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{session.user.email}</span>
      <SignOutButton />
    </div>
  )
}
