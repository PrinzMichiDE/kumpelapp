'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, MoreVertical, Trophy, Calendar, User, Shield, Sparkles, Trophy as TrophyIcon } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Input } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@kumpelapp/ui'

const mockTitles = [
  { id: '1', year: 1955, competition: 'FDGB-Pokal', note: 'Erster Pokalsieg der Vereinsgeschichte (als SC Wismut Karl-Marx-Stadt)', teamId: '1', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '2', year: 1956, competition: 'DDR-Oberliga', note: 'Erster Meistertitel (als SC Wismut Karl-Marx-Stadt)', teamId: '1', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '3', year: 1957, competition: 'DDR-Oberliga', note: 'Titelverteidigung (als SC Wismut Karl-Marx-Stadt)', teamId: '1', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '4', year: 1959, competition: 'DDR-Oberliga', note: 'Dritter Meistertitel (als SC Wismut Karl-Marx-Stadt)', teamId: '1', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
]

const mockSeasonRecords = [
  { id: '1', label: '1955', leagueName: 'DDR-Oberliga', tier: 1, position: 1, points: 39, note: 'Meister (Übergangsrunde)', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '2', label: '1956', leagueName: 'DDR-Oberliga', tier: 1, position: 1, points: 39, note: 'Meister', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '3', label: '1957', leagueName: 'DDR-Oberliga', tier: 1, position: 1, points: 39, note: 'Meister', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '4', label: '1959', leagueName: 'DDR-Oberliga', tier: 1, position: 1, points: 39, note: 'Meister', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '5', label: '2003/04', leagueName: '2. Bundesliga', tier: 2, position: 2, points: 63, note: 'Aufstieg in die Bundesliga', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '6', label: '2009/10', leagueName: '2. Bundesliga', tier: 2, position: 2, points: 61, note: 'Aufstieg in die Bundesliga', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '7', label: '2015/16', leagueName: '2. Bundesliga', tier: 2, position: 2, points: 61, note: 'Aufstieg in die Bundesliga', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://de.wikipedia.org/wiki/FC_Erzgebirge_Aue' },
  { id: '8', label: '2026/27', leagueName: 'Regionalliga Nordost', tier: 4, position: 7, points: 26, note: 'Aktuelle Saison (16. Spieltag)', reviewStatus: 'AUTO', source: 'openligadb', sourceUrl: 'https://api.openligadb.de' },
]

const mockLegends = [
  { id: '1', name: 'Dieter „Ete“ Schüßler', position: 'Mittelfeld', eraFrom: 1955, eraTo: 1970, appearances: 300, goals: 45, note: 'Vereinsikone, 300+ Spiele für die BSG Wismut, 80. Geburtstag 2026', imageUrl: '/brand/legends/schuessler.jpg', isLegend: true, reviewStatus: 'CHECKED', source: 'manuell' },
  { id: '2', name: 'Manfred Zapf', position: 'Libero', eraFrom: 1964, eraTo: 1978, appearances: 310, goals: 35, note: 'Rekordnationalspieler der DDR (66 Länderspiele)', imageUrl: '/brand/legends/zapf.jpg', isLegend: true, reviewStatus: 'CHECKED', source: 'manuell' },
  { id: '3', name: 'Jürgen Croy', position: 'Torwart', eraFrom: 1967, eraTo: 1981, appearances: 287, goals: 0, note: 'Weltbester Torwart 1978 (IFFHS), 86 Länderspiele', imageUrl: '/brand/legends/croy.jpg', isLegend: true, reviewStatus: 'CHECKED', source: 'manuell' },
  { id: '4', name: 'Hans-Jürgen Dörner', position: 'Libero', eraFrom: 1969, eraTo: 1985, appearances: 379, goals: 65, note: 'DDR-Fußballer des Jahres 1977, 1984, 1985', imageUrl: '/brand/legends/doerner.jpg', isLegend: true, reviewStatus: 'CHECKED', source: 'manuell' },
  { id: '5', name: 'Gerd Schädlich', position: 'Stürmer', eraFrom: 1972, eraTo: 1986, appearances: 302, goals: 98, note: 'Rekordtorschütze der BSG Wismut Aue, später erfolgreicher Trainer', imageUrl: '/brand/legends/schaedlich.jpg', isLegend: true, reviewStatus: 'CHECKED', source: 'manuell' },
]

const mockQuizQuestions = [
  { id: '1', question: 'In welchem Jahr wurde Aue zuletzt DDR-Meister?', answers: [{ text: '1959', correct: true }, { text: '1960', correct: false }, { text: '1958', correct: false }, { text: '1961', correct: false }], category: 'Titel', generatedBy: 'template:titles', sourceRef: 'Title:1959:DDR-Oberliga', reviewStatus: 'AUTO' },
  { id: '2', question: 'Wie oft gewann Aue den FDGB-Pokal?', answers: [{ text: '1x (1955)', correct: true }, { text: '2x', correct: false }, { text: '3x', correct: false }, { text: 'Nie', correct: false }], category: 'Titel', generatedBy: 'template:titles', sourceRef: 'Title:1955:FDGB-Pokal', reviewStatus: 'AUTO' },
  { id: '3', question: 'Wie hieß der Gegner am 1. Spieltag 2026/27?', answers: [{ text: 'VSG Altglienicke', correct: true }, { text: 'Chemnitzer FC', correct: false }, { text: 'BFC Dynamo', correct: false }, { text: 'Hallescher FC', correct: false }], category: 'Saison 2026/27', generatedBy: 'template:matches', sourceRef: 'Match:1', reviewStatus: 'AUTO' },
  { id: '4', question: 'In welchem Stadion trägt der RSV Eintracht seine Heimspiele aus?', answers: [{ text: 'Preußenstadion', correct: true }, { text: 'Karl-Liebknecht-Stadion', correct: false }, { text: 'Stadion Altglienicke', correct: false }, { text: 'Werner-Seelenbinder-Stadion', correct: false }], category: 'Stadien', generatedBy: 'template:venues', sourceRef: 'Venue:preussenstadion-stahnsdorf', reviewStatus: 'AUTO' },
  { id: '5', question: 'Welcher Spieler gilt als Rekordtorschütze der BSG Wismut Aue?', answers: [{ text: 'Gerd Schädlich', correct: true }, { text: 'Dieter Schüßler', correct: false }, { text: 'Manfred Zapf', correct: false }, { text: 'Hans-Jürgen Dörner', correct: false }], category: 'Legenden', generatedBy: 'template:titles', sourceRef: 'Player:legend-gerd-schaedlich', reviewStatus: 'AUTO' },
  { id: '6', question: 'Wie viele DDR-Meistertitel hat Aue gewonnen?', answers: [{ text: '3', correct: true }, { text: '2', correct: false }, { text: '4', correct: false }, { text: '1', correct: false }], category: 'Titel', generatedBy: 'template:titles', sourceRef: 'Title:count:DDR-Oberliga', reviewStatus: 'AUTO' },
]

type ReviewStatusIconType = 'check' | 'auto' | 'draft'

const reviewStatusConfig: Record<string, { label: string; color: string; icon: ReviewStatusIconType }> = {
  CHECKED: { label: 'Geprüft', color: 'bg-fc-win/10 text-fc-win', icon: 'check' },
  AUTO: { label: 'Automatisch', color: 'bg-fc-violet/10 text-fc-violet', icon: 'auto' },
  DRAFT: { label: 'Entwurf', color: 'bg-fc-draw/10 text-fc-draw', icon: 'draft' },
}

const ReviewStatusIcon = ({ status }: { status: string }) => {
  const config = reviewStatusConfig[status]
  if (!config) return <span className="h-4 w-4" />
  if (config.icon === 'check') return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  if (config.icon === 'auto') return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
  if (config.icon === 'draft') return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
  return <span className="h-4 w-4" />
}

function StatusBadge({ status }: { status: string }) {
  const config = reviewStatusConfig[status] || reviewStatusConfig.AUTO
  return (
    <Badge variant="outline" className={config.color}>
      <ReviewStatusIcon status={status} />
      {config.label}
    </Badge>
  )
}

export default function TraditionAdminPage() {
  const [activeTab, setActiveTab] = useState<'titles' | 'records' | 'legends' | 'quiz'>('titles')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'title' | 'record' | 'legend' | 'quiz' | null>(null)

  const handleDelete = (id: string, type: 'title' | 'record' | 'legend' | 'quiz') => {
    setDeleteId(id)
    setDeleteType(type)
  }

  const confirmDelete = () => {
    if (deleteId && deleteType) {
      console.log(`Delete ${deleteType}:`, deleteId)
      setDeleteId(null)
      setDeleteType(null)
    }
  }

  const tabs: Array<{ id: 'titles' | 'records' | 'legends' | 'quiz'; label: string; count: number; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'titles', label: 'Titel', count: mockTitles.length, icon: Trophy },
    { id: 'records', label: 'Saison-Archiv', count: mockSeasonRecords.length, icon: Calendar },
    { id: 'legends', label: 'Legenden', count: mockLegends.length, icon: User },
    { id: 'quiz', label: 'Quiz-Fragen', count: mockQuizQuestions.length, icon: Sparkles },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fc-fg">Tradition verwalten</h1>
          <p className="mt-2 text-fc-fg/70">Titel, Saison-Archiv, Legenden & Quiz</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tradition/titles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Titel
            </Button>
          </Link>
          <Link href="/admin/tradition/records/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Saison
            </Button>
          </Link>
          <Link href="/admin/tradition/legends/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Legende
            </Button>
          </Link>
          <Link href="/admin/tradition/quiz/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Quiz
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-b border-fc-border mb-6">
        <nav className="flex gap-1" aria-label="Tradition Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-fc-violet text-fc-fg'
                  : 'text-fc-fg/70 hover:text-fc-fg hover:bg-fc-violet/10'
              }`}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label} <span className="text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'titles' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Titel ({mockTitles.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="bg-fc-surface border-b border-fc-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Jahr</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Wettbewerb</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Hinweis</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Quelle</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fc-border">
                  {mockTitles.map((title) => (
                    <tr key={title.id} className="hover:bg-fc-violet/5 transition-colors">
                      <td className="px-4 py-4 font-bold tabular-nums">{title.year}</td>
                      <td className="px-4 py-4 font-medium text-fc-fg">{title.competition}</td>
                      <td className="px-4 py-4 text-fc-fg/70">{title.note}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={title.reviewStatus} /></td>
                      <td className="px-4 py-3 text-center text-sm text-fc-fg/60">{title.source === 'manuell' ? 'Manuell' : title.source}</td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-fc-fg/50 hover:text-fc-fg">
                              <MoreVertical className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tradition/titles/${title.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                                <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(title.id, 'title')}
                              className="text-fc-loss focus:text-fc-loss"
                            >
                              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'records' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Saison-Archiv ({mockSeasonRecords.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="bg-fc-surface border-b border-fc-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Saison</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Liga</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Platz</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Punkte</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Hinweis</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Quelle</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fc-border">
                  {mockSeasonRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-fc-violet/5 transition-colors">
                      <td className="px-4 py-4 font-bold tabular-nums">{record.label}</td>
                      <td className="px-4 py-4 font-medium text-fc-fg">{record.leagueName}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{record.position || '—'}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{record.points || '—'}</td>
                      <td className="px-4 py-4 text-fc-fg/70">{record.note}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={record.reviewStatus} /></td>
                      <td className="px-4 py-3 text-center text-sm text-fc-fg/60">{record.source === 'manuell' ? 'Manuell' : record.source}</td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-fc-fg/50 hover:text-fc-fg">
                              <MoreVertical className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tradition/records/${record.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                                <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(record.id, 'record')}
                              className="text-fc-loss focus:text-fc-loss"
                            >
                              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'legends' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Legenden ({mockLegends.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="bg-fc-surface border-b border-fc-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Position</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Ära</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Einsätze</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Tore</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fc-border">
                  {mockLegends.map((legend) => (
                    <tr key={legend.id} className="hover:bg-fc-violet/5 transition-colors">
                      <td className="px-4 py-4 font-medium text-fc-fg">{legend.name}</td>
                      <td className="px-4 py-4 text-fc-fg/70">{legend.position}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{legend.eraFrom}–{legend.eraTo || 'heute'}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{legend.appearances || '—'}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{legend.goals || '—'}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={legend.reviewStatus} /></td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-fc-fg/50 hover:text-fc-fg">
                              <MoreVertical className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tradition/legends/${legend.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                                <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(legend.id, 'legend')}
                              className="text-fc-loss focus:text-fc-loss"
                            >
                              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'quiz' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Quiz-Fragen ({mockQuizQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="bg-fc-surface border-b border-fc-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Frage</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Kategorie</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Generator</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Quelle</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fc-border">
                  {mockQuizQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-fc-violet/5 transition-colors">
                      <td className="px-4 py-4 max-w-md truncate">{q.question}</td>
                      <td className="px-4 py-4"><Badge variant="outline">{q.category}</Badge></td>
                      <td className="px-4 py-3 text-center text-sm text-fc-fg/60 font-mono">{q.generatedBy}</td>
                      <td className="px-4 py-3 text-center text-sm text-fc-fg/60 font-mono">{q.sourceRef}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={q.reviewStatus} /></td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-fc-fg/50 hover:text-fc-fg">
                              <MoreVertical className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tradition/quiz/${q.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                                <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(q.id, 'quiz')}
                              className="text-fc-loss focus:text-fc-loss"
                            >
                              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && deleteType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-fc-surface rounded-xl border border-fc-border p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-fc-fg mb-4">{deleteType === 'title' ? 'Titel' : deleteType === 'record' ? 'Saison' : deleteType === 'legend' ? 'Legende' : 'Quiz-Frage'} löschen</h3>
            <p className="text-fc-fg/70 mb-6">
              Bist du sicher, dass du diesen Eintrag löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setDeleteId(null); setDeleteType(null) }}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={() => { confirmDelete(); setDeleteId(null); setDeleteType(null) }}>
                Löschen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}