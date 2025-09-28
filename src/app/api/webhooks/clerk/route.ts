import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break

      case 'user.updated':
        await handleUserUpdated(evt.data)
        break

      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break

      // MVP: Basic subscription webhook handling
      case 'session.created':
        // User signed in - sync subscription if needed
        await syncUserData(evt.data.user_id)
        break

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Error processing webhook', { status: 500 })
  }
}

async function handleUserCreated(userData: any) {
  try {
    const email = userData.email_addresses?.[0]?.email_address || ''

    await db.user.upsert({
      where: { id: userData.id },
      update: {
        email,
      },
      create: {
        id: userData.id,
        email
      },
    })

    console.log('User created:', userData.id)
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

async function handleUserUpdated(userData: any) {
  try {
    const email = userData.email_addresses?.[0]?.email_address || ''

    await db.user.upsert({
      where: { id: userData.id },
      update: {
        email,
      },
      create: {
        id: userData.id,
        email
      },
    })

    console.log('User updated:', userData.id)
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

async function handleUserDeleted(userData: any) {
  try {
    // Delete user and all associated data (cascade)
    await db.user.delete({
      where: { id: userData.id }
    })

    console.log('User deleted:', userData.id)
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

async function syncUserData(userId: string) {
  try {
    // Check if user exists in our database
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      // Create user if doesn't exist
      await db.user.create({
        data: {
          id: userId,
          email: '' // Will be updated on next user.updated webhook
        }
      })
    }
  } catch (error) {
    console.error('Error syncing user data:', error)
  }
}