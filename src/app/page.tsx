import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, FileText, PlayCircle, Image, Zap, Users, Star } from 'lucide-react'

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
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Transform Your Study Materials with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload PDFs, audio, video, or images and get AI-generated summaries, flashcards, and interactive study plans in seconds.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How OpusMentis Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Upload Content</CardTitle>
                <CardDescription>
                  Support for PDFs, documents, audio/video files, and images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• PDF documents up to 200 pages</li>
                  <li>• Audio/video up to 3 hours</li>
                  <li>• Images with OCR processing</li>
                  <li>• Automatic text extraction</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI Processing</CardTitle>
                <CardDescription>
                  Advanced AI analyzes your content and creates study materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• OpenAI Whisper transcription</li>
                  <li>• Intelligent summarization</li>
                  <li>• Automatic flashcard generation</li>
                  <li>• Kanban task creation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Study & Export</CardTitle>
                <CardDescription>
                  Interactive study modes with export capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Interactive flashcards</li>
                  <li>• Drag-and-drop Kanban boards</li>
                  <li>• Note-taking system</li>
                  <li>• PDF export functionality</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for trying out OpusMentis</CardDescription>
                <div className="text-3xl font-bold">₱0<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 3 uploads per month</li>
                  <li>• PDFs up to 10 pages</li>
                  <li>• Audio/video up to 10 minutes</li>
                  <li>• Basic summaries</li>
                  <li>• Flashcards & Kanban</li>
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full mt-6">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For serious students and learners</CardDescription>
                <div className="text-3xl font-bold">₱149<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Unlimited uploads</li>
                  <li>• PDFs up to 50 pages</li>
                  <li>• Audio/video up to 1 hour</li>
                  <li>• Advanced AI processing</li>
                  <li>• Export to PDF</li>
                  <li>• Priority support</li>
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full mt-6">Upgrade to Pro</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>For teams and power users</CardDescription>
                <div className="text-3xl font-bold">₱399<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Everything in Pro</li>
                  <li>• PDFs up to 200 pages</li>
                  <li>• Audio/video up to 3 hours</li>
                  <li>• Team sharing</li>
                  <li>• Advanced analytics</li>
                  <li>• Custom integrations</li>
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full mt-6">Upgrade to Premium</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">OpusMentis</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transforming education with AI-powered study tools for students worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/api-docs">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 OpusMentis by Opus Automations. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}