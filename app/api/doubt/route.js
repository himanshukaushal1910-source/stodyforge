import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req) {
  try {
    const { doubt, classLevel, subject } = await req.json()

    if (!doubt?.trim()) {
      return NextResponse.json({ error: 'Doubt text is required' }, { status: 400 })
    }

    const subjectContext = subject === 'Auto-detect'
      ? 'Auto-detect the subject from the question.'
      : `Subject: ${subject}.`

    const prompt = `You are an expert tutor for Indian school students (Class ${classLevel}).
${subjectContext}

A student has the following doubt:
"${doubt}"

Provide a comprehensive response in this EXACT JSON format:
{
  "detectedSubject": "The subject you detected or the given subject",
  "solution": "Step-by-step solution. Use numbered steps (1. 2. 3.) for problems. Be clear and thorough but concise. Max 200 words.",
  "concept": "Explain the underlying concept or theory behind this question in simple language that a Class ${classLevel} student can understand. Connect it to what they learn in school. Max 100 words.",
  "trick": "Give a memorable trick, mnemonic, shortcut, or analogy to help the student remember this concept or solve similar problems faster. Be creative and relatable for a school student. Max 80 words.",
  "practice": "Give ONE follow-up practice question of similar difficulty that tests the same concept. Just the question, no answer. Make it slightly different from the student's original doubt."
}

Rules:
- Use simple, encouraging language appropriate for Class ${classLevel}
- For math/science: show actual steps with numbers/formulas
- For theory questions: explain cause-effect clearly
- The memory trick must be genuinely helpful, not generic
- Return ONLY valid JSON, no markdown, no extra text`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1000,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) throw new Error('Empty AI response')

    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.solution || !parsed.concept || !parsed.trick || !parsed.practice) {
      throw new Error('Incomplete response structure')
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[Doubt API Error]', err)
    return NextResponse.json(
      { error: 'Failed to solve doubt. Please try again.' },
      { status: 500 }
    )
  }
}