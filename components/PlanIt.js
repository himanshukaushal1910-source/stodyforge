'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Plus, X, Zap, Download,
  BookMarked, Clock, AlertCircle, ChevronDown, ChevronUp, Star
} from 'lucide-react'

const SUBJECTS_LIST = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'English', 'Economics', 'Computer Science', 'Sanskrit'
]

const WEAK_LEVELS = ['Very Weak', 'Weak', 'Moderate', 'Strong']

export default function PlanIt() {
  const [subjects, setSubjects] = useState([{ name: 'Mathematics', weak: 'Weak' }])
  const [examDate, setExamDate] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('3')
  const [classLevel, setClassLevel] = useState('10')
  const [extraNotes, setExtraNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)
  const [expandedDay, setExpandedDay] = useState(0)

  const addSubject = () => {
    if (subjects.length >= 8) return
    setSubjects(prev => [...prev, { name: 'Science', weak: 'Moderate' }])
  }

  const removeSubject = (i) => {
    if (subjects.length <= 1) return
    setSubjects(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateSubject = (i, field, value) => {
    setSubjects(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const getDaysUntilExam = () => {
    if (!examDate) return null
    const today = new Date()
    const exam = new Date(examDate)
    const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : null
  }

  const generatePlan = async () => {
    if (!examDate || loading) return
    const days = getDaysUntilExam()
    if (!days) {
      setError('Please select a future exam date.')
      return
    }

    setLoading(true)
    setError(null)
    setPlan(null)

    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          examDate,
          daysLeft: days,
          hoursPerDay,
          classLevel,
          extraNotes,
        }),
      })

      if (!res.ok) throw new Error('API failed')
      const data = await res.json()
      setPlan(data)
      setExpandedDay(0)
    } catch (err) {
      setError('Failed to generate plan. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyPlan = () => {
    if (!plan) return
    const text = plan.days.map(d =>
      `Day ${d.day} — ${d.date}\n${d.tasks.map(t => `  • ${t}`).join('\n')}\nTip: ${d.tip}`
    ).join('\n\n')
    navigator.clipboard.writeText(`STUDY PLAN — Class ${classLevel}\nExam: ${examDate}\n\n${text}`)
      .then(() => alert('Plan copied to clipboard!'))
  }

  const days = getDaysUntilExam()

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            }}
          >
            <CalendarDays size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '26px' }}>PlanIt</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>AI Study Planner</p>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginTop: '12px' }}>
          Enter your subjects, exam date, and weak areas. Get a personalized day-by-day study
          schedule optimised by AI — with daily goals, time blocks, and revision tips.
        </p>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {!plan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Basic info */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                Exam Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-base"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hours/Day
                  </label>
                  <select
                    value={hoursPerDay}
                    onChange={e => setHoursPerDay(e.target.value)}
                    className="input-base"
                    style={{ cursor: 'pointer' }}
                  >
                    {['1', '2', '3', '4', '5', '6', '7', '8'].map(h => (
                      <option key={h} value={h} style={{ background: 'var(--bg-card)' }}>{h} hour{h !== '1' ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {days && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: '14px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: days <= 7
                      ? 'rgba(239,68,68,0.08)'
                      : days <= 14
                      ? 'rgba(245,158,11,0.08)'
                      : 'rgba(16,185,129,0.08)',
                    border: `1px solid ${days <= 7 ? 'rgba(239,68,68,0.2)' : days <= 14 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Clock size={14} color={days <= 7 ? '#ef4444' : days <= 14 ? '#f59e0b' : '#10b981'} />
                  <span
                    style={{
                      fontSize: '13px',
                      color: days <= 7 ? '#ef4444' : days <= 14 ? '#f59e0b' : '#10b981',
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    {days} days until exam · {Math.round(parseInt(hoursPerDay) * days)} total study hours
                  </span>
                </motion.div>
              )}
            </div>

            {/* Subjects */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                  Subjects & Proficiency
                </h3>
                <button
                  onClick={addSubject}
                  disabled={subjects.length >= 8}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-bright)',
                    background: 'transparent',
                    color: '#10b981',
                    cursor: subjects.length >= 8 ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 600,
                    opacity: subjects.length >= 8 ? 0.5 : 1,
                  }}
                >
                  <Plus size={13} /> Add Subject
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {subjects.map((sub, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <select
                      value={sub.name}
                      onChange={e => updateSubject(i, 'name', e.target.value)}
                      className="input-base"
                      style={{ padding: '10px 14px', cursor: 'pointer' }}
                    >
                      {SUBJECTS_LIST.map(s => (
                        <option key={s} value={s} style={{ background: 'var(--bg-card)' }}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={sub.weak}
                      onChange={e => updateSubject(i, 'weak', e.target.value)}
                      className="input-base"
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        color: sub.weak === 'Very Weak' ? '#ef4444' : sub.weak === 'Weak' ? '#f59e0b' : sub.weak === 'Moderate' ? '#3b82f6' : '#10b981',
                      }}
                    >
                      {WEAK_LEVELS.map(l => (
                        <option key={l} value={l} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{l}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeSubject(i)}
                      disabled={subjects.length <= 1}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: subjects.length <= 1 ? 'var(--text-muted)' : '#ef4444',
                        cursor: subjects.length <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: subjects.length <= 1 ? 0.3 : 1,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Extra notes */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Extra Notes (Optional)
              </label>
              <textarea
                value={extraNotes}
                onChange={e => setExtraNotes(e.target.value)}
                placeholder="e.g. I have school until 2pm, prefer not to study on Sundays, Physics exam is more important..."
                className="input-base"
                rows={2}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444',
                  fontSize: '14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={generatePlan}
              disabled={!examDate || !days || loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '15px',
                padding: '14px',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(16,185,129,0.3)',
              }}
            >
              {loading ? (
                <>
                  <div className="thinking" style={{ display: 'flex', gap: '4px' }}>
                    <span /><span /><span />
                  </div>
                  Building your study plan...
                </>
              ) : (
                <><Zap size={16} /> Generate My Study Plan</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan output */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Plan header */}
            <div
              className="glass-card"
              style={{ padding: '20px 24px', marginBottom: '16px', borderColor: 'rgba(16,185,129,0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>
                    Your Study Plan
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Class {classLevel} · {days} days · {hoursPerDay}h/day · {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={copyPlan}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    <Download size={13} />
                    Copy Plan
                  </button>
                  <button
                    onClick={() => setPlan(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.08)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    <X size={13} />
                    Rebuild
                  </button>
                </div>
              </div>

              {/* Strategy note */}
              {plan.strategy && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: '#10b981', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Strategy: </span>
                  {plan.strategy}
                </div>
              )}
            </div>

            {/* Daily plan cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {plan.days.map((day, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card"
                  style={{
                    overflow: 'hidden',
                    borderColor: expandedDay === i ? 'rgba(16,185,129,0.25)' : 'var(--border)',
                  }}
                >
                  <button
                    onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: day.isRevision
                            ? 'rgba(139,92,246,0.15)'
                            : 'rgba(16,185,129,0.12)',
                          border: `1px solid ${day.isRevision ? 'rgba(139,92,246,0.25)' : 'rgba(16,185,129,0.2)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {day.isRevision
                          ? <Star size={16} color="#8b5cf6" />
                          : <BookMarked size={16} color="#10b981" />
                        }
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                          Day {day.day} — {day.date}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {day.focus} · {day.totalHours}h
                        </div>
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {expandedDay === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedDay === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 20px 20px' }}>
                          <div
                            style={{
                              height: '1px',
                              background: 'var(--border)',
                              marginBottom: '16px',
                            }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                            {day.tasks.map((task, j) => (
                              <div
                                key={j}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  borderRadius: '8px',
                                  background: 'var(--bg)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                <div
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    flexShrink: 0,
                                    marginTop: '6px',
                                  }}
                                />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                  {task}
                                </span>
                              </div>
                            ))}
                          </div>
                          {day.tip && (
                            <div
                              style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                background: 'rgba(245,158,11,0.06)',
                                border: '1px solid rgba(245,158,11,0.15)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                              }}
                            >
                              <BookMarked size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                <span style={{ color: '#f59e0b', fontWeight: 600 }}>Tip: </span>
                                {day.tip}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}