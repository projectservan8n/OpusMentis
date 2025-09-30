'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Brain,
  LayoutDashboard,
  Upload,
  Settings,
  CreditCard,
  Users
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
]

const adminNavigation = [
  { name: 'Admin', href: '/admin', icon: Users },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()

  // Check if user is admin
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === 'tony@opusautomations.com'

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Brain className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">OpusMentis</span>
          </div>

          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                    )}
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}

              {isAdmin && (
                <div className="pt-4 mt-4 border-t">
                  <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin
                  </div>
                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors mt-1'
                        )}
                      >
                        <item.icon
                          className="mr-3 h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.firstName}</p>
                <p className="text-xs text-muted-foreground">{user?.emailAddresses?.[0]?.emailAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-bold">OpusMentis</span>
          </div>
          <UserButton />
        </div>

        {/* Mobile navigation */}
        <nav className="flex overflow-x-auto p-4 space-x-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}