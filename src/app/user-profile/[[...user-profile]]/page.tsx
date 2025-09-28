import { UserProfile } from '@clerk/nextjs'

export default function UserProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <UserProfile
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border border-border",
          }
        }}
      />
    </div>
  )
}