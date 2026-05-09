import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req) {
  try {
    const { subjects, examDate, daysLeft, hoursPerDay, classLevel, extraNotes } = await req.json()

    if (!subjects?.length || !examDate || !daysLeft || !hoursPerDay) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Cap plan at 14 days to keep response manageable and fast
    const planDays = Math.min(parseInt(daysLeft), 14)
    const totalHours = planDays * parseInt(hoursPerDay)

    const subjectList = subjects
      .map(s => `- ${s.name} (Proficiency: ${s.weak})`)
      .join('\n')

    // Generate date labels for each day
    const dateLabels = []
    for (let i = 0; i < planDays; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      dateLabels.push(d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }))
    }

    const prompt = `You are an expert academic counsellor for Indian school students.
Create a detailed ${planDays}-day study plan for a Class ${classLevel} student.

Exam date: ${examDate}
Days left: ${daysLeft} (plan for first ${planDays} days)
Study hours per day: ${hoursPerDay}
Total planned hours: ${totalHours}

Subjects and proficiency:
${subjectList}

${extraNotes ? `Student's notes: ${extraNotes}` : ''}

Planning rules:
1. Allocate MORE time to weaker subjects (Very Weak > Weak > Moderate > Strong)
2. Mix subjects across days — don't do only one subject for 3 days
3. Last 2 days should be full revision days (mark isRevision: true)
4. Include specific tasks — not just "study maths" but "Practice Chapter 5 Quadratic Equations Q1-Q15"
5. Each day should have 3-5 specific tasks filling the ${hoursPerDay} hours
6. Add one practical study tip per day

Respond ONLY with valid JSON:
{
  "strategy": "1-2 sentence overall strategy for this student given their weak areas and time available",
  "days": [
    {
      "day": 1,
      "date": "${dateLabels[0] || 'Day 1'}",
      "focus": "Main subjects covered today",
      "totalHours": ${hoursPerDay},
      "isRevision": false,
      "tasks": [
        "Task 1 with specific detail (e.g. 45 min: Read Physics Chapter 4 - Laws of Motion, make 1-page notes)",
        "Task 2 with specific detail",
        "Task 3 with specific detail"
      ],
      "tip": "A specific, actionable study tip for today"
    }
  ]
}

Generate all ${planDays} days. Use these exact dates: ${dateLabels.join(', ')}.
Return ONLY valid JSON, no markdown.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 3000,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) throw new Error('Empty AI response')

    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
      throw new Error('Invalid plan structure')
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[Planner API Error]', err)
    return NextResponse.json(
      { error: 'Failed to generate plan. Please try again.' },
      { status: 500 }
    )
  }
}