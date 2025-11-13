'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@btrme/ui'

export function SignOutButton() {
  return (
    <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/' })}>
      Sign Out
    </Button>
  )
}
