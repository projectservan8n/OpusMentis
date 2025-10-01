import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Code,
  Key,
  Terminal,
  BookOpen,
  Zap,
  Shield,
  ArrowRight,
  Copy,
  CheckCircle2
} from 'lucide-react'

export default function APIDocsPage() {
  const endpoints = [
    {
      method: 'POST',
      path: '/api/upload',
      description: 'Upload and process a new document',
      auth: 'Required',
      params: [
        { name: 'file', type: 'File', required: true, description: 'PDF, audio, video, or image file' },
        { name: 'title', type: 'string', required: false, description: 'Custom title for the study pack' }
      ]
    },
    {
      method: 'GET',
      path: '/api/study-packs',
      description: 'List all study packs for authenticated user',
      auth: 'Required',
      params: [
        { name: 'page', type: 'number', required: false, description: 'Page number for pagination' },
        { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 10)' }
      ]
    },
    {
      method: 'GET',
      path: '/api/study-packs/[id]',
      description: 'Get a specific study pack with all content',
      auth: 'Required',
      params: [
        { name: 'id', type: 'string', required: true, description: 'Study pack ID' }
      ]
    },
    {
      method: 'POST',
      path: '/api/study-packs/[id]/regenerate-flashcards',
      description: 'Regenerate flashcards using AI',
      auth: 'Required',
      params: [
        { name: 'id', type: 'string', required: true, description: 'Study pack ID' }
      ]
    },
    {
      method: 'DELETE',
      path: '/api/study-packs/[id]',
      description: 'Delete a study pack',
      auth: 'Required',
      params: [
        { name: 'id', type: 'string', required: true, description: 'Study pack ID' }
      ]
    },
    {
      method: 'GET',
      path: '/api/subscription/status',
      description: 'Get current subscription tier and limits',
      auth: 'Required',
      params: []
    }
  ]

  const quickStart = `// Initialize API Client
const API_KEY = 'your_api_key_here'
const BASE_URL = 'https://opusmentis.app'

// Upload a file
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('title', 'My Study Material')

const response = await fetch(\`\${BASE_URL}/api/upload\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`
  },
  body: formData
})

const studyPack = await response.json()
console.log('Created study pack:', studyPack)`

  const pythonExample = `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://opusmentis.app"

# Upload a file
with open('lecture.pdf', 'rb') as f:
    files = {'file': f}
    data = {'title': 'Lecture Notes'}
    headers = {'Authorization': f'Bearer {API_KEY}'}

    response = requests.post(
        f'{BASE_URL}/api/upload',
        files=files,
        data=data,
        headers=headers
    )

study_pack = response.json()
print(f"Created study pack: {study_pack['id']}")`

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
              <Link href="/api-keys">
                <Button variant="ghost">
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </Button>
              </Link>
              <Link href="/api-playground">
                <Button>
                  <Terminal className="mr-2 h-4 w-4" />
                  Playground
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-4">
            <Code className="mr-1 h-3 w-3" />
            RESTful API
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            API Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Integrate OpusMentis AI-powered study tools into your applications with our simple REST API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/api-keys">
              <Button size="lg">
                Get Your API Key
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/api-playground">
              <Button size="lg" variant="outline">
                <Terminal className="mr-2 h-5 w-5" />
                Try It Out
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <div className="p-2 bg-blue-100 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Fast & Reliable</CardTitle>
                <CardDescription>
                  99.9% uptime with sub-second response times for most operations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-green-100 rounded-lg w-fit mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Secure</CardTitle>
                <CardDescription>
                  API key authentication with per-user rate limiting and encryption
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-purple-100 rounded-lg w-fit mb-4">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Well Documented</CardTitle>
                <CardDescription>
                  Comprehensive docs with code examples in multiple languages
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Getting Started</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">1. Get Your API Key</h3>
              <p className="text-muted-foreground mb-4">
                Sign up and navigate to the API Keys page to generate your authentication key.
              </p>
              <Link href="/api-keys">
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Manage API Keys
                </Button>
              </Link>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">2. Make Your First Request</h3>
              <p className="text-muted-foreground mb-4">
                Use your API key to authenticate requests and start uploading documents.
              </p>
              <Link href="/api-playground">
                <Button variant="outline">
                  <Terminal className="mr-2 h-4 w-4" />
                  Open Playground
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Examples */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Quick Start</h2>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>JavaScript / TypeScript</CardTitle>
                  <Badge variant="secondary">Fetch API</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{quickStart}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Python</CardTitle>
                  <Badge variant="secondary">Requests</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{pythonExample}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">API Endpoints</h2>

          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <Badge
                      variant={endpoint.method === 'GET' ? 'default' : endpoint.method === 'POST' ? 'secondary' : 'destructive'}
                      className="w-fit"
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono">{endpoint.path}</code>
                    {endpoint.auth === 'Required' && (
                      <Badge variant="outline" className="w-fit">
                        <Shield className="mr-1 h-3 w-3" />
                        Auth Required
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                {endpoint.params.length > 0 && (
                  <CardContent>
                    <h4 className="font-semibold text-sm mb-3">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.params.map((param, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2 text-sm">
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                              {param.name}
                            </code>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground">{param.description}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Authentication</h2>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key Authentication
              </CardTitle>
              <CardDescription>
                All API requests require authentication using your API key in the Authorization header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Header Format</h4>
                <pre className="bg-muted p-3 rounded text-sm">
                  <code>Authorization: Bearer YOUR_API_KEY_HERE</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Example Request</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                  <code>{`curl -X GET https://opusmentis.app/api/study-packs \\
  -H "Authorization: Bearer sk_live_abc123..."`}</code>
                </pre>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-900 mb-1">Keep Your API Key Secret</p>
                  <p className="text-yellow-800">
                    Never expose your API key in client-side code or public repositories.
                    Use environment variables and server-side requests only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Rate Limits</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Basic rate limiting</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>100 requests/hour</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>3 uploads/month</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Increased limits</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>1,000 requests/hour</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Unlimited uploads</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Maximum performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>10,000 requests/hour</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Unlimited uploads</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Build?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get your API key and start integrating OpusMentis into your applications today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/api-keys">
              <Button size="lg">
                Get API Key
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/api-playground">
              <Button size="lg" variant="outline">
                Try API Playground
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
