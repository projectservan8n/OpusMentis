import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get study pack
    const studyPack = await db.studyPack.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    if (studyPack.status !== 'completed') {
      return NextResponse.json({
        error: 'Study pack is not ready for export'
      }, { status: 400 })
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Colors
    const darkBlue = rgb(0.1, 0.1, 0.4)
    const lightBlue = rgb(0.2, 0.4, 0.8)
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
    currentPage.drawText('StudyFlow AI', {
      x: 50,
      y: yPosition,
      size: 24,
      font: helveticaBoldFont,
      color: lightBlue
    })
    yPosition -= 40

    currentPage.drawText('Study Pack Export', {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
      color: darkBlue
    })
    yPosition -= 60

    // Study Pack Info
    currentPage.drawText(`Title: ${studyPack.title}`, {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: black
    })
    yPosition -= 25

    currentPage.drawText(`Original File: ${studyPack.originalFileName}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: gray
    })
    yPosition -= 20

    currentPage.drawText(`File Size: ${Math.round(studyPack.fileSize / 1024)} KB`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: gray
    })
    yPosition -= 20

    currentPage.drawText(`Created: ${new Date(studyPack.createdAt).toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: gray
    })
    yPosition -= 40

    // Description
    if (studyPack.description) {
      currentPage.drawText('Description:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: black
      })
      yPosition -= 25

      drawWrappedText(studyPack.description, 50, width - 100, 12, helveticaFont, gray)
      yPosition -= 20
    }

    // Summary Section
    if (studyPack.summary) {
      checkPageSpace(100)
      yPosition -= 20

      currentPage.drawText('AI-Generated Summary', {
        x: 50,
        y: yPosition,
        size: 16,
        font: helveticaBoldFont,
        color: darkBlue
      })
      yPosition -= 30

      drawWrappedText(studyPack.summary, 50, width - 100, 11, helveticaFont)
      yPosition -= 20
    }

    // Topics Section
    if (studyPack.topics) {
      const topics = JSON.parse(studyPack.topics)
      if (topics.length > 0) {
        checkPageSpace(100)
        yPosition -= 20

        currentPage.drawText('Key Topics', {
          x: 50,
          y: yPosition,
          size: 16,
          font: helveticaBoldFont,
          color: darkBlue
        })
        yPosition -= 30

        topics.forEach((topic: string, index: number) => {
          checkPageSpace(20)
          currentPage.drawText(`• ${topic}`, {
            x: 50,
            y: yPosition,
            size: 11,
            font: helveticaFont,
            color: black
          })
          yPosition -= 18
        })
        yPosition -= 10
      }
    }

    // Flashcards Section
    if (studyPack.flashcards) {
      const flashcards = JSON.parse(studyPack.flashcards)
      if (flashcards.length > 0) {
        checkPageSpace(100)
        yPosition -= 20

        currentPage.drawText('Flashcards', {
          x: 50,
          y: yPosition,
          size: 16,
          font: helveticaBoldFont,
          color: darkBlue
        })
        yPosition -= 30

        flashcards.forEach((card: any, index: number) => {
          checkPageSpace(80)

          currentPage.drawText(`${index + 1}. ${card.difficulty?.toUpperCase() || 'MEDIUM'}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font: helveticaBoldFont,
            color: lightBlue
          })
          yPosition -= 20

          currentPage.drawText('Q:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: helveticaBoldFont,
            color: black
          })

          drawWrappedText(card.question, 70, width - 120, 11, helveticaFont)
          yPosition -= 15

          currentPage.drawText('A:', {
            x: 50,
            y: yPosition,
            size: 12,
            font: helveticaBoldFont,
            color: black
          })

          drawWrappedText(card.answer, 70, width - 120, 11, helveticaFont, gray)
          yPosition -= 25
        })
      }
    }

    // Kanban Tasks Section
    if (studyPack.kanbanTasks) {
      const kanbanTasks = JSON.parse(studyPack.kanbanTasks)
      if (kanbanTasks.length > 0) {
        checkPageSpace(100)
        yPosition -= 20

        currentPage.drawText('Learning Tasks', {
          x: 50,
          y: yPosition,
          size: 16,
          font: helveticaBoldFont,
          color: darkBlue
        })
        yPosition -= 30

        const tasksByColumn = {
          'to-learn': kanbanTasks.filter((t: any) => t.column === 'to-learn'),
          'learning': kanbanTasks.filter((t: any) => t.column === 'learning'),
          'mastered': kanbanTasks.filter((t: any) => t.column === 'mastered')
        }

        Object.entries(tasksByColumn).forEach(([column, tasks]) => {
          if (tasks.length > 0) {
            checkPageSpace(40)

            const columnTitle = column.charAt(0).toUpperCase() + column.slice(1).replace('-', ' ')
            currentPage.drawText(columnTitle, {
              x: 50,
              y: yPosition,
              size: 14,
              font: helveticaBoldFont,
              color: lightBlue
            })
            yPosition -= 25

            tasks.forEach((task: any) => {
              checkPageSpace(50)

              currentPage.drawText(`• ${task.title} (${task.priority})`, {
                x: 60,
                y: yPosition,
                size: 11,
                font: helveticaBoldFont,
                color: black
              })
              yPosition -= 15

              if (task.description) {
                drawWrappedText(task.description, 70, width - 120, 10, helveticaFont, gray)
                yPosition -= 5
              }
              yPosition -= 10
            })
            yPosition -= 10
          }
        })
      }
    }

    // Notes Section
    if (studyPack.notes && studyPack.notes.length > 0) {
      checkPageSpace(100)
      yPosition -= 20

      currentPage.drawText('Personal Notes', {
        x: 50,
        y: yPosition,
        size: 16,
        font: helveticaBoldFont,
        color: darkBlue
      })
      yPosition -= 30

      studyPack.notes.forEach((note, index) => {
        checkPageSpace(60)

        const noteDate = new Date(note.createdAt).toLocaleDateString()
        currentPage.drawText(`${index + 1}. ${note.section?.toUpperCase() || 'GENERAL'} - ${noteDate}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: helveticaBoldFont,
          color: lightBlue
        })
        yPosition -= 20

        drawWrappedText(note.content, 60, width - 110, 11, helveticaFont)
        yPosition -= 20
      })
    }

    // Footer on last page
    checkPageSpace(40)
    yPosition = 40
    currentPage.drawText('Generated by StudyFlow AI - https://studyflow.ai', {
      x: 50,
      y: yPosition,
      size: 8,
      font: helveticaFont,
      color: gray
    })

    // Generate PDF buffer
    const pdfBytes = await pdfDoc.save()

    // Return PDF
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${studyPack.title.replace(/[^a-zA-Z0-9]/g, '_')}_study_pack.pdf"`
      }
    })

  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json({
      error: 'Failed to generate PDF export'
    }, { status: 500 })
  }
}