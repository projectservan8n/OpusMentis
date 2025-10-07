import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, FileText, PlayCircle, Image, Zap, Users, Star, Sparkles, BookOpen, CheckCircle } from 'lucide-react'
import PdfViewerDemo from '@/components/landing/pdf-viewer-demo'
import FlashcardDemo from '@/components/landing/flashcard-demo'
import KanbanDemo from '@/components/landing/kanban-demo'
import AiSummaryDemo from '@/components/landing/ai-summary-demo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">OpusMentis</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - More Energetic */}
      <section className="py-20 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 -z-10"></div>

        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Powered by Advanced AI
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Turn Boring PDFs into<br />
            Study Materials You'll<br />
            Actually Enjoy 🎉
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Upload any PDF, video, or audio file. Our AI instantly creates interactive flashcards,
            smart summaries, and organized study plans. No more endless note-taking!
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Learning Free
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                See How It Works →
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>3 free uploads/month</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Separate from "How It Works" */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Study Smarter 🚀
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform, endless possibilities. From PDFs to practice quizzes, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Smart PDF Highlights</CardTitle>
                <CardDescription>
                  Highlight important sections and generate quizzes from your highlights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>AI-Powered Summaries</CardTitle>
                <CardDescription>
                  Get instant, intelligent summaries of any document or lecture
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle>Interactive Flashcards</CardTitle>
                <CardDescription>
                  Auto-generated flashcards with spaced repetition for better retention
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Kanban Study Planner</CardTitle>
                <CardDescription>
                  Organize your study tasks with drag-and-drop boards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                  <PlayCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Audio/Video Transcription</CardTitle>
                <CardDescription>
                  Upload lectures and get searchable transcripts with timestamps
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Share study packs with your team or study group (Premium)
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
