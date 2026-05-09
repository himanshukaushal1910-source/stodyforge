'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircleQuestion, Send, BookOpen, Sparkles,
  Lightbulb, Target, ChevronDown, ChevronUp, Clock, RotateCcw
} from 'lucide-react'

const SUBJECTS = [
  'Auto-detect', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'History', 'Geography', 'English', 'Economics', 'Computer Science'
]

export default function DoubtSnap() {
  const [doubt, setDoubt] = useState('')
  const [classLevel, setClassLevel] = useState('10')
  const [subject, setSubject] = useState('Auto-detect')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [expandedHistory, setExpandedHistory] = useState(null)
  const [activeSection, setActiveSection] = useState('solution')

  const solveDoubt = async () => {
    if (!doubt.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doubt, classLevel, subject }),
      })

      if (!res.ok) throw new Error('API failed')
      const data = await res.json()

      setResult(data)
      setHistory(prev => [{ doubt: doubt.slice(0, 60) + (doubt.length > 60 ? '...' : ''), result: data, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5))
      setActiveSection('solution')
    } catch (err) {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadFromHistory = (item) => {
    setResult(item.result)
    setExpandedHistory(null)
    setActiveSection('solution')
  }

  const sections = result ? [
    { id: 'solution', label: 'Solution', icon: BookOpen, color: '#3b82f6', content: result.solution },
    { id: 'concept', label: 'Concept', icon: Lightbulb, color: '#f59e0b', content: result.concept },
    { id: 'trick', label: 'Memory Trick', icon: Sparkles, color: '#8b5cf6', content: result.trick },
    { id: 'practice', label: 'Practice Q', icon: Target, color: '#10b981', content: result.practice },
  ] : []

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto' }}>
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
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
            }}
          >
            <MessageCircleQuestion size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '26px' }}>
              DoubtSnap
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Instant Doubt Solver</p>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginTop: '12px' }}>
          Paste any question or doubt. Get a step-by-step solution, the underlying concept explained,
          a memory trick, and a practice question — all in one shot.
        </p>
      </motion.div>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{ padding: '24px', marginBottom: '20px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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
              Subject
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="input-base"
              style={{ cursor: 'pointer' }}
            >
              {SUBJECTS.map(s => (
                <option key={s} value={s} style={{ background: 'var(--bg-card)' }}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Doubt
          </label>
          <textarea
            value={doubt}
            onChange={e => setDoubt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.ctrlKey && solveDoubt()}
            placeholder="Paste your question or doubt here... e.g. 'Why does ice float on water?' or 'Solve: 2x² + 5x - 3 = 0'"
            className="input-base"
            rows={4}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tip: Press Ctrl+Enter to submit quickly
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={solveDoubt}
          disabled={!doubt.trim() || loading}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(139,92,246,0.3)',
          }}
        >
          {loading ? (
            <>
              <div className="thinking" style={{ display: 'flex', gap: '4px' }}>
                <span /><span /><span />
              </div>
              Solving your doubt...
            </>
          ) : (
            <><Send size={15} /> Solve My Doubt</>
          )}
        </motion.button>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result sections */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Detected subject */}
            {result.detectedSubject && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  width: 'fit-content',
                }}
              >
                <Sparkles size={13} color="#3b82f6" />
                <span style={{ fontSize: '12px', color: '#3b82f6', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                  Detected: {result.detectedSubject}
                </span>
              </div>
            )}

            {/* Tab navigation */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}
            >
              {sections.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${activeSection === id ? color + '44' : 'var(--border)'}`,
                    background: activeSection === id ? color + '15' : 'var(--bg-card)',
                    color: activeSection === id ? color : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Active section content */}
            <AnimatePresence mode="wait">
              {sections.map(({ id, icon: Icon, color, content }) =>
                activeSection === id ? (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card"
                    style={{
                      padding: '24px',
                      borderColor: color + '22',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <Icon size={16} color={color} />
                      <span
                        style={{
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          color,
                        }}
                      >
                        {sections.find(s => s.id === id)?.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {content}
                    </div>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>

            {/* Reset button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setResult(null); setDoubt(''); setError(null) }}
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              <RotateCcw size={13} />
              Ask Another Doubt
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && !result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: '20px' }}
        >
          <p
            style={{
              fontSize: '11px',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Recent Doubts
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 3 }}
                onClick={() => loadFromHistory(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.doubt}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.time}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}