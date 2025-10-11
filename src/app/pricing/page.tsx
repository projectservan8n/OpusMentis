'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Crown, Zap, Users, ArrowRight, Brain } from 'lucide-react'
import { ForceLightMode } from '@/components/force-light-mode'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for trying out OpusMentis',
      features: [
        '20 uploads per month',
        'PDFs up to 50 pages',
        'Audio/video up to 30 minutes',
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
      monthlyPrice: 149,
      annualPrice: 1490,
      originalMonthlyPrice: 298,
      originalAnnualPrice: 1788,
      description: 'Best for students and regular learners',
      features: [
        '200 uploads/month',
        'PDFs up to 200 pages',
        'Audio/video up to 3 hours',
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
      monthlyPrice: 399,
      annualPrice: 3990,
      originalMonthlyPrice: 798,
      originalAnnualPrice: 4788,
      description: 'For power users and teams',
      features: [
        '1000 uploads/month',
        'PDFs up to 500 pages',
        'Audio/video up to 10 hours',
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
          <div className="flex items-center justify-center gap-4 bg-muted/50 p-4 rounded-lg mb-4 max-w-md mx-auto">
            <Label htmlFor="billing-toggle" className={`text-lg font-semibold cursor-pointer ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={billingPeriod === 'annual'}
              onCheckedChange={(checked) => setBillingPeriod(checked ? 'annual' : 'monthly')}
              className="data-[state=checked]:bg-primary scale-125"
            />
            <Label htmlFor="billing-toggle" className={`text-lg font-semibold cursor-pointer ${billingPeriod === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 text-sm">
                Save 17%
              </Badge>
            </Label>
          </div>

          <p className="text-sm text-muted-foreground">
            Pay via GCash. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const PlanIcon = plan.icon
              const isPopular = plan.popular

              return (
                <Card
                  key={plan.id}
                  className={`relative ${plan.color} ${isPopular ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <PlanIcon className="h-6 w-6 text-primary" />
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      {plan.id !== 'free' && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-lg text-muted-foreground line-through">
                            ₱{billingPeriod === 'annual' ? (plan as any).originalAnnualPrice?.toLocaleString() : (plan as any).originalMonthlyPrice}
                          </span>
                          <Badge className="bg-red-500 text-white font-bold">
                            -50%
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary">
                          {plan.id === 'free' ? '₱0' : `₱${billingPeriod === 'annual' ? plan.annualPrice.toLocaleString() : plan.monthlyPrice}`}
                        </span>
                        <span className="text-muted-foreground">
                          {billingPeriod === 'monthly' ? '/month' : '/year'}
                        </span>
                      </div>
                      {billingPeriod === 'annual' && plan.id !== 'free' && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          Save ₱{plan.monthlyPrice * 12 - plan.annualPrice}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link href="/billing">
                      <Button
                        className="w-full"
                        variant={isPopular ? "default" : "outline"}
                      >
                        {plan.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
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
    </ForceLightMode>
  )
}
