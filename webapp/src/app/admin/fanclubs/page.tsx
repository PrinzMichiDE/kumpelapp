'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, MoreVertical, Users, MapPin, Mail, Phone, Globe } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Input } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@kumpelapp/ui'
import { cn } from '@kumpelapp/utils'

const mockFanclubs = [
  { id: '1', name: 'Veilchen Aue', city: 'Aue', lat: 50.5847, lng: 12.6989, contactUrl: 'https://www.veilchen-aue.de', isOfficial: true, members: 120 },
  { id: '2', name: 'Schachtfreunde', city: 'Aue', lat: 50.5847, lng: 12.6989, contactUrl: 'https://www.schachtfreunde.de', isOfficial: true, members: 85 },
  { id: '3', name: 'Lila-Weiße Herzen Chemnitz', city: 'Chemnitz', lat: 50.8278, lng: 12.9214, contactUrl: 'https://www.lila-weisse-herzen.de', isOfficial: true, members: 60 },
  { id: '4', name: 'Erzgebirgsveilchen Dresden', city: 'Dresden', lat: 51.0504, lng: 13.7372, contactUrl: 'https://www.erzgebirgsveilchen-dresden.de', isOfficial: true, members: 45 },
  { id: '5', name: 'Veilchenpower Berlin', city: 'Berlin', lat: 52.5200, lng: 13.4050, contactUrl: 'https://www.veilchenpower-berlin.de', isOfficial: true, members: 70 },
  { id: '6', name: 'Kumpels aus Bayern', city: 'München', lat: 48.1374, lng: 11.5755, contactUrl: 'https://www.kumpels-aus-bayern.de', isOfficial: true, members: 35 },
  { id: '7', name: 'Veilchenfreunde Leipzig', city: 'Leipzig', lat: 51.3397, lng: 12.3731, contactUrl: 'https://www.veilchenfreunde-leipzig.de', isOfficial: true, members: 55 },
  { id: '8', name: 'Lila-Weiße aus dem Norden', city: 'Hamburg', lat: 53.5511, lng: 9.9937, contactUrl: 'https://www.lila-weisse-norden.de', isOfficial: true, members: 40 },
  { id: '9', name: 'Veilchen-Freunde Stuttgart', city: 'Stuttgart', lat: 48.7758, lng: 9.1829, contactUrl: 'https://www.veilchen-stuttgart.de', isOfficial: true, members: 30 },
  { id: '10', name: 'Kumpels aus dem Rheinland', city: 'Köln', lat: 50.9375, lng: 6.9603, contactUrl: 'https://www.kumpels-rheinland.de', isOfficial: true, members: 25 },
  { id: '11', name: 'Erzgebirgsveilchen Frankfurt', city: 'Frankfurt', lat: 50.1109, lng: 8.6821, contactUrl: 'https://www.erzgebirgsveilchen-frankfurt.de', isOfficial: true, members: 20 },
  { id: '12', name: 'Veilchen-Fans Nürnberg', city: 'Nürnberg', lat: 49.4521, lng: 11.0767, contactUrl: 'https://www.veilchen-nuernberg.de', isOfficial: true, members: 15 },
]

export default function FanclubsAdminPage() {
  const [search, setSearch] = useState('')
  const [filterOfficial, setFilterOfficial] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredFanclubs = mockFanclubs.filter(fc => {
    const matchesSearch = fc.name.toLowerCase().includes(search.toLowerCase()) ||
      fc.city.toLowerCase().includes(search.toLowerCase())
    const matchesOfficial = filterOfficial === 'all' || 
      (filterOfficial === 'official' && fc.isOfficial) ||
      (filterOfficial === 'unofficial' && !fc.isOfficial)
    return matchesSearch && matchesOfficial
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      console.log('Delete fanclub:', deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fc-fg">Fanclubs verwalten</h1>
          <p className="mt-2 text-fc-fg/70">Offizielle Fanclubs der Kumpel-Gemeinschaft</p>
        </div>
        <Link href="/admin/fanclubs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Fanclub hinzufügen
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <CardTitle className="text-xl">Fanclubs ({mockFanclubs.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
                <Input
                  placeholder="Fanclubs suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterOfficial}
                onChange={(e) => setFilterOfficial(e.target.value)}
                className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg focus:outline-none focus:ring-2 focus:ring-fc-violet"
              >
                <option value="all">Alle</option>
                <option value="official">Offiziell</option>
                <option value="unofficial">Inoffiziell</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-fc-surface border-b border-fc-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Fanclub</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Stadt</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Mitglieder</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Kontakt</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fc-border">
                {mockFanclubs.map((fc) => (
                  <tr key={fc.id} className="hover:bg-fc-violet/5 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-fc-fg">{fc.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-fc-fg/70">{fc.city}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{fc.members}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={fc.isOfficial ? 'success' : 'outline'}>
                        {fc.isOfficial ? 'Offiziell' : 'Inoffiziell'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {fc.contactUrl && (
                        <a href={fc.contactUrl} target="_blank" rel="noopener noreferrer" className="text-fc-violet hover:underline text-sm">
                          Website
                        </a>
                      )}
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
                            <Link href={`/admin/fanclubs/${fc.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                              <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                              Ansehen
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/fanclubs/${fc.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(fc.id)}
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-fc-surface rounded-xl border border-fc-border p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-fc-fg mb-4">Fanclub löschen</h3>
            <p className="text-fc-fg/70 mb-6">
              Bist du sicher, dass du diesen Fanclub löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
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