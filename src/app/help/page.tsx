'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Upload,
  FileText,
  Sparkles,
  CreditCard,
  Settings,
  HelpCircle,
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      category: 'Getting Started',
      question: 'How do I create my first study pack?',
      answer: 'Click "Upload" in the sidebar, select your file (PDF, audio, or video), and our AI will automatically generate summaries, flashcards, and a study plan. The process takes just a few seconds!'
    },
    {
      category: 'Getting Started',
      question: 'What file types are supported?',
      answer: 'OpusMentis supports PDFs, audio files (MP3, WAV), video files (MP4, MOV), and images (PNG, JPG). Each plan has different limits for file size and pages/duration.'
    },
    {
      category: 'Getting Started',
      question: 'How long does AI processing take?',
      answer: 'Most files are processed in 10-30 seconds. Larger files or videos may take up to 2 minutes. You can leave the page and come back - we\'ll notify you when it\'s ready!'
    },
    {
      category: 'Features',
      question: 'How do flashcards work?',
      answer: 'Our AI automatically generates question-answer pairs from your content. Tap the flashcard to flip and reveal the answer. We use spaced repetition to help you remember better - cards you struggle with appear more often.'
    },
    {
      category: 'Features',
      question: 'Can I edit AI-generated content?',
      answer: 'Yes! You can edit summaries, flashcards, and Kanban tasks. You can also regenerate content if you want a different AI approach.'
    },
    {
      category: 'Features',
      question: 'How do I export my study materials?',
      answer: 'Click the "Export" button on any study pack to download as PDF. Pro and Premium users can customize what gets included in the export (summaries, flashcards, notes, etc.).'
    },
    {
      category: 'Features',
      question: 'What is the Kanban board for?',
      answer: 'The Kanban board breaks your study material into actionable tasks organized in TODO, IN PROGRESS, and DONE columns. Drag and drop tasks as you complete them to track your study progress.'
    },
    {
      category: 'Subscription & Billing',
      question: 'What\'s included in the Free plan?',
      answer: 'Free plan includes 20 uploads per month, PDFs up to 50 pages, audio/video up to 30 minutes, AI summaries, flashcards, and Kanban boards. Perfect for trying out OpusMentis!'
    },
    {
      category: 'Subscription & Billing',
      question: 'How do I upgrade my plan?',
      answer: 'Go to Settings > Billing, choose your plan (Pro or Premium), and follow the GCash payment instructions. Upload your payment proof and we\'ll activate your subscription within 24 hours.'
    },
    {
      category: 'Subscription & Billing',
      question: 'Can I pay monthly or annually?',
      answer: 'Yes! We offer both monthly and annual billing. Annual subscriptions save you 17% (2 months free). Use the toggle on the billing page to switch between options.'
    },
    {
      category: 'Subscription & Billing',
      question: 'How does GCash payment verification work?',
      answer: 'After sending payment to our GCash number, upload a screenshot of your receipt with the reference number. Our team verifies payments within 24 hours on business days. You\'ll be upgraded immediately after approval.'
    },
    {
      category: 'Subscription & Billing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! You can cancel anytime from Settings > Billing. You\'ll continue to have access until the end of your billing period, then automatically switch to the Free plan.'
    },
    {
      category: 'Technical',
      question: 'My upload failed. What should I do?',
      answer: 'Check: 1) File size is within your plan limit, 2) File format is supported, 3) Internet connection is stable. If problems persist, contact support at team@opusautomations.com with the error message.'
    },
    {
      category: 'Technical',
      question: 'Can I use OpusMentis on mobile?',
      answer: 'Yes! OpusMentis works on all devices. The interface is fully responsive and optimized for mobile, tablet, and desktop use.'
    },
    {
      category: 'Technical',
      question: 'Is my data secure?',
      answer: 'Absolutely! We use Clerk for authentication (bank-level security), encrypt all files, and never share your data. Your study materials are private and only accessible by you.'
    },
    {
      category: 'Account',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Profile > Manage Profile in Clerk. From there you can update your password, email, and profile information.'
    },
    {
      category: 'Account',
      question: 'Can I delete my account?',
      answer: 'Yes, go to Settings > Data Management > Delete Account. This permanently deletes all your study packs and data. This action cannot be undone.'
    },
    {
      category: 'Account',
      question: 'How do I export all my data?',
      answer: 'Go to Settings > Data Management > Export All Data to download a JSON file with all your study packs, notes, and account data.'
    }
  ]

  const categories = ['All', 'Getting Started', 'Features', 'Subscription & Billing', 'Technical', 'Account']
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">OpusMentis</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find answers to common questions, learn how to use OpusMentis, or contact our support team
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                className="pl-10 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Link href="/help#getting-started">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Getting Started</h3>
                  <p className="text-sm text-muted-foreground">Learn the basics</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/help#features">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Features Guide</h3>
                  <p className="text-sm text-muted-foreground">Explore all features</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/help#billing">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <CreditCard className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Billing & Plans</h3>
                  <p className="text-sm text-muted-foreground">Manage subscription</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/help#contact">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">Get in touch</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No results found. Try a different search term.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFAQs.map((faq, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <button
                        className="w-full p-6 text-left flex items-center justify-between"
                        onClick={() => toggleFAQ(index)}
                      >
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {faq.category}
                          </Badge>
                          <h3 className="font-semibold text-lg">{faq.question}</h3>
                        </div>
                        {expandedFAQ === index ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                        )}
                      </button>
                      {expandedFAQ === index && (
                        <div className="px-6 pb-6">
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section id="contact" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our support team is here to help you succeed with OpusMentis
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get a response within 24 hours
                  </p>
                  <a href="mailto:team@opusautomations.com">
                    <Button>team@opusautomations.com</Button>
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat with us in real-time (Coming Soon)
                  </p>
                  <Button variant="outline" disabled>
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Made with 💙 for students everywhere</p>
            <p>&copy; 2024 OpusMentis by Opus Automations. All rights reserved.</p>
            <div className="mt-4 space-x-4">
              <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
              <Link href="/help" className="hover:text-primary">Help Center</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
