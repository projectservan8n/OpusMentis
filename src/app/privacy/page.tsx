import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              At OpusMentis (operated by Opus Automations), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Email address and name (via Google OAuth through Clerk)</li>
              <li>Profile information you provide</li>
              <li>Payment information for subscription processing</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Usage Data</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Files you upload for AI processing (PDFs, audio, video, images)</li>
              <li>Generated study materials (summaries, flashcards, kanban boards)</li>
              <li>Usage patterns and feature interactions</li>
              <li>Device information and browser data</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>To provide and improve our AI-powered study tools</li>
              <li>To process your uploaded files and generate study materials</li>
              <li>To manage your subscription and billing</li>
              <li>To send important service updates and communications</li>
              <li>To analyze usage patterns for platform improvements</li>
              <li>To provide customer support</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Sharing and Third Parties</h2>
            <p className="text-gray-700 mb-4">
              We work with trusted third-party services to provide our platform:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Clerk:</strong> Authentication and user management</li>
              <li><strong>OpenAI:</strong> AI processing for content generation (your files are processed securely)</li>
              <li><strong>Railway:</strong> Hosting and infrastructure</li>
              <li><strong>PostgreSQL:</strong> Secure data storage</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We never sell your personal information. We only share data with these services as necessary to provide our platform functionality.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure authentication via Clerk</li>
              <li>Regular security updates and monitoring</li>
              <li>Limited access to personal data on a need-to-know basis</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your study materials</li>
              <li>Opt out of non-essential communications</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your data for as long as your account is active or as needed to provide services. Upon account deletion, we will remove your personal data within 30 days, though some information may be retained for legal or security purposes.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use essential cookies for authentication and platform functionality. We do not use tracking cookies for advertising purposes.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or your data, please contact us at{' '}
              <a href="mailto:team@opusautomations.com" className="text-blue-600 hover:text-blue-800">
                team@opusautomations.com
              </a>
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                OpusMentis is a product of{' '}
                <span className="font-medium text-gray-700">Opus Automations</span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}