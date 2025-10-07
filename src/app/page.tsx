import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, FileText, PlayCircle, Image, Zap, Users, Star, Sparkles, BookOpen, CheckCircle, Upload, Wand2, Download } from 'lucide-react'
import PdfViewerDemo from '@/components/landing/pdf-viewer-demo'
import FlashcardDemo from '@/components/landing/flashcard-demo'
import KanbanDemo from '@/components/landing/kanban-demo'
import AiSummaryDemo from '@/components/landing/ai-summary-demo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
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

      {/* Hero Section */}
      <section className="relative py-20 text-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent -z-10" />

        <div className="container mx-auto px-4">
          {/* AI Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Powered by Advanced AI</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-800 to-slate-900 bg-clip-text text-transparent leading-tight">
            Turn Boring PDFs into Study<br />Materials You'll Actually Enjoy 🎉
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload any PDF, video, or audio—and watch AI transform it into flashcards, summaries, and study plans in seconds. No more endless highlighting!
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Learning Free
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <PlayCircle className="mr-2 h-5 w-5" />
                See It In Action
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>3 free uploads to start</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 bg-muted/30">
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

            {/* Feature 6 */}
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Export Anywhere</CardTitle>
                <CardDescription>
                  Export your flashcards and summaries to PDF. Study offline, anytime!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 bg-gradient-to-b from-background to-muted/20">
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
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
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
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/50">
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Upload Your Content</h3>
              <p className="text-muted-foreground">
                Drop in your PDFs, audio lectures, or video recordings. We support all your study materials!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 to-slate-800 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">AI Does the Magic</h3>
              <p className="text-muted-foreground">
                Our advanced AI analyzes your content and creates summaries, flashcards, and study plans in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Study & Ace Your Exams</h3>
              <p className="text-muted-foreground">
                Use your personalized flashcards, summaries, and study plans to learn faster and retain more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No pressure, no tricks!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for trying out OpusMentis</CardDescription>
                <div className="text-3xl font-bold">₱0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>3 uploads per month</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>PDFs up to 10 pages</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Audio/video up to 10 minutes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Basic summaries & flashcards</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Kanban study boards</span>
                  </li>
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full" variant="outline">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Most Popular
                </span>
              </div>
              <CardHeader className="pt-8">
                <CardTitle>Pro</CardTitle>
                <CardDescription>For serious students and learners</CardDescription>
                <div className="text-3xl font-bold">₱149<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span><strong>50 uploads/month</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>PDFs up to 50 pages</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Audio/video up to 1 hour</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Advanced AI processing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Export to PDF</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                    Upgrade to Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>For teams and power users</CardDescription>
                <div className="text-3xl font-bold">₱399<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span><strong>Unlimited uploads</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>PDFs up to 200 pages</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Audio/video up to 3 hours</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Team sharing & collaboration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full" variant="outline">Upgrade to Premium</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-gradient-to-b from-muted/30 to-muted/60">
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
