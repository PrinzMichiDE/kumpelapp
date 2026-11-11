import type { Metadata } from 'next'
import { QuizPlay } from './quiz-play'

export const metadata: Metadata = {
  title: 'Veilchen-Quiz',
  description: 'Teste dein Wissen über den FC Erzgebirge Aue – Titel, Geschichte, Stadion und mehr.',
}

export default function QuizPage() {
  return (
    <main id="main-content" className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Veilchen-Quiz</h1>
          <p className="mt-2 text-fc-fg/70">
            Teste dein Wissen über den FC Erzgebirge Aue. Melde dich an, um deine Ergebnisse zu speichern.
          </p>
        </div>
        <QuizPlay />
      </div>
    </main>
  )
}
