'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, FileText, PlayCircle, Image, Zap, Users, Star, Sparkles, BookOpen, CheckCircle, Upload, Wand2, Download, MessageCircle, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

// Lazy load demo components for better performance
const PdfViewerDemo = dynamic(() => import('@/components/landing/pdf-viewer-demo'), {
  loading: () => <DemoSkeleton />,
  ssr: false
})
const FlashcardDemo = dynamic(() => import('@/components/landing/flashcard-demo'), {
  loading: () => <DemoSkeleton />,
  ssr: false
})
const KanbanDemo = dynamic(() => import('@/components/landing/kanban-demo'), {
  loading: () => <DemoSkeleton />,
  ssr: false
})
const AiSummaryDemo = dynamic(() => import('@/components/landing/ai-summary-demo'), {
  loading: () => <DemoSkeleton />,
  ssr: false
})
const AiChatDemo = dynamic(() => import('@/components/landing/ai-chat-demo'), {
  loading: () => <DemoSkeleton />,
  ssr: false
})

// Demo loading skeleton
function DemoSkeleton() {
  return (
    <Card className="w-full h-96 flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading demo...</p>
      </div>
    </Card>
  )
}

export default function HomePage() {
  // Set SEO meta tags
  useEffect(() => {
    document.title = 'OpusMentis - AI-Powered Study Assistant | Transform PDFs into Flashcards'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Upload PDFs, audio, or video and watch AI transform them into flashcards, summaries, and study plans in seconds. Free plan available. No credit card required.')
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">OpusMentis</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/features">
              <Button variant="ghost">Features</Button>
            </Link>
            <Link href="/billing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started Free</Button>
            </Link>
          </div>
          {/* Mobile menu - simplified */}
          <div className="md:hidden">
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 text-center overflow-hidden">
        <div className="container mx-auto px-4">
          {/* AI Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Powered by Advanced AI</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary leading-tight">
            Turn Boring PDFs into Study<br />Materials You'll Actually Enjoy
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload any PDF, video, or audio—and watch AI transform it into flashcards, summaries, and study plans in seconds. No more endless highlighting!
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Learning Free
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover:bg-primary/10 hover:text-primary">
                <PlayCircle className="mr-2 h-5 w-5" />
                See It In Action
              </Button>
            </Link>
          </div>

          {/* Trust Indicators - Enhanced */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 max-w-2xl mx-auto">
            <Card className="border-green-200 bg-green-50/50 px-4 py-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">No credit card required</span>
              </div>
            </Card>
            <Card className="border-blue-200 bg-blue-50/50 px-4 py-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Free forever plan</span>
              </div>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50 px-4 py-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Cancel anytime</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Study Smarter 🚀</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              OpusMentis packs all the study tools you need into one simple, powerful platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>AI-Powered Summaries</CardTitle>
                <CardDescription>
                  Get the key points instantly—no more reading the same paragraph 5 times
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <Wand2 className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Auto-Generated Flashcards</CardTitle>
                <CardDescription>
                  Flashcards created for you in seconds. Just upload, study, and ace your exams!
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-slate-600" />
                </div>
                <CardTitle>Smart Study Plans</CardTitle>
                <CardDescription>
                  Kanban boards that organize your tasks so you actually know what to study next
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>PDF & Audio Support</CardTitle>
                <CardDescription>
                  Upload PDFs, audio lectures, or video recordings—we handle them all!
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Process your study materials in seconds, not hours. More time for actually studying!
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6: AI Chat Assistant */}
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>AI Chat Assistant</CardTitle>
                <CardDescription>
                  Chat with an AI tutor that knows your study materials inside out—get instant answers!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See OpusMentis In Action ✨</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how we transform your study materials into interactive, engaging content
            </p>
          </div>

          {/* Demo 1: PDF Viewer */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20 max-w-6xl mx-auto">
            <div className="order-2 md:order-1">
              <PdfViewerDemo />
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full mb-4 text-sm font-semibold">
                <span>📄 Smart PDF Reading</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Highlight & Extract Like a Pro</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Our intelligent PDF viewer lets you highlight important sections and automatically extracts them into study materials.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Multi-color highlighting for better organization</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Instant highlight summaries in the sidebar</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>One-click quiz generation from highlights</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Demo 2: Flashcards */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20 max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full mb-4 text-sm font-semibold">
                <span>🎴 Interactive Flashcards</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Study Cards That Actually Work</h3>
              <p className="text-lg text-muted-foreground mb-6">
                AI-generated flashcards that adapt to your learning style. No more spending hours making cards manually!
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Auto-generated questions and answers from your PDFs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Beautiful, interactive card flipping animation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Export to PDF or study online—your choice!</span>
                </li>
              </ul>
            </div>
            <div>
              <FlashcardDemo />
            </div>
          </div>

          {/* Demo 3: Kanban */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20 max-w-6xl mx-auto">
            <div className="order-2 md:order-1">
              <KanbanDemo />
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full mb-4 text-sm font-semibold">
                <span>📋 Study Plan Boards</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Organize Your Study Tasks</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Never feel overwhelmed again. Our Kanban boards break down your study materials into bite-sized, manageable tasks.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>AI creates tasks based on your content complexity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Drag-and-drop interface to track your progress</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Visual progress tracking keeps you motivated</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Demo 4: AI Summary */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20 max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full mb-4 text-sm font-semibold">
                <span>🤖 AI Intelligence</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Smart Summaries That Save Hours</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Our AI reads your entire document and creates comprehensive summaries with key topics, flashcards, and quizzes—all automatically.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Extracts main ideas and key takeaways instantly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Identifies and tags important topics automatically</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Generates practice quizzes to test your knowledge</span>
                </li>
              </ul>
            </div>
            <div>
              <AiSummaryDemo />
            </div>
          </div>

          {/* Demo 5: AI Chat Assistant */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 md:order-1">
              <AiChatDemo />
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full mb-4 text-sm font-semibold">
                <span>💬 AI Chat Assistant</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Your Personal Study Tutor, 24/7</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Get instant answers to questions about your study materials. The AI Chat Assistant understands your content and helps you learn faster with personalized explanations.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Ask questions in natural language—no complex commands</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Get explanations tailored to your study materials</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Generate flashcards and quizzes on-demand</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Available while studying—floats on every page</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your study game
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Upload Your Content</h3>
              <p className="text-muted-foreground">
                Drop in your PDFs, audio lectures, or video recordings. We support all your study materials!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">AI Does the Magic</h3>
              <p className="text-muted-foreground">
                Our advanced AI analyzes your content and creates summaries, flashcards, study plans, and an AI chat assistant—all in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Study & Ace Your Exams</h3>
              <p className="text-muted-foreground">
                Use your personalized flashcards, summaries, study plans, and AI tutor to learn faster and retain more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about OpusMentis
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does the AI processing work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Upload your study materials (PDFs, audio, video, or images), and our AI analyzes the content to extract key concepts, generate summaries, create flashcards, and build study plans—all automatically in seconds.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is there really a free plan?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! The free plan includes 20 uploads per month, AI summaries, flashcards, kanban boards, and basic AI chat assistance. No credit card required to start.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What file formats do you support?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We support PDFs (up to 500 pages), audio files (MP3, WAV), video files (MP4, MOV), and images (JPG, PNG). Our AI can extract text from all these formats using OCR and speech recognition.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I export my study materials?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Pro and Premium users can export their summaries, flashcards, and notes as professionally formatted PDFs. Perfect for offline studying or printing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does the AI Chat Assistant work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The AI Chat Assistant is trained on your uploaded study materials and can answer questions, explain concepts, and even generate flashcards on-demand. It's like having a personal tutor available 24/7.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We currently accept GCash payments for Filipino users. Simply upload your payment proof, and we'll activate your subscription within 24 hours. More payment options coming soon!
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Still have questions?</p>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t p-4 shadow-lg">
        <Link href="/sign-up" className="block">
          <Button className="w-full" size="lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Start Learning Free
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t py-12 pb-24 md:pb-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">OpusMentis</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making studying easier and more fun for students everywhere! 🚀
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/api-docs" className="hover:text-primary transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Made with 💙 for students everywhere
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; 2024 OpusMentis by Opus Automations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
