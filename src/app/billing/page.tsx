'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import DashboardLayout from '@/components/dashboard-layout'
import { CheckCircle2, Crown, Zap, Users, CreditCard, Upload, Camera, Copy, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import { clerkTierToAppTier } from '@/lib/subscription-utils'

interface UserSubscription {
  tier: 'free' | 'pro' | 'premium'
  billingPeriod?: 'monthly' | 'annual'
  pendingProof?: boolean
  rejectedProof?: boolean
  expiresAt?: Date | null
}

interface UpgradePricing {
  fullPrice: number
  proratedCredit: number
  finalPrice: number
  daysRemaining: number
}

// GCash Payment Details (configurable)
const GCASH_PAYMENT_INFO = {
  number: '+639559918754',
  altNumber: '09559918754',
  name: 'CARL ANTHONY H.',
  qrCodeUrl: '/gcash-qr.png'
}

export default function BillingPage() {
  const { user } = useUser()
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: 'free'
  })
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)
  const [upgradePricing, setUpgradePricing] = useState<UpgradePricing | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(false)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      // Get subscription tier and expiration from API
      const subResponse = await fetch('/api/subscription/status')
      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscription({
          tier: subData.tier,
          billingPeriod: subData.billingPeriod || 'monthly',
          expiresAt: subData.expiresAt ? new Date(subData.expiresAt) : null
        })
      } else {
        // Fallback to Clerk metadata
        const clerkTier = user?.publicMetadata?.plan as string || 'free_plan'
        const appTier = clerkTierToAppTier(clerkTier)
        setSubscription({ tier: appTier })
      }

      // Check for pending payment proofs
      const response = await fetch('/api/payment-proofs/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(prev => ({
          ...prev,
          pendingProof: data.hasPending,
          rejectedProof: data.hasRejected
        }))
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

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
        'AI summaries & flashcards',
        'Kanban study boards',
        'AI Chat Assistant (basic)',
        'Community support'
      ],
      limitations: [
        'Limited uploads',
        'Basic features only',
        'No priority support'
      ],
      icon: Zap,
      color: 'border-gray-200'
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 149,
      annualPrice: 1490, // 10 months price = 2 months free
      originalMonthlyPrice: 298,
      originalAnnualPrice: 1788,
      description: 'Best for students and regular learners',
      features: [
        '200 uploads/month',
        'PDFs up to 200 pages',
        'Audio/video up to 3 hours',
        'Advanced AI processing',
        'PDF export functionality',
        'Unlimited AI Chat Assistant',
        'Priority support',
        'Custom study settings'
      ],
      popular: true,
      icon: Crown,
      color: 'border-blue-500'
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 399,
      annualPrice: 3990, // 10 months price = 2 months free
      originalMonthlyPrice: 798,
      originalAnnualPrice: 4788,
      description: 'For power users and teams',
      features: [
        '1000 uploads/month',
        'PDFs up to 500 pages',
        'Audio/video up to 10 hours',
        'Team sharing capabilities',
        'Priority AI Chat Assistant',
        'Advanced analytics',
        'Custom integrations',
        'White-label options',
        'Dedicated account manager'
      ],
      icon: Users,
      color: 'border-purple-500'
    }
  ]

  // Calculate display price based on billing period
  const getDisplayPrice = (plan: typeof plans[0]) => {
    if (plan.id === 'free') return '₱0'

    if (isAnnual) {
      return `₱${plan.annualPrice.toLocaleString()}`
    }
    return `₱${plan.monthlyPrice}`
  }

  const getDisplayPeriod = (plan: typeof plans[0]) => {
    if (plan.id === 'free') return '/month'
    return isAnnual ? '/year' : '/month'
  }

  const getSavingsText = (plan: typeof plans[0]) => {
    if (plan.id === 'free' || !isAnnual) return null
    const monthlyCost = plan.monthlyPrice * 12
    const annualCost = plan.annualPrice
    const savings = monthlyCost - annualCost
    return `Save ₱${savings}`
  }

  const fetchUpgradePricing = async (planId: string, billingPeriod: 'monthly' | 'annual') => {
    const plan = plans.find(p => p.id === planId)
    if (!plan || plan.id === 'free') return

    setLoadingPricing(true)
    try {
      const response = await fetch(
        `/api/subscription/upgrade-pricing?tier=${planId}&billingPeriod=${billingPeriod}&annualPrice=${plan.annualPrice}&monthlyPrice=${plan.monthlyPrice}`
      )
      if (response.ok) {
        const pricing = await response.json()
        setUpgradePricing(pricing)
      }
    } catch (error) {
      console.error('Error fetching upgrade pricing:', error)
    } finally {
      setLoadingPricing(false)
    }
  }

  const handleUpgrade = async (planId: string, billingPeriod: 'monthly' | 'annual' = isAnnual ? 'annual' : 'monthly') => {
    setSelectedPlan(planId)
    await fetchUpgradePricing(planId, billingPeriod)
    setShowPaymentModal(true)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setPaymentProof(acceptedFiles[0])
      }
    }
  })

  const handleSubmitPaymentProof = async () => {
    if (!paymentProof || !selectedPlan) {
      toast.error('Please upload payment proof and enter reference number')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', paymentProof)
      formData.append('planRequested', selectedPlan)
      formData.append('referenceNumber', referenceNumber)
      formData.append('billingPeriod', isAnnual ? 'annual' : 'monthly')

      // Use the prorated amount if applicable, otherwise use the full price
      const selectedPlanData = plans.find(p => p.id === selectedPlan)
      let amount: string

      if (upgradePricing && upgradePricing.proratedCredit > 0) {
        // User is upgrading from monthly to annual with credit
        amount = `₱${upgradePricing.finalPrice.toLocaleString()}`
      } else {
        // Regular upgrade or new subscription
        amount = isAnnual
          ? `₱${selectedPlanData?.annualPrice.toLocaleString()}`
          : `₱${selectedPlanData?.monthlyPrice}`
      }
      formData.append('amount', amount)

      const response = await fetch('/api/payment-proofs', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to submit payment proof')
      }

      toast.success('Payment proof submitted! We will review it within 24 hours.')
      setShowPaymentModal(false)
      setPaymentProof(null)
      setReferenceNumber('')
      setSelectedPlan(null)
      fetchSubscriptionData()
    } catch (error) {
      console.error('Payment proof submission error:', error)
      toast.error('Failed to submit payment proof')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <DashboardLayout
      title="Billing & Subscription"
      subtitle="Manage your OpusMentis subscription with GCash payments"
    >
      <div className="space-y-8">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Current Plan</span>
            </CardTitle>
            <CardDescription>
              Your current subscription details and payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="secondary"
                    className={
                      subscription.tier === 'free'
                        ? 'bg-gray-100 text-gray-800'
                        : subscription.tier === 'pro'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }
                  >
                    {subscription.tier.toUpperCase()}
                    {subscription.tier !== 'free' && subscription.billingPeriod && (
                      <span className="ml-1">
                        ({subscription.billingPeriod === 'annual' ? 'Annual' : 'Monthly'})
                      </span>
                    )}
                  </Badge>
                  {subscription.pendingProof && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                      Payment Under Review
                    </Badge>
                  )}
                  {subscription.rejectedProof && (
                    <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">
                      Payment Rejected - Please Resubmit
                    </Badge>
                  )}
                </div>

                {/* Expiration Information */}
                {subscription.tier !== 'free' && subscription.expiresAt && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Expires:</span>{' '}
                      {new Date(subscription.expiresAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {/* Show days remaining */}
                      {(() => {
                        const daysRemaining = Math.ceil((new Date(subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        return daysRemaining > 0 ? (
                          <span className={`ml-2 ${daysRemaining <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                            ({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining)
                          </span>
                        ) : (
                          <span className="ml-2 text-red-600">(Expired)</span>
                        )
                      })()}
                    </p>
                  </div>
                )}

                {subscription.pendingProof && (
                  <p className="text-sm text-muted-foreground mt-2">
                    We're reviewing your payment proof. You'll be upgraded within 24 hours.
                  </p>
                )}
                {subscription.rejectedProof && (
                  <p className="text-sm text-red-600 mt-2">
                    Your payment proof was rejected. Please check the amount and try again.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Upgrade with GCash payment - instant activation after verification
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
              <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Annual
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  Save 17%
                </Badge>
              </Label>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const PlanIcon = plan.icon
              const isCurrentPlan = plan.id === subscription.tier
              const isPopular = plan.popular

              // Determine if this plan is a downgrade
              const tierOrder = { free: 0, pro: 1, premium: 2 }
              const currentTierLevel = tierOrder[subscription.tier]
              const planTierLevel = tierOrder[plan.id as keyof typeof tierOrder]
              const isDowngrade = planTierLevel < currentTierLevel

              // Check if this is a billing period upgrade (same tier, different period)
              const isBillingPeriodUpgrade =
                plan.id === subscription.tier &&
                subscription.billingPeriod === 'monthly' &&
                isAnnual

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
                      {isCurrentPlan && !isBillingPeriodUpgrade && (
                        <Badge variant="outline" className="ml-auto">
                          Current
                        </Badge>
                      )}
                      {isBillingPeriodUpgrade && (
                        <Badge className="ml-auto bg-green-500 text-white">
                          Upgrade Available
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      {plan.id !== 'free' && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-lg text-muted-foreground line-through">
                            ₱{isAnnual ? (plan as any).originalAnnualPrice?.toLocaleString() : (plan as any).originalMonthlyPrice}
                          </span>
                          <Badge className="bg-red-500 text-white font-bold">
                            -50%
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary">{getDisplayPrice(plan)}</span>
                        <span className="text-muted-foreground">{getDisplayPeriod(plan)}</span>
                      </div>
                      {getSavingsText(plan) && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          {getSavingsText(plan)}
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

                    {plan.limitations && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                          Limitations:
                        </h4>
                        <ul className="space-y-1">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="text-xs text-muted-foreground">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {isCurrentPlan && !isBillingPeriodUpgrade ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : isDowngrade && !isBillingPeriodUpgrade ? (
                      <Button disabled className="w-full" variant="outline">
                        Lower Tier
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id, isAnnual ? 'annual' : 'monthly')}
                        disabled={loading || subscription.pendingProof}
                        variant={isBillingPeriodUpgrade || isPopular ? "default" : "outline"}
                      >
                        {subscription.pendingProof
                          ? 'Payment Under Review'
                          : isBillingPeriodUpgrade
                          ? 'Upgrade to Annual'
                          : `Upgrade to ${plan.name}`
                        }
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>GCash Payment Instructions</DialogTitle>
              <DialogDescription>
                Follow these steps to upgrade to {plans.find(p => p.id === selectedPlan)?.name} plan ({isAnnual ? 'Annual' : 'Monthly'})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Step 1: Payment Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Step 1: Send GCash Payment</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-medium mb-2">Payment Details</h4>
                      <div className="space-y-2 text-sm">
                        {upgradePricing && upgradePricing.proratedCredit > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span>Full Price:</span>
                              <span className="font-medium">₱{upgradePricing.fullPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-700">
                              <span>Prorated Credit ({upgradePricing.daysRemaining} days remaining):</span>
                              <span className="font-medium">-₱{upgradePricing.proratedCredit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-blue-200">
                              <span className="font-semibold">Amount to Pay:</span>
                              <span className="font-bold text-lg">₱{upgradePricing.finalPrice.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        {(!upgradePricing || upgradePricing.proratedCredit === 0) && (
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span className="font-medium">
                              {(() => {
                                const plan = plans.find(p => p.id === selectedPlan)
                                return plan ? getDisplayPrice(plan) : '₱0'
                              })()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Billing Period:</span>
                          <span className="font-medium">{isAnnual ? 'Annual' : 'Monthly'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>GCash Number:</span>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="font-medium">{GCASH_PAYMENT_INFO.number}</div>
                              <div className="text-xs text-muted-foreground">{GCASH_PAYMENT_INFO.altNumber}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(GCASH_PAYMENT_INFO.number)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Account Name:</span>
                          <span className="font-medium">{GCASH_PAYMENT_INFO.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {upgradePricing && upgradePricing.proratedCredit > 0 ? (
                        <>
                          <p className="font-semibold text-green-700 mb-2">
                            🎉 You're getting ₱{upgradePricing.proratedCredit.toLocaleString()} credit for your remaining {upgradePricing.daysRemaining} days!
                          </p>
                          <p>• Send exactly ₱{upgradePricing.finalPrice.toLocaleString()} to the GCash number above</p>
                          <p>• Save the transaction receipt/screenshot</p>
                          <p>• Upload the proof in Step 2 below</p>
                        </>
                      ) : (
                        <>
                          <p>• Send the exact amount to the GCash number above</p>
                          <p>• Save the transaction receipt/screenshot</p>
                          <p>• Upload the proof in Step 2 below</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={GCASH_PAYMENT_INFO.qrCodeUrl}
                        alt="GCash QR Code"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Scan this QR code with your GCash app
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload Proof */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Step 2: Upload Payment Proof</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">GCash Reference Number</label>
                    <Input
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Enter your GCash reference number"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Screenshot/Receipt</label>
                    <div
                      {...getRootProps()}
                      className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      {paymentProof ? (
                        <p className="text-sm font-medium">{paymentProof.name}</p>
                      ) : (
                        <div>
                          <p className="text-sm font-medium">Upload payment screenshot</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitPaymentProof}
                      disabled={loading || !paymentProof || !referenceNumber}
                    >
                      {loading ? 'Submitting...' : 'Submit Payment Proof'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Payment FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">How long does verification take?</h4>
                <p className="text-sm text-muted-foreground">
                  We verify payments within 24 hours during business days. You'll be upgraded immediately after approval.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">What if my payment is rejected?</h4>
                <p className="text-sm text-muted-foreground">
                  If rejected, you can resubmit with a clearer screenshot or correct amount. Common issues: wrong amount, unclear image.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Can I pay monthly or yearly?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! We offer both monthly and annual billing. Annual subscriptions save you 17% (2 months free). Use the toggle above to switch between billing periods.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Can I upgrade from monthly to annual?</h4>
                <p className="text-sm text-muted-foreground">
                  Absolutely! When you upgrade from monthly to annual, we'll calculate the remaining value of your monthly subscription and apply it as a credit towards your annual payment. Just toggle to "Annual" and click "Upgrade to Annual" on your current plan.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Is my payment secure?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, all payments go through GCash's secure platform. We only see your receipt screenshot for verification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}