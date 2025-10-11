'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  FileText,
  Sparkles,
  LayoutGrid,
  StickyNote,
  Download,
  Zap,
  Video,
  Image as ImageIcon,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Crown,
  Upload,
  Lightbulb,
  Target,
  Rocket,
  MessageCircle
} from 'lucide-react'
import { ForceLightMode } from '@/components/force-light-mode'

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: Upload,
      title: 'Multi-Format Upload',
      description: 'Upload PDFs, audio files, videos, and images. Our AI handles everything.',
      details: [
        'PDF documents up to 500 pages',
        'Audio/video up to 10 hours',
        'Image-based content with OCR',
        'Automatic text extraction'
      ]
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Summaries',
      description: 'Get instant, intelligent summaries of your study materials using advanced AI.',
      details: [
        'Key concepts extraction',
        'Topic organization',
        'Main ideas highlighted',
        'Context-aware processing'
      ]
    },
    {
      icon: LayoutGrid,
      title: 'Smart Flashcards',
      description: 'Automatically generated flashcards with spaced repetition tracking.',
      details: [
        'AI-generated Q&A pairs',
        'Difficulty ratings',
        'Progress tracking',
        'Export functionality'
      ]
    },
    {
      icon: Target,
      title: 'Kanban Task Boards',
      description: 'Organize your learning objectives with drag-and-drop task management.',
      details: [
        'Visual task organization',
        'Progress categories',
        'Drag-and-drop interface',
        'Custom task creation'
      ]
    },
    {
      icon: StickyNote,
      title: 'Personal Notes',
      description: 'Add your own notes and annotations to any study pack.',
      details: [
        'Section-based organization',
        'Rich text support',
        'Easy editing',
        'Searchable content'
      ]
    },
    {
      icon: Download,
      title: 'PDF Export',
      description: 'Export your summaries, flashcards, and notes as PDF documents.',
      details: [
        'Professional formatting',
        'Includes all content',
        'Print-ready',
        'Shareable files'
      ]
    },
    {
      icon: MessageCircle,
      title: 'AI Chat Assistant',
      description: 'Get instant answers from an AI tutor that knows your study materials inside out.',
      details: [
        'Natural language questions',
        'Context-aware responses',
        'On-demand flashcard generation',
        'Available on every page'
      ]
    }
  ]

  const advancedFeatures = [
    {
      icon: FileText,
      title: 'PDF Highlighting',
      description: 'Highlight and annotate PDFs directly in the browser with color-coded markers.',
      badge: 'Interactive'
    },
    {
      icon: Rocket,
      title: 'Quiz Generation',
      description: 'AI-powered quiz creation with multiple question types and instant grading.',
      badge: 'AI-Powered'
    },
    {
      icon: Video,
      title: 'Video Processing',
      description: 'Extract transcripts and key insights from lecture recordings and tutorials.',
      badge: 'Smart'
    },
    {
      icon: Headphones,
      title: 'Audio Transcription',
      description: 'Convert audio lectures to text with advanced speech recognition for searchable notes.',
      badge: 'Accurate'
    },
    {
      icon: ImageIcon,
      title: 'OCR Technology',
      description: 'Extract text from images, screenshots, and scanned documents.',
      badge: 'Powerful'
    },
    {
      icon: Lightbulb,
      title: 'Smart Insights',
      description: 'Get AI-generated insights and connections between different topics.',
      badge: 'Intelligent'
    },
    {
      icon: MessageCircle,
      title: 'AI Chat Tutor',
      description: 'Chat with an AI assistant trained on your study materials for personalized help.',
      badge: '24/7 Available'
    }
  ]

  const workflowSteps = [
    {
      step: '1',
      title: 'Upload Your Content',
      description: 'Drag and drop PDFs, audio, video, or images. We support all common formats.'
    },
    {
      step: '2',
      title: 'AI Processing',
      description: 'Our AI analyzes your content and extracts key information automatically.'
    },
    {
      step: '3',
      title: 'Study & Review',
      description: 'Use flashcards, summaries, kanban boards, and AI chat tutor to master your material.'
    },
    {
      step: '4',
      title: 'Export & Share',
      description: 'Download your study materials as PDFs or share with your team.'
    }
  ]

  return (
    <ForceLightMode>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">OpusMentis</span>
            </Link>
            <div className="flex items-center gap-4">
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Learning Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Everything You Need to Study Smarter
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Transform any content into organized, AI-enhanced study materials. Upload once, study everywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Core Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to transform your study materials into actionable learning resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg w-fit">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to enhance your learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <Badge variant="secondary">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From upload to mastery in four simple steps
            </p>
          </div>

          <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((item, index) => (
              <div key={index} className="relative z-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 relative z-20">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-100%-2rem)] h-0.5 bg-muted -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Comparison */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Feature Availability
            </h2>
            <p className="text-lg text-muted-foreground">
              Compare features across different plans
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 pb-4 border-b font-semibold">
                  <div>Feature</div>
                  <div className="text-center">Free</div>
                  <div className="text-center">Pro</div>
                  <div className="text-center">Premium</div>
                </div>

                {[
                  { feature: 'Monthly Uploads', free: '20', pro: '200', premium: '1000' },
                  { feature: 'PDF Pages', free: '50', pro: '200', premium: '500' },
                  { feature: 'Audio/Video Length', free: '30 min', pro: '3 hours', premium: '10 hours' },
                  { feature: 'Max File Size', free: '100MB', pro: '250MB', premium: '500MB' },
                  { feature: 'AI Summaries', free: '✓', pro: '✓', premium: '✓' },
                  { feature: 'Flashcards', free: '✓', pro: '✓', premium: '✓' },
                  { feature: 'Kanban Boards', free: '✓', pro: '✓', premium: '✓' },
                  { feature: 'AI Chat Assistant', free: 'Basic', pro: 'Unlimited', premium: 'Priority' },
                  { feature: 'PDF Export', free: '—', pro: '✓', premium: '✓' },
                  { feature: 'Team Sharing', free: '—', pro: '—', premium: '✓' },
                  { feature: 'Priority Support', free: '—', pro: '✓', premium: '✓' },
                ].map((row, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 py-3 border-b last:border-0">
                    <div className="font-medium">{row.feature}</div>
                    <div className="text-center text-muted-foreground">{row.free}</div>
                    <div className="text-center text-muted-foreground">{row.pro}</div>
                    <div className="text-center text-muted-foreground">{row.premium}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button size="lg">
                View Full Pricing Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-12 text-center">
              <Crown className="h-12 w-12 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join students and learners who are already using OpusMentis to study smarter,
                not harder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary">
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 OpusMentis by Opus Automations. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </ForceLightMode>
  )
}
