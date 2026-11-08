'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, MoreVertical, Shield, Building, Users, Trash, Eye } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Input } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@kumpelapp/ui'
import { cn } from '@kumpelapp/utils'

const kindLabels: Record<string, { label: string; color: string }> = {
  SENIOR: { label: '1. Mannschaft', color: 'bg-fc-violet/10 text-fc-violet' },
  YOUTH: { label: 'Nachwuchs', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  TRADITION: { label: 'Tradition', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  DEPARTMENT: { label: 'Abteilung', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
}

const mockTeams = [
  { id: '1', slug: 'fc-erzgebirge-aue', name: 'FC Erzgebirge Aue', shortName: 'AUE', kind: 'SENIOR', isOwn: true, logoUrl: '/brand/logo-aue.svg', venueName: 'Sparkassen-Erzgebirgsstadion' },
  { id: '2', slug: 'rsg-eintracht-stahnsdorf', name: 'RSV Eintracht 1949', shortName: 'RSV', kind: 'SENIOR', isOwn: false, logoUrl: '/brand/logo-rsg.svg', venueName: 'Preußenstadion' },
  { id: '3', slug: 'sv-babelsberg-03', name: 'SV Babelsberg 03', shortName: 'BAB', kind: 'SENIOR', isOwn: false, logoUrl: '/brand/logo-bab.svg', venueName: 'Karl-Liebknecht-Stadion' },
  { id: '4', slug: 'vsg-altglienicke', name: 'VSG Altglienicke', shortName: 'VSG', kind: 'SENIOR', isOwn: false, logoUrl: '/brand/logo-vsg.svg', venueName: 'Stadion Altglienicke' },
  { id: '5', slug: 'aue-u19', name: 'U19 A-Junioren', shortName: 'U19', kind: 'YOUTH', isOwn: true, logoUrl: '/brand/logo-aue.svg', venueName: 'Sparkassen-Erzgebirgsstadion', parentTeam: 'FC Erzgebirge Aue' },
  { id: '6', slug: 'aue-u17', name: 'U17 B-Junioren', shortName: 'U17', kind: 'YOUTH', isOwn: true, logoUrl: '/brand/logo-aue.svg', venueName: 'Sparkassen-Erzgebirgsstadion', parentTeam: 'FC Erzgebirge Aue' },
  { id: '7', slug: 'aue-traditionsteam', name: 'Traditionsteam', shortName: 'TRD', kind: 'TRADITION', isOwn: true, logoUrl: '/brand/logo-aue.svg', venueName: 'Sparkassen-Erzgebirgsstadion' },
]

export default function TeamsAdminPage() {
  const [search, setSearch] = useState('')
  const [filterKind, setFilterKind] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredTeams = mockTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.shortName?.toLowerCase().includes(search.toLowerCase())
    const matchesKind = filterKind === 'all' || team.kind === filterKind
    return matchesSearch && matchesKind
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      // TODO: API call to delete
      console.log('Delete team:', deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fc-fg">Teams verwalten</h1>
          <p className="mt-2 text-fc-fg/70">Eigene Mannschaften, Nachwuchs, Traditionsteam & Gegner</p>
        </div>
        <Link href="/admin/teams/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neues Team
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <CardTitle className="text-xl">Teams ({mockTeams.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
                <Input
                  placeholder="Teams suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterKind}
                onChange={(e) => setFilterKind(e.target.value)}
                className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg focus:outline-none focus:ring-2 focus:ring-fc-violet"
              >
                <option value="all">Alle Arten</option>
                <option value="SENIOR">1. Mannschaft</option>
                <option value="YOUTH">Nachwuchs</option>
                <option value="TRADITION">Tradition</option>
                <option value="DEPARTMENT">Abteilung</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-fc-surface border-b border-fc-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Art</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Stadion</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fc-border">
                {filteredTeams.map((team) => {
                  const kindConfig = kindLabels[team.kind]
                  return (
                    <tr key={team.id} className="hover:bg-fc-violet/5 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {team.logoUrl && (
                            <img src={team.logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          )}
                          <div>
                            <p className="font-medium text-fc-fg">{team.name}</p>
                            {team.shortName && (
                              <p className="text-sm text-fc-fg/60">{team.shortName}</p>
                            )}
                            {team.parentTeam && (
                              <p className="text-xs text-fc-fg/50">→ {team.parentTeam}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={kindConfig.color}>
                          {kindConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-fc-fg/70">{team.venueName}</td>
                      <td className="px-4 py-4">
                        <Badge variant={team.isOwn ? 'success' : 'outline'}>
                          {team.isOwn ? 'Eigenes Team' : 'Gegner'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-fc-fg/50 hover:text-fc-fg">
                              <MoreVertical className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/teams/${team.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                                Ansehen
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/teams/${team.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                                <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(team.id)}
                              className="text-fc-loss focus:text-fc-loss"
                            >
                              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-fc-surface rounded-xl border border-fc-border p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-fc-fg mb-4">Team löschen</h3>
            <p className="text-fc-fg/70 mb-6">
              Bist du sicher, dass du dieses Team löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Löschen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}