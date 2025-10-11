'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser, OrganizationSwitcher } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  Brain,
  LayoutDashboard,
  Upload,
  Settings,
  CreditCard,
  Users,
  Code,
  Key,
  Menu,
  X,
  History,
  TrendingUp
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Quiz History', href: '/quiz-history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
]

const developerNavigation = [
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'API Playground', href: '/api-playground', icon: Code },
]

const adminNavigation = [
  { name: 'Admin', href: '/admin', icon: Users },
]

function NavigationLinks({ isAdmin, pathname, onNavigate }: { isAdmin: boolean; pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
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
      </nav>

      {/* Developer Section */}
      <div className="pt-4 mt-4 border-t">
        <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Developer
        </div>
        <nav className="space-y-1">
          {developerNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
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
        </nav>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="pt-4 mt-4 border-t">
          <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Admin
          </div>
          <nav className="space-y-1">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
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
          </nav>
        </div>
      )}
    </>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if user is admin
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === 'tony@opusautomations.com'

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Brain className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">OpusMentis</span>
          </div>

          <div className="mt-5 flex-1 flex flex-col px-2">
            <NavigationLinks isAdmin={isAdmin} pathname={pathname} />
          </div>

          {/* Organization Switcher (Premium feature) */}
          <div className="flex-shrink-0 border-t p-4">
            <OrganizationSwitcher
              hidePersonal={false}
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger: "w-full justify-start px-3 py-2 rounded-md hover:bg-accent",
                },
              }}
            />
          </div>

          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  },
                }}
              />
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.firstName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center px-4 py-5 border-b">
                    <Brain className="h-6 w-6 text-primary" />
                    <span className="ml-2 text-lg font-bold">OpusMentis</span>
                  </div>
                  <div className="flex-1 overflow-y-auto py-4 px-2">
                    <NavigationLinks
                      isAdmin={isAdmin}
                      pathname={pathname}
                      onNavigate={() => setMobileMenuOpen(false)}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-bold">OpusMentis</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
