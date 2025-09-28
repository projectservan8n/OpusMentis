'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DashboardLayout from '@/components/dashboard-layout'
import StudyPackCard from '@/components/study-pack-card'
import { Plus, Brain, BookOpen, Zap, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface StudyPack {
  id: string
  title: string
  description?: string
  originalFileName: string
  fileType: string
  fileSize: number
  status: string
  processingError?: string
  createdAt: string
  _count?: {
    notes: number
  }
}

interface DashboardStats {
  totalStudyPacks: number
  processingPacks: number
  completedPacks: number
  totalNotes: number
}

export default function DashboardPage() {
  const { user } = useUser()
  const [studyPacks, setStudyPacks] = useState<StudyPack[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalStudyPacks: 0,
    processingPacks: 0,
    completedPacks: 0,
    totalNotes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudyPacks()
  }, [])

  const fetchStudyPacks = async () => {
    try {
      const response = await fetch('/api/study-packs')
      if (!response.ok) throw new Error('Failed to fetch study packs')

      const packs = await response.json()
      setStudyPacks(packs)

      // Calculate stats
      const totalNotes = packs.reduce((sum: number, pack: StudyPack) =>
        sum + (pack._count?.notes || 0), 0
      )

      setStats({
        totalStudyPacks: packs.length,
        processingPacks: packs.filter((p: StudyPack) => p.status === 'processing').length,
        completedPacks: packs.filter((p: StudyPack) => p.status === 'completed').length,
        totalNotes
      })
    } catch (error) {
      console.error('Error fetching study packs:', error)
      toast.error('Failed to load study packs')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study pack?')) return

    try {
      const response = await fetch(`/api/study-packs/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete study pack')

      toast.success('Study pack deleted successfully')
      fetchStudyPacks() // Refresh the list
    } catch (error) {
      console.error('Error deleting study pack:', error)
      toast.error('Failed to delete study pack')
    }
  }

  const handleExport = async (id: string) => {
    try {
      toast.loading('Generating PDF...', { id: 'export' })

      const response = await fetch(`/api/study-packs/${id}/export`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to export study pack')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `study-pack-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Study pack exported successfully!', { id: 'export' })
    } catch (error) {
      console.error('Error exporting study pack:', error)
      toast.error('Failed to export PDF', { id: 'export' })
    }
  }

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.firstName || 'Student'}!`}
      subtitle="Continue your learning journey with AI-powered study materials"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Packs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudyPacks}</div>
            <p className="text-xs text-muted-foreground">
              Total materials uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processingPacks}</div>
            <p className="text-xs text-muted-foreground">
              AI working on these
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Study</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedPacks}</div>
            <p className="text-xs text-muted-foreground">
              Study materials ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotes}</div>
            <p className="text-xs text-muted-foreground">
              Personal notes created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Upload Material</CardTitle>
                </div>
                <CardDescription>
                  Upload PDFs, audio, video, or images to create study materials
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/billing">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Upgrade Plan</CardTitle>
                </div>
                <CardDescription>
                  Get unlimited uploads and advanced features
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">AI Settings</CardTitle>
                </div>
                <CardDescription>
                  Customize how AI generates your study materials
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Study Packs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Your Study Packs</h2>
          <Link href="/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : studyPacks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No study packs yet</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                Upload your first PDF, audio, video, or image file to get AI-generated study materials.
              </p>
              <Link href="/upload">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First File
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyPacks.map((studyPack) => (
              <StudyPackCard
                key={studyPack.id}
                studyPack={studyPack}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}