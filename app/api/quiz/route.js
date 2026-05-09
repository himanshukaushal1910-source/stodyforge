import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req) {
  try {
    const { topic, classLevel, subject, difficulty, previousQuestions } = await req.json()

    if (!topic || !classLevel || !subject || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const avoidList = previousQuestions?.length
      ? `Avoid these recently asked questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : ''

    const prompt = `You are an expert teacher for Indian school students (Class ${classLevel}).
Generate a single ${difficulty} difficulty MCQ question on the topic: "${topic}" (Subject: ${subject}).

${avoidList}

The question must:
- Be appropriate for Class ${classLevel} CBSE/ICSE curriculum
- Have exactly 4 options (A, B, C, D)
- Have one clearly correct answer
- Be engaging and test genuine understanding, not just memorization
- For "Hard" difficulty: include application-based or multi-step reasoning

Respond ONLY with valid JSON in this EXACT format:
{
  "question": "The full question text here?",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctIndex": 0,
  "explanation": "Clear explanation of why the correct answer is right, and why the wrong ones are wrong. Keep it educational and under 80 words."
}

correctIndex is 0-based (0=A, 1=B, 2=C, 3=D).
Return ONLY the JSON object, no markdown, no extra text.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) throw new Error('Empty response from AI')

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    // Validate structure
    if (
      !parsed.question ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correctIndex !== 'number' ||
      !parsed.explanation
    ) {
      throw new Error('Invalid question structure from AI')
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[Quiz API Error]', err)
    return NextResponse.json(
      { error: 'Failed to generate question. Please try again.' },
      { status: 500 }
    )
  }
}