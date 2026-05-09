'use client'

import { motion } from 'framer-motion'
import { Brain, MessageCircleQuestion, CalendarDays, Zap, Menu, X, GraduationCap } from 'lucide-react'

const navItems = [
  {
    id: 'examedge',
    label: 'ExamEdge',
    sublabel: 'Adaptive Quiz',
    icon: Brain,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  },
  {
    id: 'doubtsnap',
    label: 'DoubtSnap',
    sublabel: 'Doubt Solver',
    icon: MessageCircleQuestion,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
  {
    id: 'planit',
    label: 'PlanIt',
    sublabel: 'Study Planner',
    icon: CalendarDays,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
]

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 60,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          display: 'none',
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '260px',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          padding: '24px 16px',
          transition: 'transform 0.3s ease',
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap size={20} color="white" />
            </div>
            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: '20px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              StudyForge
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '46px' }}>
            AI Study Platform · Class 6–12
          </p>
        </div>

        {/* Nav label */}
        <p
          style={{
            fontSize: '10px',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            paddingLeft: '8px',
            marginBottom: '8px',
          }}
        >
          Tools
        </p>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  background: isActive
                    ? `rgba(${item.color === '#3b82f6' ? '59,130,246' : item.color === '#8b5cf6' ? '139,92,246' : '16,185,129'},0.12)`
                    : 'transparent',
                  width: '100%',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '60%',
                      borderRadius: '0 2px 2px 0',
                      background: item.gradient,
                    }}
                  />
                )}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isActive ? item.gradient : 'var(--bg)',
                    border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={17} color={isActive ? 'white' : item.color} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '1px',
                    }}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </nav>

        {/* Bottom info */}
        <div style={{ marginTop: 'auto', paddingLeft: '8px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Zap size={13} color="#3b82f6" />
              <span
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#3b82f6',
                }}
              >
                Powered by Groq
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Ultra-fast AI responses using Llama 3.3 70B
            </p>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  )
}