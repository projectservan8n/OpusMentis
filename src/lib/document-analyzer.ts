import OpenAI from 'openai'
import fs from 'fs/promises'
import pdf from 'pdf-parse'

// Primary: OpenRouter with gpt-oss-20b (free tier)
// Fallback: OpenAI with gpt-4o-mini (paid)
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

const AI_MODEL = useOpenRouter ? 'openai/gpt-oss-20b' : 'gpt-4o-mini'

export interface Chapter {
  title: string
  startPage: number
  endPage: number
}

export interface Section {
  title: string
  chapter: string
  startPage: number
  endPage: number
}

export interface KeyTerm {
  term: string
  definition: string
  page: number
}

export interface DocumentStructure {
  chapters: Chapter[]
  sections: Section[]
  keyTerms: KeyTerm[]
  totalPages: number
}

/**
 * Extract text from PDF file for analysis
 * Using pdf-parse for server-side PDF parsing
 */
export async function extractPDFText(filePath: string): Promise<{ text: string; totalPages: number }> {
  try {
    // Read PDF file
    const dataBuffer = await fs.readFile(filePath)

    // Parse PDF
    const data = await pdf(dataBuffer)

    // pdf-parse doesn't give us per-page text easily, so we'll use the full text
    // We'll estimate page breaks based on character count
    const totalPages = data.numpages
    const text = data.text

    // Simple approach: mark approximate page breaks
    // This is not perfect but gives GPT-4o-mini some page context
    const charsPerPage = Math.ceil(text.length / totalPages)
    let markedText = ''

    for (let i = 0; i < totalPages; i++) {
      const startChar = i * charsPerPage
      const endChar = Math.min((i + 1) * charsPerPage, text.length)
      const pageText = text.substring(startChar, endChar)
      markedText += `\n--- PAGE ${i + 1} ---\n${pageText}\n`
    }

    return { text: markedText, totalPages }
  } catch (error) {
    console.error('PDF text extraction failed:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Analyze document structure using GPT-4o-mini
 */
export async function analyzeDocumentStructure(
  pdfText: string,
  totalPages: number
): Promise<DocumentStructure> {
  try {
    // Limit text for API call (GPT-4o-mini has 128k context but we'll be conservative)
    const maxChars = 50000
    const truncatedText = pdfText.length > maxChars
      ? pdfText.substring(0, maxChars) + '\n... [truncated]'
      : pdfText

    const prompt = `
You are a document analysis AI. Analyze the following document text and extract its structure.

The document text includes page markers in the format "--- PAGE X ---".

Document text:
${truncatedText}

Please analyze this document and return a JSON response with the following structure:
{
  "chapters": [
    {
      "title": "Chapter title",
      "startPage": 1,
      "endPage": 10
    }
  ],
  "sections": [
    {
      "title": "Section title",
      "chapter": "Chapter title it belongs to",
      "startPage": 1,
      "endPage": 3
    }
  ],
  "keyTerms": [
    {
      "term": "Important term",
      "definition": "Brief definition",
      "page": 5
    }
  ]
}

Guidelines:
- Identify main chapters/units based on headings and structure
- Extract subsections within each chapter
- Find 10-20 key terms/concepts with their definitions
- Use page markers to determine accurate page numbers
- If the document doesn't have clear chapters (e.g., a research paper), treat major sections as chapters
- For academic papers: Introduction, Methods, Results, Discussion can be chapters
- Be precise with page numbers based on the "--- PAGE X ---" markers
- If unsure about structure, make educated guesses based on formatting and content

Return only valid JSON, no additional text.
`

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a document analysis AI that extracts structure from academic and educational documents. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent structure extraction
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Clean response - remove markdown code blocks if present
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }

    // Parse and validate JSON response
    const structure = JSON.parse(cleanedResponse) as Omit<DocumentStructure, 'totalPages'>

    return {
      ...structure,
      totalPages
    }

  } catch (error) {
    console.error('Document structure analysis failed:', error)

    // Return fallback structure if AI fails
    return {
      chapters: [
        {
          title: 'Full Document',
          startPage: 1,
          endPage: totalPages
        }
      ],
      sections: [],
      keyTerms: [],
      totalPages
    }
  }
}

/**
 * Main function to analyze a PDF document
 */
export async function analyzePDFDocument(filePath: string): Promise<DocumentStructure> {
  // Extract text from PDF
  const { text, totalPages } = await extractPDFText(filePath)

  // Analyze structure with AI
  const structure = await analyzeDocumentStructure(text, totalPages)

  return structure
}
