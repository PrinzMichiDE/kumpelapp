'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, MoreVertical, Shield, Users, MessageSquare, Mail, Phone, Globe, Check, AlertCircle } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Input } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@kumpelapp/ui'

const mockContacts = [
  { id: '1', role: 'Fanbeauftragter', name: 'Matthias Heidrich', email: 'fanbeauftragter@fc-erzgebirge.de', phone: '+49 3771 123456', url: 'https://www.fc-erzgebirge.de/fans/fanbeauftragter', note: 'Ansprechpartner für Fanbelange, Fanclub-Unterstützung, Vermittlung bei Konflikten' },
  { id: '2', role: 'Fanprojekt', name: 'Sozialpädagogisches Team', email: 'fanprojekt@fc-erzgebirge.de', phone: '+49 3771 123457', url: 'https://www.fc-erzgebirge.de/fans/fanprojekt', note: 'Begleitung zu Auswärtsspielen, Beratung & Unterstützung, Präventionsarbeit' },
  { id: '3', role: 'Team Barrierefrei', name: 'Inklusionsteam', email: 'barrierefrei@fc-erzgebirge.de', phone: '+49 3771 123458', url: 'https://www.fc-erzgebirge.de/fans/team-barrierefrei', note: 'Rollstuhlplätze & Begleitung, Audioguide für Sehbehinderte, Induktionsschleifen' },
  { id: '4', role: 'Steigerfunk', name: 'Radioteam', email: 'steigerfunk@fc-erzgebirge.de', phone: '+49 3771 123459', url: 'https://www.fc-erzgebirge.de/fans/steigerfunk', note: 'Live-Kommentierung, Interviews & Hintergründe, auch in der App hörbar' },
  { id: '5', role: 'KidsClub', name: 'KidsClub Team', email: 'kidsclub@fc-erzgebirge.de', phone: '+49 3771 123460', url: 'https://www.fc-erzgebirge.de/fans/kidsclub', note: 'Kindergeburtstage im Stadion, Exklusive Aktionen, Maskottchen-Besuche' },
  { id: '6', role: 'Mitgliedschaft', name: 'Mitgliederverwaltung', email: 'mitglieder@fc-erzgebirge.de', phone: '+49 3771 123461', url: 'https://www.fc-erzgebirge.de/verein/mitglieder', note: 'Mitgliedsantrag, Geschenkmitgliedschaft, lebenslange Mitgliedschaft' },
]

export default function ContactsAdminPage() {
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.role.toLowerCase().includes(search.toLowerCase()) ||
      contact.name?.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      console.log('Delete contact:', deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fc-fg">Kontakte verwalten</h1>
          <p className="mt-2 text-fc-fg/70">Ansprechpartner, Fanbeauftragter, Fanprojekt & mehr</p>
        </div>
        <Link href="/admin/contacts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Kontakt hinzufügen
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <CardTitle className="text-xl">Kontakte ({mockContacts.length})</CardTitle>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
              <Input
                placeholder="Kontakte suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-fc-surface border-b border-fc-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Rolle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">E-Mail</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Telefon</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Web</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fc-border">
                {mockContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-fc-violet/5 transition-colors">
                    <td className="px-4 py-4 font-medium text-fc-fg">{contact.role}</td>
                    <td className="px-4 py-4 text-fc-fg/70">{contact.name || '—'}</td>
                    <td className="px-4 py-4">
                      <a href={`mailto:${contact.email}`} className="text-fc-violet hover:underline text-sm">{contact.email}</a>
                    </td>
                    <td className="px-4 py-4 text-fc-fg/70">{contact.phone || '—'}</td>
                    <td className="px-4 py-4">
                      {contact.url && (
                        <a href={contact.url} target="_blank" rel="noopener noreferrer" className="text-fc-violet hover:underline text-sm flex items-center gap-1">
                          <Globe className="h-4 w-4" aria-hidden="true" />
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
                            <Link href={`/admin/contacts/${contact.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(contact.id)}
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
            <h3 className="text-lg font-semibold text-fc-fg mb-4">Kontakt löschen</h3>
            <p className="text-fc-fg/70 mb-6">
              Bist du sicher, dass du diesen Kontakt löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
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