import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Mail, Phone, MapPin, MessageSquare, Facebook, Linkedin, Globe } from 'lucide-react'

export default function ContactPage() {
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
              <Link href="/pricing">
                <Button>View Pricing</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or need support? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Email</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  For general inquiries and support
                </p>
                <a
                  href="mailto:tony@opusautomations.com"
                  className="text-primary hover:underline font-medium"
                >
                  tony@opusautomations.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Phone</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  GCash / Contact Number
                </p>
                <a
                  href="tel:+639559918754"
                  className="text-primary hover:underline font-medium"
                >
                  +63 955 991 8754
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Website</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Powered by Opus Automations
                </p>
                <a
                  href="https://opusautomations.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  opusautomations.com
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Main Contact Section */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Let's Connect</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you have a question about features, pricing, technical support,
                or anything else, our team is ready to answer all your questions.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Support Hours
                  </h3>
                  <p className="text-muted-foreground">
                    Monday - Friday: 9:00 AM - 6:00 PM (PHT)<br />
                    Saturday: 10:00 AM - 4:00 PM (PHT)<br />
                    Sunday: Closed
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </h3>
                  <p className="text-muted-foreground">
                    Philippines<br />
                    Remote-First Company
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Social Media</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://facebook.com/opusautomations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a
                      href="https://linkedin.com/company/opusautomations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Quick Contact</CardTitle>
                <CardDescription>
                  Reach out to us directly via your preferred method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <a href="mailto:tony@opusautomations.com">
                  <Button className="w-full justify-start" size="lg" variant="outline">
                    <Mail className="mr-2 h-5 w-5" />
                    Send an Email
                  </Button>
                </a>
                <a href="tel:+639559918754">
                  <Button className="w-full justify-start" size="lg" variant="outline">
                    <Phone className="mr-2 h-5 w-5" />
                    Call or Text
                  </Button>
                </a>
                <Link href="/dashboard">
                  <Button className="w-full justify-start" size="lg" variant="outline">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Visit Dashboard
                  </Button>
                </Link>

                <div className="pt-6 border-t">
                  <h4 className="font-semibold mb-3">For Billing Inquiries</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have questions about payments, subscriptions, or need to submit
                    payment proof, please visit the Billing page.
                  </p>
                  <Link href="/billing">
                    <Button className="w-full" size="lg">
                      Go to Billing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">How quickly will I get a response?</h3>
              <p className="text-muted-foreground">
                We aim to respond to all inquiries within 24 hours during business days.
                Urgent support requests are prioritized for Pro and Premium users.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer technical support?</h3>
              <p className="text-muted-foreground">
                Yes! All users have access to email support. Pro and Premium users get priority
                support with faster response times.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I schedule a demo or consultation?</h3>
              <p className="text-muted-foreground">
                Absolutely! Email us at tony@opusautomations.com to schedule a personalized
                demo or discuss how OpusMentis can help your organization.
              </p>
            </div>
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
