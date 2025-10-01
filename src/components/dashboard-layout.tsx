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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Main content - offset for mobile header and desktop sidebar */}
      <div className="lg:pl-64">
        <div className="pt-16 lg:pt-0 min-h-screen flex flex-col">
          {title && (
            <div className="bg-background border-b px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
          )}

          <main className="flex-1">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}