'use client'

import Navigation from './navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function DashboardLayout({
  children,
  title,
  subtitle
}: DashboardLayoutProps) {
  return (
    <div className="h-screen flex bg-background">
      <Navigation />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {title && (
          <div className="bg-background border-b px-4 py-4 sm:px-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}