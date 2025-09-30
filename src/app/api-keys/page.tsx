'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/dashboard-layout'
import {
  Key,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string | null
  status: 'active' | 'revoked'
}

export default function ApiKeysPage() {
  const { user } = useUser()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Fetch API keys from backend
    // For now, show mock data
    setApiKeys([
      {
        id: '1',
        name: 'Production Key',
        key: 'opus_live_sk_1234567890abcdefghijklmnopqrstuvwxyz',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        status: 'active'
      }
    ])
  }, [])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key')
      return
    }

    setCreatingKey(true)
    try {
      // TODO: Call backend API to create key
      const mockKey = `opus_live_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: mockKey,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        status: 'active'
      }

      setApiKeys([...apiKeys, newKey])
      setNewlyCreatedKey(mockKey)
      setNewKeyName('')
      toast.success('API key created successfully!')
    } catch (error) {
      toast.error('Failed to create API key')
    } finally {
      setCreatingKey(false)
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to revoke this API key? This action cannot be undone and any services using this key will stop working.'
    )

    if (!confirmed) return

    try {
      // TODO: Call backend API to revoke key
      setApiKeys(apiKeys.map(k => (k.id === keyId ? { ...k, status: 'revoked' as const } : k)))
      toast.success('API key revoked')
    } catch (error) {
      toast.error('Failed to revoke API key')
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this API key? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      // TODO: Call backend API to delete key
      setApiKeys(apiKeys.filter(k => k.id !== keyId))
      toast.success('API key deleted')
    } catch (error) {
      toast.error('Failed to delete API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const toggleShowKey = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const maskKey = (key: string): string => {
    if (key.length < 16) return key
    return key.substring(0, 12) + '•'.repeat(24) + key.substring(key.length - 4)
  }

  return (
    <DashboardLayout
      title="API Keys"
      subtitle="Manage API keys for integrations and automation"
    >
      <div className="space-y-6">
        {/* Alert about new key */}
        {newlyCreatedKey && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <CardTitle className="text-green-900">API Key Created!</CardTitle>
                  <CardDescription className="text-green-700">
                    Make sure to copy your API key now. You won't be able to see it again!
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-sm font-mono overflow-x-auto">
                  {newlyCreatedKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="border-green-300"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewlyCreatedKey(null)}
                className="mt-2 text-green-700"
              >
                I've saved my key
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>About API Keys</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Key className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Secure Access</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use API keys to authenticate requests to OpusMentis API from external services.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Integrations</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect with n8n, Make.com, Zapier, or any custom application.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Keep Secret</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Treat API keys like passwords. Never share them publicly or commit to git.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Integration Resources</p>
                  <ul className="text-xs mt-2 space-y-1">
                    <li>
                      • <a href="/api-playground" className="underline">API Playground</a> - Test endpoints interactively
                    </li>
                    <li>
                      • <a href="/docs/api" className="underline">API Documentation</a> - Full reference guide
                    </li>
                    <li>
                      • <a href="/docs/integrations" className="underline">Integration Guides</a> - Step-by-step tutorials for n8n, Make.com
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create New Key */}
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key for your integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., Production Key, n8n Integration, Test Environment"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCreateKey()}
              />
              <Button onClick={handleCreateKey} disabled={creatingKey || !newKeyName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                {creatingKey ? 'Creating...' : 'Create Key'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              {apiKeys.length === 0
                ? 'No API keys yet. Create one to get started.'
                : `${apiKeys.filter(k => k.status === 'active').length} active key(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No API keys yet</p>
                <p className="text-xs mt-1">Create your first API key above to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map(apiKey => (
                  <div
                    key={apiKey.id}
                    className={`p-4 border rounded-lg ${
                      apiKey.status === 'revoked' ? 'bg-gray-50 opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{apiKey.name}</h4>
                          <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                            {apiKey.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                          {apiKey.lastUsed && (
                            <span>
                              Last used {new Date(apiKey.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {apiKey.status === 'active' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(apiKey.id)}
                          >
                            Revoke
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                        {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleShowKey(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                        disabled={apiKey.status === 'revoked'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              How to use your API key with different tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* cURL Example */}
            <div>
              <h4 className="font-medium text-sm mb-2">cURL</h4>
              <div className="relative">
                <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`curl -X GET "https://your-domain.com/api/study-packs" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`curl -X GET "https://your-domain.com/api/study-packs" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`)}
                  className="absolute top-2 right-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* n8n Example */}
            <div>
              <h4 className="font-medium text-sm mb-2">n8n</h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Add an "HTTP Request" node</li>
                <li>Set URL to: <code className="bg-muted px-1 py-0.5 rounded">https://your-domain.com/api/study-packs</code></li>
                <li>Add header: <code className="bg-muted px-1 py-0.5 rounded">Authorization: Bearer YOUR_API_KEY</code></li>
                <li>Set method to GET/POST as needed</li>
              </ol>
            </div>

            {/* Make.com Example */}
            <div>
              <h4 className="font-medium text-sm mb-2">Make.com</h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Add "HTTP" module → "Make a request"</li>
                <li>URL: <code className="bg-muted px-1 py-0.5 rounded">https://your-domain.com/api/study-packs</code></li>
                <li>Method: GET/POST</li>
                <li>Headers → Add item:</li>
                <ul className="ml-6 mt-1 space-y-1">
                  <li>Name: <code className="bg-muted px-1 py-0.5 rounded">Authorization</code></li>
                  <li>Value: <code className="bg-muted px-1 py-0.5 rounded">Bearer YOUR_API_KEY</code></li>
                </ul>
              </ol>
            </div>

            {/* JavaScript Example */}
            <div>
              <h4 className="font-medium text-sm mb-2">JavaScript / Node.js</h4>
              <div className="relative">
                <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`const response = await fetch('https://your-domain.com/api/study-packs', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`const response = await fetch('https://your-domain.com/api/study-packs', {\n  method: 'GET',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json'\n  }\n});\n\nconst data = await response.json();\nconsole.log(data);`)}
                  className="absolute top-2 right-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}