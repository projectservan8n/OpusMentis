import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { clerkTierToAppTier, PLAN_LIMITS } from '@/lib/subscription-utils'

const useOpenRouter = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'placeholder-key-for-build'

const openai = new OpenAI({
  apiKey: useOpenRouter
    ? process.env.OPENROUTER_API_KEY
    : process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
  baseURL: useOpenRouter
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1',
  defaultHeaders: useOpenRouter
    ? {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://opusmentis.app',
        'X-Title': 'StudyFlow AI'
      }
    : undefined
})

const AI_MODEL = useOpenRouter ? 'openai/gpt-oss-20b:free' : 'gpt-4o-mini'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studyPackId, message } = await req.json()

    if (!studyPackId || !message) {
      return NextResponse.json(
        { error: 'Study pack ID and message are required' },
        { status: 400 }
      )
    }

    // Check chat message limits based on subscription tier
    const user = await currentUser()
    const clerkTier = (user?.publicMetadata?.plan as string) || 'free_plan'
    const userTier = clerkTierToAppTier(clerkTier)
    const limits = PLAN_LIMITS[userTier]

    // Check daily message limit (only if not unlimited)
    if (limits.maxChatMessagesPerDay !== -1) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const messagesCountToday = await prisma.chatMessage.count({
        where: {
          userId,
          role: 'user', // Only count user messages
          createdAt: {
            gte: today
          }
        }
      })

      if (messagesCountToday >= limits.maxChatMessagesPerDay) {
        return NextResponse.json(
          {
            error: `You've reached your daily chat limit of ${limits.maxChatMessagesPerDay} messages. Upgrade to Pro or Premium for more messages!`,
            limitReached: true,
            upgradeRequired: true
          },
          { status: 429 }
        )
      }
    }

    // Fetch study pack with all relevant content
    const studyPack = await prisma.studyPack.findUnique({
      where: { id: studyPackId },
      select: {
        id: true,
        title: true,
        summary: true,
        topics: true,
        flashcards: true,
        transcript: true,
        userId: true,
        organizationId: true
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess =
      studyPack.userId === userId ||
      (studyPack.organizationId && studyPack.organizationId !== null)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this study pack' },
        { status: 403 }
      )
    }

    // Fetch recent chat history (last 10 messages for context)
    const chatHistory = await prisma.chatMessage.findMany({
      where: { studyPackId, userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Reverse to get chronological order
    const messages = chatHistory.reverse()

    // Build context from study pack content
    const contextParts: string[] = []

    if (studyPack.summary) {
      contextParts.push(`Summary: ${studyPack.summary}`)
    }

    if (studyPack.topics) {
      try {
        const topics = typeof studyPack.topics === 'string'
          ? JSON.parse(studyPack.topics)
          : studyPack.topics
        if (Array.isArray(topics) && topics.length > 0) {
          contextParts.push(`Key Topics: ${topics.join(', ')}`)
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    if (studyPack.flashcards) {
      try {
        const flashcards = typeof studyPack.flashcards === 'string'
          ? JSON.parse(studyPack.flashcards)
          : studyPack.flashcards
        if (Array.isArray(flashcards) && flashcards.length > 0) {
          const flashcardText = flashcards
            .slice(0, 5) // Limit to first 5 to save tokens
            .map((fc: any) => `Q: ${fc.question}\nA: ${fc.answer}`)
            .join('\n\n')
          contextParts.push(`Sample Flashcards:\n${flashcardText}`)
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    if (studyPack.transcript) {
      // Include first 2000 chars of transcript to provide context
      const transcriptPreview = studyPack.transcript.substring(0, 2000)
      contextParts.push(`Content Transcript:\n${transcriptPreview}${studyPack.transcript.length > 2000 ? '...' : ''}`)
    }

    const contextString = contextParts.join('\n\n---\n\n')

    // Build conversation messages for OpenAI
    const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI study assistant helping a student understand their study materials titled "${studyPack.title}". Use the following context to answer questions accurately and helpfully:

${contextString}

Guidelines:
- Answer questions based on the study material context above
- Be clear, concise, and educational
- If asked about something not in the context, politely say you can only help with this specific study material
- Encourage active learning by asking follow-up questions when appropriate
- Use examples from the material to illustrate concepts`
      }
    ]

    // Add chat history
    messages.forEach((msg) => {
      conversationMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })
    })

    // Add new user message
    conversationMessages.push({
      role: 'user',
      content: message
    })

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        studyPackId,
        userId,
        role: 'user',
        content: message
      }
    })

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true
    })

    // Create a readable stream
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              controller.enqueue(encoder.encode(content))
            }
          }

          // Save assistant response to database
          await prisma.chatMessage.create({
            data: {
              studyPackId,
              userId,
              role: 'assistant',
              content: fullResponse
            }
          })

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch chat history
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const studyPackId = searchParams.get('studyPackId')

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'Study pack ID is required' },
        { status: 400 }
      )
    }

    // Verify access to study pack
    const studyPack = await prisma.studyPack.findUnique({
      where: { id: studyPackId },
      select: {
        userId: true,
        organizationId: true
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    const hasAccess =
      studyPack.userId === userId ||
      (studyPack.organizationId && studyPack.organizationId !== null)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this study pack' },
        { status: 403 }
      )
    }

    // Fetch chat history
    const messages = await prisma.chatMessage.findMany({
      where: { studyPackId, userId },
      orderBy: { createdAt: 'asc' },
      take: 100 // Limit to last 100 messages
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Chat history fetch error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to clear chat history
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const studyPackId = searchParams.get('studyPackId')

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'Study pack ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const studyPack = await prisma.studyPack.findUnique({
      where: { id: studyPackId },
      select: { userId: true }
    })

    if (!studyPack || studyPack.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this chat history' },
        { status: 403 }
      )
    }

    // Delete all chat messages for this study pack and user
    await prisma.chatMessage.deleteMany({
      where: { studyPackId, userId }
    })

    return NextResponse.json({ message: 'Chat history cleared successfully' })
  } catch (error: any) {
    console.error('Chat history delete error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to clear chat history' },
      { status: 500 }
    )
  }
}
