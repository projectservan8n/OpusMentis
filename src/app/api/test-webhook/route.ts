import { NextRequest, NextResponse } from 'next/server'
import { notifyNewPaymentSubmission } from '@/lib/discord'

// Test endpoint to trigger Discord webhook
// DELETE THIS FILE AFTER TESTING - ONLY FOR DEVELOPMENT
export async function GET(request: NextRequest) {
  try {
    // Send test Discord notification
    const success = await notifyNewPaymentSubmission(
      'tony@opusautomations.com',
      'Carl Anthony Herrera',
      'premium',
      '399',
      'TEST-REF-12345',
      'https://opusmentis.app/api/files/uploads/receipts/test_receipt.png' // Test image URL
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: '✅ Discord webhook sent! Check your Discord channel.',
        details: {
          user: 'Carl Anthony Herrera (tony@opusautomations.com)',
          plan: 'PREMIUM',
          amount: '₱399',
          reference: 'TEST-REF-12345',
          receiptUrl: 'https://opusmentis.app/api/files/uploads/receipts/test_receipt.png'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '❌ Failed to send Discord webhook'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send test webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
