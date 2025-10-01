'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Crown, Zap, Users, ArrowRight, Brain } from 'lucide-react'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: '₱0',
      annualPrice: '₱0',
      description: 'Perfect for trying out OpusMentis',
      features: [
        '3 uploads per month',
        'PDFs up to 10 pages',
        'Audio/video up to 10 minutes',
        'Basic AI summaries',
        'Flashcards & Kanban boards',
        'Community support'
      ],
      icon: Zap,
      color: 'border-gray-200',
      ctaText: 'Get Started',
      ctaVariant: 'outline' as const
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: '₱149',
      annualPrice: '₱1,490',
      annualSavings: '₱298',
      description: 'Best for students and regular learners',
      features: [
        'Unlimited uploads',
        'PDFs up to 50 pages',
        'Audio/video up to 1 hour',
        'Advanced AI processing',
        'PDF export functionality',
        'Priority support',
        'Custom study settings'
      ],
      popular: true,
      icon: Crown,
      color: 'border-blue-500',
      ctaText: 'Upgrade to Pro',
      ctaVariant: 'default' as const
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: '₱399',
      annualPrice: '₱3,990',
      annualSavings: '₱798',
      description: 'For power users and teams',
      features: [
        'Everything in Pro',
        'PDFs up to 200 pages',
        'Audio/video up to 3 hours',
        'Team sharing capabilities',
        'Advanced analytics',
        'Custom integrations',
        'White-label options',
        'Dedicated account manager'
      ],
      icon: Users,
      color: 'border-purple-500',
      ctaText: 'Upgrade to Premium',
      ctaVariant: 'default' as const
    }
  ]

  return (
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
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/billing">
                <Button>Go to Billing</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your learning journey. All plans include AI-powered study tools.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg mb-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-background shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-background shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 border-0">
                Save 17%
              </Badge>
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            Pay via GCash. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card
                  key={plan.id}
                  className={`relative ${plan.color} ${
                    plan.popular ? 'shadow-lg scale-105 border-2' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${
                        plan.id === 'free' ? 'bg-gray-100' :
                        plan.id === 'pro' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          plan.id === 'free' ? 'text-gray-600' :
                          plan.id === 'pro' ? 'text-blue-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                          {billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                        </span>
                        <span className="text-muted-foreground">
                          {billingPeriod === 'monthly' ? '/month' : '/year'}
                        </span>
                      </div>
                      {billingPeriod === 'annual' && plan.annualSavings && (
                        <p className="text-sm text-green-600 font-medium mt-2">
                          Save {plan.annualSavings} per year
                        </p>
                      )}
                      {billingPeriod === 'annual' && plan.id !== 'free' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Billed annually
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href="/billing">
                      <Button
                        className="w-full mb-6"
                        variant={plan.ctaVariant}
                      >
                        {plan.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I pay?</h3>
              <p className="text-muted-foreground">
                We accept payments via GCash. After selecting your plan, you'll be prompted to send payment
                and upload proof of payment for verification.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can cancel your subscription at any time. You'll continue to have access until
                the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What happens if I exceed my upload limit?</h3>
              <p className="text-muted-foreground">
                On the Free plan, you'll need to wait until next month or upgrade to continue uploading.
                Pro and Premium plans have unlimited uploads.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">
                Yes! You can change your plan at any time from the Billing page. Changes take effect
                in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is there a student discount?</h3>
              <p className="text-muted-foreground">
                Our Pro plan is already student-friendly at ₱149/month. Contact us if you represent
                an educational institution for bulk pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to supercharge your learning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students already using OpusMentis to study smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 OpusMentis by Opus Automations. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
