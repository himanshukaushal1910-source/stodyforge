'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import ExamEdge from '@/components/ExamEdge'
import DoubtSnap from '@/components/DoubtSnap'
import PlanIt from '@/components/PlanIt'

export default function Home() {
  const [activeTab, setActiveTab] = useState('examedge')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = {
    examedge: <ExamEdge />,
    doubtsnap: <DoubtSnap />,
    planit: <PlanIt />,
  }

  return (
    <div className="flex min-h-screen grid-bg">
      {/* Ambient background orbs */}
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-20%',
          right: '-10%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab)
          setSidebarOpen(false)
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: '260px',
          padding: '32px',
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
        }}
        className="main-content"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {tabs[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 40,
              display: 'none',
            }}
            className="mobile-overlay"
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: 16px !important;
            padding-top: 72px !important;
          }
          .mobile-overlay {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}