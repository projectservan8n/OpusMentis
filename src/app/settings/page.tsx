'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/dashboard-layout'
import {
  Settings as SettingsIcon,
  User,
  Brain,
  FileText,
  Palette,
  Shield,
  Download,
  Trash2,
  Save
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    summaryStyle: 'comprehensive',
    flashcardDifficulty: 'mixed',
    kanbanDepth: 'detailed',
    preferredLanguage: 'english'
  })

  // Export Settings
  const [exportSettings, setExportSettings] = useState({
    includeNotes: true,
    includeFlashcards: true,
    includeKanban: true,
    pdfLayout: 'standard'
  })

  const handleSaveAISettings = async () => {
    setLoading(true)
    try {
      // TODO: Save to backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('AI settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveExportSettings = async () => {
    setLoading(true)
    try {
      // TODO: Save to backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Export settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      toast.loading('Preparing your data...', { id: 'export-data' })
      // TODO: Generate user data export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Data export feature coming soon!', { id: 'export-data' })
    } catch (error) {
      toast.error('Failed to export data', { id: 'export-data' })
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your study packs, notes, and data.'
    )

    if (!confirmed) return

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )

    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    try {
      toast.loading('Deleting account...', { id: 'delete-account' })
      // TODO: Delete account via API
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Account deletion feature managed via Clerk dashboard', { id: 'delete-account' })
    } catch (error) {
      toast.error('Failed to delete account', { id: 'delete-account' })
    }
  }

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Customize your StudyFlow AI experience"
    >
      <div className="space-y-8">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>
              Manage your account information (handled by Clerk)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="font-medium">{user?.fullName || 'User'}</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
                <Badge variant="secondary" className="mt-1">
                  Free Plan
                </Badge>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => window.open('/user-profile', '_blank')}>
                Manage Profile in Clerk
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Preferences</span>
            </CardTitle>
            <CardDescription>
              Customize how AI processes and generates your study materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Summary Style
                </label>
                <select
                  value={aiSettings.summaryStyle}
                  onChange={(e) => setAiSettings({ ...aiSettings, summaryStyle: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="brief">Brief - Key points only</option>
                  <option value="comprehensive">Comprehensive - Detailed overview</option>
                  <option value="bullet">Bullet Points - Structured list</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Flashcard Difficulty
                </label>
                <select
                  value={aiSettings.flashcardDifficulty}
                  onChange={(e) => setAiSettings({ ...aiSettings, flashcardDifficulty: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="easy">Easy - Basic concepts</option>
                  <option value="medium">Medium - Balanced mix</option>
                  <option value="hard">Hard - Advanced concepts</option>
                  <option value="mixed">Mixed - All difficulty levels</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Kanban Detail Level
                </label>
                <select
                  value={aiSettings.kanbanDepth}
                  onChange={(e) => setAiSettings({ ...aiSettings, kanbanDepth: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="simple">Simple - High-level tasks</option>
                  <option value="detailed">Detailed - Granular breakdown</option>
                  <option value="progressive">Progressive - Learning path</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Processing Language
                </label>
                <select
                  value={aiSettings.preferredLanguage}
                  onChange={(e) => setAiSettings({ ...aiSettings, preferredLanguage: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="english">English</option>
                  <option value="filipino">Filipino</option>
                  <option value="auto">Auto-detect</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSaveAISettings} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save AI Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Export Preferences</span>
            </CardTitle>
            <CardDescription>
              Control what gets included in your PDF exports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Include Personal Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    Add your personal notes to PDF exports
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={exportSettings.includeNotes}
                  onChange={(e) => setExportSettings({ ...exportSettings, includeNotes: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Include Flashcards</h4>
                  <p className="text-sm text-muted-foreground">
                    Add flashcards with questions and answers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={exportSettings.includeFlashcards}
                  onChange={(e) => setExportSettings({ ...exportSettings, includeFlashcards: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Include Kanban Tasks</h4>
                  <p className="text-sm text-muted-foreground">
                    Add learning tasks and progress tracking
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={exportSettings.includeKanban}
                  onChange={(e) => setExportSettings({ ...exportSettings, includeKanban: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  PDF Layout Style
                </label>
                <select
                  value={exportSettings.pdfLayout}
                  onChange={(e) => setExportSettings({ ...exportSettings, pdfLayout: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="standard">Standard - Clean and simple</option>
                  <option value="compact">Compact - More content per page</option>
                  <option value="study-guide">Study Guide - Optimized for printing</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSaveExportSettings} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Export Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>
              Export your data or delete your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Export All Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download all your study packs, notes, and account data
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-800">Delete Account</h4>
                <p className="text-sm text-red-600">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>About StudyFlow AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Version</h4>
                <p className="text-sm text-muted-foreground">1.0.0 (MVP)</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Support</h4>
                <p className="text-sm text-muted-foreground">
                  <a href="mailto:support@studyflow.ai" className="text-primary hover:underline">
                    support@studyflow.ai
                  </a>
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Privacy Policy</h4>
                <p className="text-sm text-muted-foreground">
                  <a href="/privacy" className="text-primary hover:underline">
                    View Privacy Policy
                  </a>
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Terms of Service</h4>
                <p className="text-sm text-muted-foreground">
                  <a href="/terms" className="text-primary hover:underline">
                    View Terms of Service
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}