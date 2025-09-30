'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
import { Code, Play, Copy, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react'
import toast from 'react-hot-toast'

interface ApiEndpoint {
  name: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  description: string
  category: string
  requiresAuth: boolean
  adminOnly?: boolean
  bodyExample?: string
  pathParams?: { name: string; example: string }[]
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Subscription endpoints
  {
    name: 'Get Subscription Status',
    method: 'GET',
    path: '/api/subscription/status',
    description: 'Get your current subscription tier and expiration date',
    category: 'subscription',
    requiresAuth: true
  },
  {
    name: 'Check Payment Status',
    method: 'GET',
    path: '/api/payment-proofs/status',
    description: 'Check if you have pending or rejected payment proofs',
    category: 'subscription',
    requiresAuth: true
  },

  // Study Packs endpoints
  {
    name: 'List Study Packs',
    method: 'GET',
    path: '/api/study-packs',
    description: 'Get all your study packs',
    category: 'study-packs',
    requiresAuth: true
  },
  {
    name: 'Get Study Pack',
    method: 'GET',
    path: '/api/study-packs/:id',
    description: 'Get a specific study pack by ID',
    category: 'study-packs',
    requiresAuth: true,
    pathParams: [{ name: 'id', example: 'clxxxxx' }]
  },
  {
    name: 'Update Study Pack',
    method: 'PATCH',
    path: '/api/study-packs/:id',
    description: 'Update study pack title or description',
    category: 'study-packs',
    requiresAuth: true,
    pathParams: [{ name: 'id', example: 'clxxxxx' }],
    bodyExample: JSON.stringify({
      title: 'Updated Title',
      description: 'Updated description'
    }, null, 2)
  },
  {
    name: 'Delete Study Pack',
    method: 'DELETE',
    path: '/api/study-packs/:id',
    description: 'Delete a study pack',
    category: 'study-packs',
    requiresAuth: true,
    pathParams: [{ name: 'id', example: 'clxxxxx' }]
  },
  {
    name: 'Get Study Pack Status',
    method: 'GET',
    path: '/api/study-packs/:id/status',
    description: 'Get processing status of a study pack',
    category: 'study-packs',
    requiresAuth: true,
    pathParams: [{ name: 'id', example: 'clxxxxx' }]
  },

  // Notes endpoints
  {
    name: 'Get Notes',
    method: 'GET',
    path: '/api/study-packs/:id/notes',
    description: 'Get all notes for a study pack',
    category: 'notes',
    requiresAuth: true,
    pathParams: [{ name: 'id', example: 'clxxxxx' }]
  },
  {
    name: 'Create Note',
    method: 'POST',
    path: '/api/study-packs/:id/notes',
    description: 'Create a new note',
    category: 'notes',
    requiresAuth: true,
    pathParams: [{ name: 'id', example: 'clxxxxx' }],
    bodyExample: JSON.stringify({
      content: 'My note content',
      section: 'summary'
    }, null, 2)
  },
  {
    name: 'Update Note',
    method: 'PATCH',
    path: '/api/notes/:id',
    description: 'Update a note',
    category: 'notes',
    requiresAuth: true,
    pathParams: [{ name: 'id', example: 'clxxxxx' }],
    bodyExample: JSON.stringify({
      content: 'Updated note content'
    }, null, 2)
  },
  {
    name: 'Delete Note',
    method: 'DELETE',
    path: '/api/notes/:id',
    description: 'Delete a note',
    category: 'notes',
    requiresAuth: true,
    pathParams: [{ name: 'id', example: 'clxxxxx' }]
  },

  // Admin endpoints
  {
    name: 'Get Admin Stats',
    method: 'GET',
    path: '/api/admin/stats',
    description: 'Get dashboard statistics (admin only)',
    category: 'admin',
    requiresAuth: true,
    adminOnly: true
  },
  {
    name: 'Get All Users',
    method: 'GET',
    path: '/api/admin/users',
    description: 'List all users (admin only)',
    category: 'admin',
    requiresAuth: true,
    adminOnly: true
  },
  {
    name: 'Process Payment Proof',
    method: 'POST',
    path: '/api/admin/payment-proofs',
    description: 'Approve or reject payment proof (admin only)',
    category: 'admin',
    requiresAuth: true,
    adminOnly: true,
    bodyExample: JSON.stringify({
      paymentProofId: 'clxxxxx',
      action: 'approve',
      adminNotes: 'Payment verified'
    }, null, 2)
  }
]

export default function ApiPlaygroundPage() {
  const { user } = useUser()
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [requestBody, setRequestBody] = useState('')
  const [pathParamValues, setPathParamValues] = useState<Record<string, string>>({})
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === 'tony@opusautomations.com'

  const categories = [
    { id: 'subscription', name: 'Subscription', icon: '💳' },
    { id: 'study-packs', name: 'Study Packs', icon: '📚' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'admin', name: 'Admin', icon: '👑' }
  ]

  const handleEndpointSelect = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint)
    setRequestBody(endpoint.bodyExample || '')
    setResponse(null)
    setResponseTime(null)

    // Initialize path params
    if (endpoint.pathParams) {
      const params: Record<string, string> = {}
      endpoint.pathParams.forEach(param => {
        params[param.name] = param.example
      })
      setPathParamValues(params)
    } else {
      setPathParamValues({})
    }
  }

  const buildUrl = (endpoint: ApiEndpoint): string => {
    let url = endpoint.path

    if (endpoint.pathParams) {
      endpoint.pathParams.forEach(param => {
        const value = pathParamValues[param.name] || param.example
        url = url.replace(`:${param.name}`, value)
      })
    }

    return url
  }

  const handleTestEndpoint = async () => {
    if (!selectedEndpoint) return

    setLoading(true)
    setResponse(null)
    setResponseTime(null)

    const startTime = performance.now()

    try {
      const url = buildUrl(selectedEndpoint)
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (['POST', 'PATCH'].includes(selectedEndpoint.method) && requestBody) {
        options.body = requestBody
      }

      const res = await fetch(url, options)
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))

      const contentType = res.headers.get('content-type')
      let data

      if (contentType?.includes('application/json')) {
        data = await res.json()
      } else {
        data = { message: 'Non-JSON response', status: res.status }
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data
      })

      if (res.ok) {
        toast.success('Request successful!')
      } else {
        toast.error(`Request failed: ${res.status} ${res.statusText}`)
      }
    } catch (error: any) {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))

      setResponse({
        status: 0,
        statusText: 'Network Error',
        error: error.message
      })
      toast.error('Request failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const generateCurlCommand = (): string => {
    if (!selectedEndpoint) return ''

    const url = buildUrl(selectedEndpoint)
    let curl = `curl -X ${selectedEndpoint.method} "${window.location.origin}${url}"`

    if (selectedEndpoint.requiresAuth) {
      curl += ' \\\n  -H "Authorization: Bearer YOUR_TOKEN"'
    }

    if (['POST', 'PATCH'].includes(selectedEndpoint.method)) {
      curl += ' \\\n  -H "Content-Type: application/json"'
      if (requestBody) {
        curl += ` \\\n  -d '${requestBody}'`
      }
    }

    return curl
  }

  return (
    <DashboardLayout
      title="API Playground"
      subtitle="Test OpusMentis API endpoints interactively"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar - Endpoint List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Endpoints</span>
              </CardTitle>
              <CardDescription>
                Select an endpoint to test
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="subscription" className="w-full">
                <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
                  {categories.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                      {cat.icon}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map(cat => (
                  <TabsContent key={cat.id} value={cat.id} className="p-0 m-0">
                    <div className="divide-y">
                      {API_ENDPOINTS
                        .filter(e => e.category === cat.id)
                        .filter(e => !e.adminOnly || isAdmin)
                        .map((endpoint, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleEndpointSelect(endpoint)}
                            className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                              selectedEndpoint?.path === endpoint.path ? 'bg-accent' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{endpoint.name}</span>
                              <Badge
                                variant={
                                  endpoint.method === 'GET'
                                    ? 'default'
                                    : endpoint.method === 'POST'
                                    ? 'default'
                                    : endpoint.method === 'PATCH'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className="text-xs"
                              >
                                {endpoint.method}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                          </button>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Request/Response */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEndpoint ? (
            <>
              {/* Request Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Request</span>
                    <Button
                      onClick={handleTestEndpoint}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Test Endpoint
                        </>
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {selectedEndpoint.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Method & Path */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Endpoint</label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-mono">
                        {selectedEndpoint.method}
                      </Badge>
                      <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                        {selectedEndpoint.path}
                      </code>
                    </div>
                  </div>

                  {/* Path Parameters */}
                  {selectedEndpoint.pathParams && selectedEndpoint.pathParams.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Path Parameters</label>
                      <div className="space-y-2">
                        {selectedEndpoint.pathParams.map(param => (
                          <div key={param.name}>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              {param.name}
                            </label>
                            <Input
                              value={pathParamValues[param.name] || param.example}
                              onChange={e =>
                                setPathParamValues({
                                  ...pathParamValues,
                                  [param.name]: e.target.value
                                })
                              }
                              placeholder={param.example}
                              className="font-mono text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {['POST', 'PATCH'].includes(selectedEndpoint.method) && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Request Body (JSON)</label>
                      <Textarea
                        value={requestBody}
                        onChange={e => setRequestBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="font-mono text-sm min-h-[150px]"
                      />
                    </div>
                  )}

                  {/* cURL Command */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">cURL Command</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generateCurlCommand())}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                      {generateCurlCommand()}
                    </pre>
                  </div>

                  {/* Auth Note */}
                  {selectedEndpoint.requiresAuth && (
                    <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <Key className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Authentication Required</p>
                        <p className="text-xs mt-1">
                          This endpoint uses your active session. You're currently logged in as{' '}
                          <span className="font-mono">{user?.emailAddresses?.[0]?.emailAddress}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedEndpoint.adminOnly && !isAdmin && (
                    <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium">Admin Access Required</p>
                        <p className="text-xs mt-1">
                          This endpoint is restricted to admin users only.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Response Section */}
              {response && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span>Response</span>
                        {response.status >= 200 && response.status < 300 && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {response.status >= 400 && (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        {responseTime !== null && (
                          <span className="text-muted-foreground">{responseTime}ms</span>
                        )}
                        <Badge
                          variant={
                            response.status >= 200 && response.status < 300
                              ? 'default'
                              : response.status >= 400
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {response.status} {response.statusText}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Response Body */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Response Body</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(JSON.stringify(response.data || response, null, 2))
                          }
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto max-h-[400px]">
                        {JSON.stringify(response.data || response, null, 2)}
                      </pre>
                    </div>

                    {/* Response Headers */}
                    {response.headers && (
                      <details>
                        <summary className="text-sm font-medium cursor-pointer mb-2">
                          Response Headers
                        </summary>
                        <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
                          {JSON.stringify(response.headers, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Code className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Endpoint</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Choose an endpoint from the sidebar to start testing the OpusMentis API.
                  You can test requests, view responses, and copy cURL commands.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}