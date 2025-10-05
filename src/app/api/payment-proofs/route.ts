import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { savePaymentReceipt } from '@/lib/file-processing'
import { notifyNewPaymentSubmission } from '@/lib/discord'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const planRequested = formData.get('planRequested') as string
    const amount = formData.get('amount') as string
    const referenceNumber = formData.get('referenceNumber') as string

    if (!file || !planRequested || !amount) {
      return NextResponse.json({
        error: 'Missing required fields: file, planRequested, amount'
      }, { status: 400 })
    }

    // Validate plan
    if (!['pro', 'premium'].includes(planRequested)) {
      return NextResponse.json({
        error: 'Invalid plan requested'
      }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        error: 'Only image files are allowed for payment proof'
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        error: 'File size must be less than 10MB'
      }, { status: 400 })
    }

    // Check if user already has a pending payment proof
    const existingPendingProof = await db.paymentProof.findFirst({
      where: {
        userId,
        status: 'pending'
      }
    })

    if (existingPendingProof) {
      return NextResponse.json({
        error: 'You already have a pending payment proof under review'
      }, { status: 400 })
    }

    // Ensure user exists in our database first (required for foreign key constraint)
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: '' // Will be updated from Clerk webhook
      }
    })

    // Save the uploaded receipt to uploads/receipts folder
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `payment_proof_${userId}_${Date.now()}${path.extname(file.name)}`
    const filePath = await savePaymentReceipt(buffer, fileName)

    // Create payment proof record
    const paymentProof = await db.paymentProof.create({
      data: {
        userId,
        planRequested,
        screenshotUrl: filePath,
        amount,
        referenceNumber: referenceNumber || null,
        status: 'pending'
      }
    })

    // Send Discord notification for new payment submission
    try {
      // Get user data from Clerk for notification
      const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      }).then(res => res.json()).catch(() => null)

      const userEmail = clerkUser?.email_addresses?.[0]?.email_address || 'Unknown'
      const userName = clerkUser ? `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || 'Unknown User' : 'Unknown User'

      // Generate public URL for receipt image
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://opusmentis.app'
      const receiptUrl = `${baseUrl}/api/files/${filePath}`

      await notifyNewPaymentSubmission(
        userEmail,
        userName,
        planRequested,
        amount,
        referenceNumber || undefined,
        receiptUrl
      )
    } catch (error) {
      console.error('Failed to send Discord new payment notification:', error)
      // Don't fail the request if Discord notification fails
    }

    return NextResponse.json({
      message: 'Payment proof submitted successfully',
      paymentProofId: paymentProof.id
    })

  } catch (error) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json({
      error: 'Failed to upload payment proof'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paymentProofs = await db.paymentProof.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        planRequested: true,
        amount: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(paymentProofs)

  } catch (error) {
    console.error('Get payment proofs error:', error)
    return NextResponse.json({
      error: 'Failed to get payment proofs'
    }, { status: 500 })
  }
}