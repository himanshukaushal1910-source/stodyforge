import './globals.css'

export const metadata = {
  title: 'StudyForge — AI Study Platform',
  description: 'Your AI-powered study companion for Class 6-12. Adaptive quizzes, instant doubt solving, and smart study plans.',
  keywords: 'study, AI, quiz, doubt solver, study planner, Class 6-12, school',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}