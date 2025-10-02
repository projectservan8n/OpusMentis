import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// GET - Get user settings
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with settings
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        aiSummaryStyle: true,
        aiFlashcardDifficulty: true,
        aiKanbanDepth: true,
        aiPreferredLanguage: true,
        exportIncludeNotes: true,
        exportIncludeFlashcards: true,
        exportIncludeKanban: true,
        exportPdfLayout: true
      }
    })

    if (!user) {
      // User doesn't exist yet, return defaults
      return NextResponse.json({
        aiSettings: {
          summaryStyle: 'comprehensive',
          flashcardDifficulty: 'mixed',
          kanbanDepth: 'detailed',
          preferredLanguage: 'english'
        },
        exportSettings: {
          includeNotes: true,
          includeFlashcards: true,
          includeKanban: true,
          pdfLayout: 'standard'
        }
      })
    }

    return NextResponse.json({
      aiSettings: {
        summaryStyle: user.aiSummaryStyle,
        flashcardDifficulty: user.aiFlashcardDifficulty,
        kanbanDepth: user.aiKanbanDepth,
        preferredLanguage: user.aiPreferredLanguage
      },
      exportSettings: {
        includeNotes: user.exportIncludeNotes,
        includeFlashcards: user.exportIncludeFlashcards,
        includeKanban: user.exportIncludeKanban,
        pdfLayout: user.exportPdfLayout
      }
    })

  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({
      error: 'Failed to fetch settings'
    }, { status: 500 })
  }
}

// PATCH - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, settings } = body

    if (!type || !settings) {
      return NextResponse.json({
        error: 'type and settings are required'
      }, { status: 400 })
    }

    // Ensure user exists
    let user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      // Create user if doesn't exist (shouldn't happen normally, but just in case)
      const { currentUser } = await import('@clerk/nextjs/server')
      const clerkUser = await currentUser()

      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      user = await db.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || ''
        }
      })
    }

    if (type === 'ai') {
      // Update AI settings
      const { summaryStyle, flashcardDifficulty, kanbanDepth, preferredLanguage } = settings

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          ...(summaryStyle && { aiSummaryStyle: summaryStyle }),
          ...(flashcardDifficulty && { aiFlashcardDifficulty: flashcardDifficulty }),
          ...(kanbanDepth && { aiKanbanDepth: kanbanDepth }),
          ...(preferredLanguage && { aiPreferredLanguage: preferredLanguage })
        }
      })

      return NextResponse.json({
        message: 'AI settings saved successfully',
        settings: {
          summaryStyle: updatedUser.aiSummaryStyle,
          flashcardDifficulty: updatedUser.aiFlashcardDifficulty,
          kanbanDepth: updatedUser.aiKanbanDepth,
          preferredLanguage: updatedUser.aiPreferredLanguage
        }
      })

    } else if (type === 'export') {
      // Update export settings
      const { includeNotes, includeFlashcards, includeKanban, pdfLayout } = settings

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          ...(includeNotes !== undefined && { exportIncludeNotes: includeNotes }),
          ...(includeFlashcards !== undefined && { exportIncludeFlashcards: includeFlashcards }),
          ...(includeKanban !== undefined && { exportIncludeKanban: includeKanban }),
          ...(pdfLayout && { exportPdfLayout: pdfLayout })
        }
      })

      return NextResponse.json({
        message: 'Export settings saved successfully',
        settings: {
          includeNotes: updatedUser.exportIncludeNotes,
          includeFlashcards: updatedUser.exportIncludeFlashcards,
          includeKanban: updatedUser.exportIncludeKanban,
          pdfLayout: updatedUser.exportPdfLayout
        }
      })

    } else {
      return NextResponse.json({
        error: 'Invalid settings type. Supported: ai, export'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Settings PATCH error:', error)
    return NextResponse.json({
      error: 'Failed to update settings'
    }, { status: 500 })
  }
}
