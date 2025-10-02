import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// GET - List all API keys for the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all API keys for this user (excluding the actual key value for security)
    const apiKeys = await db.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        key: true, // We'll mask this in the response
        status: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ apiKeys })

  } catch (error) {
    console.error('API Keys GET error:', error)
    return NextResponse.json({
      error: 'Failed to fetch API keys'
    }, { status: 500 })
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({
        error: 'API key name is required'
      }, { status: 400 })
    }

    // Check if user has too many API keys (max 10)
    const existingCount = await db.apiKey.count({
      where: { userId, status: 'active' }
    })

    if (existingCount >= 10) {
      return NextResponse.json({
        error: 'Maximum of 10 active API keys allowed. Please revoke unused keys.'
      }, { status: 400 })
    }

    // Generate a secure API key
    const apiKeyValue = `opus_live_sk_${crypto.randomBytes(32).toString('hex')}`

    // Create the API key
    const apiKey = await db.apiKey.create({
      data: {
        userId,
        name: name.trim(),
        key: apiKeyValue,
        status: 'active'
      }
    })

    // Return the full key ONLY on creation (user won't see it again)
    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key, // Full key returned only here
        status: apiKey.status,
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('API Keys POST error:', error)
    return NextResponse.json({
      error: 'Failed to create API key'
    }, { status: 500 })
  }
}

// PATCH - Update an API key (revoke)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyId, action } = body

    if (!keyId || !action) {
      return NextResponse.json({
        error: 'keyId and action are required'
      }, { status: 400 })
    }

    // Verify the key belongs to this user
    const existingKey = await db.apiKey.findFirst({
      where: { id: keyId, userId }
    })

    if (!existingKey) {
      return NextResponse.json({
        error: 'API key not found'
      }, { status: 404 })
    }

    if (action === 'revoke') {
      // Revoke the key
      const updatedKey = await db.apiKey.update({
        where: { id: keyId },
        data: { status: 'revoked' }
      })

      return NextResponse.json({
        message: 'API key revoked successfully',
        apiKey: {
          id: updatedKey.id,
          name: updatedKey.name,
          status: updatedKey.status
        }
      })
    } else {
      return NextResponse.json({
        error: 'Invalid action. Supported: revoke'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('API Keys PATCH error:', error)
    return NextResponse.json({
      error: 'Failed to update API key'
    }, { status: 500 })
  }
}

// DELETE - Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json({
        error: 'keyId is required'
      }, { status: 400 })
    }

    // Verify the key belongs to this user
    const existingKey = await db.apiKey.findFirst({
      where: { id: keyId, userId }
    })

    if (!existingKey) {
      return NextResponse.json({
        error: 'API key not found'
      }, { status: 404 })
    }

    // Delete the key
    await db.apiKey.delete({
      where: { id: keyId }
    })

    return NextResponse.json({
      message: 'API key deleted successfully'
    })

  } catch (error) {
    console.error('API Keys DELETE error:', error)
    return NextResponse.json({
      error: 'Failed to delete API key'
    }, { status: 500 })
  }
}
