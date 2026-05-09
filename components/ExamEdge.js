'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Flame, Trophy, RotateCcw, ChevronRight,
  CheckCircle2, XCircle, Lightbulb, Target, Zap
} from 'lucide-react'

const DIFFICULTY_CONFIG = {
  Easy: { color: '#10b981', badge: 'badge-easy', next: 'Medium', streakNeeded: 3 },
  Medium: { color: '#f59e0b', badge: 'badge-medium', next: 'Hard', streakNeeded: 3 },
  Hard: { color: '#ef4444', badge: 'badge-hard', next: 'Hard', streakNeeded: 999 },
}

export default function ExamEdge() {
  const [topic, setTopic] = useState('')
  const [classLevel, setClassLevel] = useState('10')
  const [subject, setSubject] = useState('Science')
  const [phase, setPhase] = useState('setup') // setup | loading | quiz | result | finished
  const [currentQ, setCurrentQ] = useState(null)
  const [difficulty, setDifficulty] = useState('Easy')
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null) // { correct, explanation }
  const [qHistory, setQHistory] = useState([])
  const [loadingNext, setLoadingNext] = useState(false)

  const fetchQuestion = useCallback(async (diff, currentStreak, currentScore) => {
    setLoadingNext(true)
    setSelected(null)
    setFeedback(null)

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          classLevel,
          subject,
          difficulty: diff,
          previousQuestions: qHistory.slice(-3).map(q => q.question),
        }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      setCurrentQ(data)
      setPhase('quiz')
    } catch (err) {
      console.error(err)
      setPhase('setup')
      alert('Failed to generate question. Please check your API key and try again.')
    } finally {
      setLoadingNext(false)
    }
  }, [topic, classLevel, subject, qHistory])

  const startQuiz = () => {
    if (!topic.trim()) return
    setDifficulty('Easy')
    setStreak(0)
    setScore({ correct: 0, total: 0 })
    setQHistory([])
    setPhase('loading')
    fetchQuestion('Easy', 0, { correct: 0, total: 0 })
  }

  const handleAnswer = (optionIndex) => {
    if (selected !== null || feedback) return
    setSelected(optionIndex)

    const isCorrect = optionIndex === currentQ.correctIndex
    const newStreak = isCorrect ? streak + 1 : 0
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    }

    setStreak(newStreak)
    setScore(newScore)
    setQHistory(prev => [...prev, { question: currentQ.question, correct: isCorrect }])
    setFeedback({
      correct: isCorrect,
      explanation: currentQ.explanation,
      correctIndex: currentQ.correctIndex,
    })

    // Auto-advance difficulty
    const config = DIFFICULTY_CONFIG[difficulty]
    if (isCorrect && newStreak >= config.streakNeeded && difficulty !== 'Hard') {
      setDifficulty(config.next)
    }
  }

  const nextQuestion = () => {
    if (score.total >= 10) {
      setPhase('finished')
      return
    }
    const config = DIFFICULTY_CONFIG[difficulty]
    const nextDiff = feedback?.correct && streak >= config.streakNeeded && difficulty !== 'Hard'
      ? config.next
      : difficulty
    fetchQuestion(nextDiff, streak, score)
  }

  const reset = () => {
    setPhase('setup')
    setTopic('')
    setCurrentQ(null)
    setDifficulty('Easy')
    setStreak(0)
    setScore({ correct: 0, total: 0 })
    setSelected(null)
    setFeedback(null)
    setQHistory([])
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  // ── SETUP PHASE ──
  if (phase === 'setup') {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                }}
              >
                <Brain size={22} color="white" />
              </div>
              <div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '26px' }}>
                  ExamEdge
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Adaptive Quiz Engine
                </p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginTop: '12px' }}>
              Quiz that grows with you. Answer correctly 3 times in a row and the questions get harder. 
              Perfect for exam prep.
            </p>
          </div>

          {/* How it works */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            {[
              { icon: Target, label: 'Start Easy', desc: 'Begin with foundational questions', color: '#10b981' },
              { icon: Flame, label: '3-Streak Rule', desc: 'Get 3 right → difficulty jumps', color: '#f59e0b' },
              { icon: Trophy, label: '10 Questions', desc: 'Score and feedback at the end', color: '#8b5cf6' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div
                key={label}
                className="glass-card"
                style={{ padding: '16px', textAlign: 'center' }}
              >
                <Icon size={20} color={color} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Class
                </label>
                <select
                  value={classLevel}
                  onChange={e => setClassLevel(e.target.value)}
                  className="input-base"
                  style={{ cursor: 'pointer' }}
                >
                  {['6', '7', '8', '9', '10', '11', '12'].map(c => (
                    <option key={c} value={c} style={{ background: 'var(--bg-card)' }}>Class {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="input-base"
                  style={{ cursor: 'pointer' }}
                >
                  {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English', 'Economics', 'Computer Science'].map(s => (
                    <option key={s} value={s} style={{ background: 'var(--bg-card)' }}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Topic or Chapter
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startQuiz()}
                placeholder="e.g. Photosynthesis, Quadratic Equations, French Revolution..."
                className="input-base"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={startQuiz}
              disabled={!topic.trim()}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}
            >
              <Zap size={16} />
              Start Adaptive Quiz
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── LOADING PHASE ──
  if (phase === 'loading' || loadingNext) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <Brain size={40} color="#3b82f6" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
              Generating your question...
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Crafting a {difficulty} question on {topic}
            </p>
          </div>
          <div className="thinking" style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
            <span /><span /><span />
          </div>
        </div>
      </div>
    )
  }

  // ── FINISHED PHASE ──
  if (phase === 'finished') {
    const grade = accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : accuracy >= 40 ? 'Fair' : 'Keep Practicing'
    const gradeColor = accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#3b82f6' : accuracy >= 40 ? '#f59e0b' : '#ef4444'

    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{ padding: '40px', textAlign: 'center' }}
        >
          <Trophy size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', marginBottom: '8px' }}>
            Quiz Complete!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            Topic: <span style={{ color: 'var(--text-primary)' }}>{topic}</span> · Class {classLevel} · {subject}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Score', value: `${score.correct}/10`, color: '#3b82f6' },
              { label: 'Accuracy', value: `${accuracy}%`, color: gradeColor },
              { label: 'Top Level', value: difficulty, color: DIFFICULTY_CONFIG[difficulty].color },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '20px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '24px', color, marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: `rgba(${gradeColor === '#10b981' ? '16,185,129' : gradeColor === '#3b82f6' ? '59,130,246' : gradeColor === '#f59e0b' ? '245,158,11' : '239,68,68'},0.1)`,
              border: `1px solid ${gradeColor}33`,
              marginBottom: '24px',
            }}
          >
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: gradeColor }}>
              {grade}
            </span>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {accuracy >= 80
                ? 'Outstanding performance! You clearly have a strong grip on this topic.'
                : accuracy >= 60
                ? 'Good understanding. Review the questions you got wrong and try again.'
                : accuracy >= 40
                ? 'Decent start. Spend more time on this topic and attempt again.'
                : 'This topic needs more revision. Go through your notes and try again.'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className="btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <RotateCcw size={15} />
            Try Another Topic
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // ── QUIZ PHASE ──
  if (phase === 'quiz' && currentQ) {
    const config = DIFFICULTY_CONFIG[difficulty]

    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`tag ${config.badge}`}>{difficulty}</span>
              {streak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={14} color="#f59e0b" />
                  <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                    {streak} streak
                  </span>
                </div>
              )}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Q{score.total + 1} / 10 · {score.correct} correct
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score.total / 10) * 100}%` }}
              style={{
                height: '100%',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.question}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="glass-card"
            style={{ padding: '28px', marginBottom: '16px' }}
          >
            <p style={{ fontSize: '17px', lineHeight: 1.65, fontWeight: 500, marginBottom: '24px' }}>
              {currentQ.question}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQ.options.map((opt, i) => {
                let borderColor = 'var(--border)'
                let bg = 'var(--bg)'
                let textColor = 'var(--text-secondary)'

                if (feedback) {
                  if (i === feedback.correctIndex) {
                    borderColor = '#10b981'
                    bg = 'rgba(16,185,129,0.08)'
                    textColor = '#10b981'
                  } else if (i === selected && !feedback.correct) {
                    borderColor = '#ef4444'
                    bg = 'rgba(239,68,68,0.08)'
                    textColor = '#ef4444'
                  }
                } else if (selected === i) {
                  borderColor = '#3b82f6'
                  bg = 'rgba(59,130,246,0.08)'
                  textColor = '#3b82f6'
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={!feedback ? { x: 3 } : {}}
                    whileTap={!feedback ? { scale: 0.99 } : {}}
                    onClick={() => handleAnswer(i)}
                    disabled={!!feedback}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${borderColor}`,
                      background: bg,
                      cursor: feedback ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: `1px solid ${borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        fontSize: '12px',
                        color: textColor,
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ fontSize: '14px', color: textColor, transition: 'color 0.2s ease', lineHeight: 1.5 }}>
                      {opt}
                    </span>
                    {feedback && i === feedback.correctIndex && (
                      <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                    )}
                    {feedback && i === selected && !feedback.correct && (
                      <XCircle size={16} color="#ef4444" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback & explanation */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card"
              style={{
                padding: '20px',
                marginBottom: '16px',
                borderColor: feedback.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: feedback.correct ? '#10b981' : '#ef4444',
                      marginBottom: '6px',
                    }}
                  >
                    {feedback.correct ? '✓ Correct!' : '✗ Incorrect'}
                    {feedback.correct && streak >= 2 && ` · ${streak} in a row! 🔥`}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {feedback.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button */}
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextQuestion}
              disabled={loadingNext}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {score.total >= 9 ? (
                <><Trophy size={15} /> See Results</>
              ) : (
                <><ChevronRight size={15} /> Next Question {loadingNext ? '...' : ''}</>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    )
  }

  return null
}