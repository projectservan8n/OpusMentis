import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get quiz attempt with quiz details
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        quiz: {
          include: {
            studyPack: true
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 })
    }

    const questions = attempt.quiz.questions as any[]
    const answers = attempt.answers as any[]
    const feedback = attempt.feedback as any[]

    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Colors
    const darkBlue = rgb(0.1, 0.1, 0.4)
    const lightBlue = rgb(0.2, 0.4, 0.8)
    const green = rgb(0.13, 0.54, 0.13)
    const red = rgb(0.8, 0.1, 0.1)
    const gray = rgb(0.4, 0.4, 0.4)
    const black = rgb(0, 0, 0)

    let currentPage = pdfDoc.addPage()
    let { width, height } = currentPage.getSize()
    let yPosition = height - 60

    // Helper function to add new page if needed
    const checkPageSpace = (requiredSpace: number) => {
      if (yPosition - requiredSpace < 60) {
        currentPage = pdfDoc.addPage()
        yPosition = height - 60
      }
    }

    // Helper function to draw text with word wrapping
    const drawWrappedText = (
      text: string,
      x: number,
      maxWidth: number,
      fontSize: number,
      font: any,
      color: any = black
    ) => {
      const words = text.split(' ')
      let line = ''
      const lineHeight = fontSize + 4

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word
        const textWidth = font.widthOfTextAtSize(testLine, fontSize)

        if (textWidth > maxWidth && line) {
          checkPageSpace(lineHeight)
          currentPage.drawText(line, {
            x,
            y: yPosition,
            size: fontSize,
            font,
            color
          })
          yPosition -= lineHeight
          line = word
        } else {
          line = testLine
        }
      }

      if (line) {
        checkPageSpace(lineHeight)
        currentPage.drawText(line, {
          x,
          y: yPosition,
          size: fontSize,
          font,
          color
        })
        yPosition -= lineHeight
      }

      return yPosition
    }

    // Title Page
    currentPage.drawText('OpusMentis', {
      x: 50,
      y: yPosition,
      size: 24,
      font: helveticaBoldFont,
      color: lightBlue
    })
    yPosition -= 40

    currentPage.drawText('Quiz Results Report', {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
      color: darkBlue
    })
    yPosition -= 60

    // Quiz Info
    currentPage.drawText(`Quiz: ${attempt.quiz.title}`, {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: black
    })
    yPosition -= 25

    currentPage.drawText(`Study Pack: ${attempt.quiz.studyPack.title}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: gray
    })
    yPosition -= 20

    currentPage.drawText(`Difficulty: ${attempt.quiz.difficulty.toUpperCase()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: gray
    })
    yPosition -= 20

    currentPage.drawText(`Completed: ${new Date(attempt.completedAt!).toLocaleString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: gray
    })
    yPosition -= 40

    // Score Summary
    const percentage = Math.round((attempt.score / attempt.totalPoints) * 100)
    const passed = percentage >= 60

    currentPage.drawText('Score Summary', {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: darkBlue
    })
    yPosition -= 30

    currentPage.drawText(`Final Score: ${percentage}% (${attempt.score}/${attempt.totalPoints} points)`, {
      x: 50,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: passed ? green : red
    })
    yPosition -= 25

    currentPage.drawText(`Result: ${passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: passed ? green : red
    })
    yPosition -= 20

    if (attempt.timeSpent) {
      const minutes = Math.floor(attempt.timeSpent / 60)
      const seconds = attempt.timeSpent % 60
      currentPage.drawText(`Time Spent: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: gray
      })
      yPosition -= 30
    }

    // Questions and Answers
    checkPageSpace(100)
    yPosition -= 20

    currentPage.drawText('Detailed Results', {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: darkBlue
    })
    yPosition -= 30

    questions.forEach((question: any, index: number) => {
      const answer = answers.find((a: any) => a.questionIndex === index)
      const questionFeedback = feedback.find((f: any) => f.questionIndex === index)
      const isCorrect = questionFeedback?.isCorrect || false

      checkPageSpace(120)

      // Question number and type
      currentPage.drawText(`Question ${index + 1} (${question.type}) - ${question.points} points`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
        color: isCorrect ? green : red
      })
      yPosition -= 20

      // Question text
      currentPage.drawText('Q:', {
        x: 50,
        y: yPosition,
        size: 11,
        font: helveticaBoldFont,
        color: black
      })
      drawWrappedText(question.question, 70, width - 120, 11, helveticaFont)
      yPosition -= 10

      // Options for multiple choice
      if (question.type === 'multipleChoice' && question.options) {
        question.options.forEach((option: string, optIdx: number) => {
          checkPageSpace(15)
          const letter = String.fromCharCode(65 + optIdx)
          const isUserAnswer = answer?.answer === letter
          const isCorrectOption = question.correctAnswer === letter

          let optionColor = gray
          if (isCorrectOption) optionColor = green
          else if (isUserAnswer && !isCorrect) optionColor = red

          currentPage.drawText(`   ${letter}. ${option}`, {
            x: 70,
            y: yPosition,
            size: 10,
            font: isCorrectOption || isUserAnswer ? helveticaBoldFont : helveticaFont,
            color: optionColor
          })
          yPosition -= 15
        })
      }

      // User's answer
      checkPageSpace(30)
      currentPage.drawText('Your Answer:', {
        x: 50,
        y: yPosition,
        size: 11,
        font: helveticaBoldFont,
        color: black
      })
      yPosition -= 18

      if (answer?.answer) {
        drawWrappedText(answer.answer, 70, width - 120, 10, helveticaFont, isCorrect ? green : red)
      } else {
        currentPage.drawText('(No answer provided)', {
          x: 70,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: gray
        })
        yPosition -= 15
      }

      // Correct answer (if wrong)
      if (!isCorrect && question.correctAnswer) {
        checkPageSpace(30)
        yPosition -= 5
        currentPage.drawText('Correct Answer:', {
          x: 50,
          y: yPosition,
          size: 11,
          font: helveticaBoldFont,
          color: green
        })
        yPosition -= 18

        drawWrappedText(question.correctAnswer, 70, width - 120, 10, helveticaFont, green)
      }

      // AI Feedback for subjective questions
      if (questionFeedback?.aiFeedback) {
        checkPageSpace(60)
        yPosition -= 10

        currentPage.drawText('AI Feedback:', {
          x: 50,
          y: yPosition,
          size: 11,
          font: helveticaBoldFont,
          color: lightBlue
        })
        yPosition -= 18

        drawWrappedText(questionFeedback.aiFeedback, 70, width - 120, 10, helveticaFont, gray)
        yPosition -= 10

        currentPage.drawText(`Points Earned: ${questionFeedback.points}/${question.points}`, {
          x: 70,
          y: yPosition,
          size: 10,
          font: helveticaBoldFont,
          color: gray
        })
        yPosition -= 15
      }

      // Result indicator
      checkPageSpace(25)
      currentPage.drawText(isCorrect ? '✓ Correct' : '✗ Incorrect', {
        x: 50,
        y: yPosition,
        size: 11,
        font: helveticaBoldFont,
        color: isCorrect ? green : red
      })
      yPosition -= 30
    })

    // Footer on last page
    checkPageSpace(40)
    yPosition = 40
    currentPage.drawText('Generated by OpusMentis - https://opusmentis.com', {
      x: 50,
      y: yPosition,
      size: 8,
      font: helveticaFont,
      color: gray
    })

    // Generate PDF buffer
    const pdfBytes = await pdfDoc.save()

    // Return PDF
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quiz_results_${attempt.quiz.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`
      }
    })

  } catch (error) {
    console.error('Quiz PDF export error:', error)
    return NextResponse.json({
      error: 'Failed to generate PDF export'
    }, { status: 500 })
  }
}
