import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card shadow-sm rounded-lg p-8 border">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Welcome to OpusMentis, operated by Opus Automations. By accessing and using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By creating an account, accessing, or using OpusMentis, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              OpusMentis is an AI-powered study platform that helps users generate study materials from uploaded content. Our services include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>AI-generated summaries from PDFs, audio, video, and images</li>
              <li>Interactive flashcard creation and study sessions</li>
              <li>Kanban board organization for study planning</li>
              <li>Export functionality for study materials</li>
              <li>Subscription-based access to premium features</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts and Registration</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must be at least 13 years old to use our service</li>
              <li>One account per person; multiple accounts are not permitted</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Subscription Plans and Billing</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">Plan Types</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Free Plan (₱0):</strong> 3 uploads/month, 10 PDF pages max, 10 minutes audio/video</li>
              <li><strong>Pro Plan (₱149/month):</strong> 50 uploads/month, 50 PDF pages max, 60 minutes audio/video, max 100MB per file</li>
              <li><strong>Premium Plan (₱399/month):</strong> 200 uploads/month, 200 PDF pages max, 180 minutes audio/video, max 200MB per file</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Payment Terms</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Subscriptions are billed monthly in advance</li>
              <li>Payments are processed via GCash manual verification</li>
              <li>Subscriptions automatically expire after 30 days unless renewed</li>
              <li>No automatic billing; manual payment required for renewal</li>
              <li>All fees are non-refundable unless required by law</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Subscription Management</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Subscriptions expire automatically after 30 days</li>
              <li>You will be notified before expiration via email</li>
              <li>Expired subscriptions are automatically downgraded to Free plan</li>
              <li>Your data and study materials remain accessible after downgrade</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use Policy</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Upload copyrighted content without permission</li>
              <li>Upload malicious files, viruses, or harmful content</li>
              <li>Use the service for illegal or unauthorized purposes</li>
              <li>Attempt to reverse engineer or hack our platform</li>
              <li>Share your account credentials with others</li>
              <li>Upload content that violates intellectual property rights</li>
              <li>Use the service to generate harmful or inappropriate content</li>
              <li>Exceed usage limits through automated or bulk uploads</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Content and Intellectual Property</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">Your Content</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You retain ownership of content you upload</li>
              <li>You grant us license to process your content to provide our services</li>
              <li>You represent that you have rights to upload and process the content</li>
              <li>Generated study materials are owned by you</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Our Platform</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>OpusMentis platform and technology are owned by Opus Automations</li>
              <li>You may not copy, distribute, or create derivative works</li>
              <li>Our trademarks and logos are protected intellectual property</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Privacy and Data Protection</h2>
            <p className="mb-4">
              Your privacy is important to us. Our data collection and use practices are detailed in our{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>,
              which is incorporated into these Terms by reference.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Service Availability</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>We strive for high uptime but cannot guarantee 100% availability</li>
              <li>Planned maintenance will be announced in advance when possible</li>
              <li>We reserve the right to suspend service for maintenance or security reasons</li>
              <li>No compensation will be provided for temporary service interruptions</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, Opus Automations and OpusMentis shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of our service. Our total liability shall not exceed the amount you paid for the service in the past 12 months.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Disclaimer of Warranties</h2>
            <p className="mb-4">
              Our service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of AI-generated content. You use the service at your own risk.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Account Termination</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>You may delete your account at any time</li>
              <li>We may suspend or terminate accounts for violations of these Terms</li>
              <li>Upon termination, your access to the service will cease</li>
              <li>We will retain your data according to our Privacy Policy</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the Philippines. Any disputes shall be resolved in the appropriate courts of the Philippines.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the service after changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:team@opusautomations.com" className="text-blue-600 hover:text-blue-800">
                team@opusautomations.com
              </a>
            </p>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                OpusMentis is a product of{' '}
                <span className="font-medium">Opus Automations</span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}