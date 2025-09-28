import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { saveUploadedFile } from '@/lib/file-processing'
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

    // Save the uploaded file
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `payment_proof_${userId}_${Date.now()}${path.extname(file.name)}`
    const filePath = await saveUploadedFile(buffer, fileName)

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