'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, MoreVertical, ExternalLink, Tag, Globe, Building, Users, Shield, BookOpen, Ticket, ShoppingBag, Book } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Input } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@kumpelapp/ui'

const categoryConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  FANS: { label: 'Fans', color: 'bg-fc-violet/10 text-fc-violet', icon: Users },
  VEREIN: { label: 'Verein', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Building },
  TICKETS: { label: 'Tickets', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: Ticket },
  SHOP: { label: 'Shop', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: ShoppingBag },
  TRADITION: { label: 'Tradition', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Book },
  TEAMS: { label: 'Teams', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: Shield },
  LEISTUNGSZENTRUM: { label: 'Leistungszentrum', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300', icon: BookOpen },
}

const mockLinks = [
  { id: '1', key: 'audioguide', label: 'Audioguide für Sehbehinderte', url: 'https://www.fc-erzgebirge.de/fans/audioguide-fuer-sehbehinderte', description: 'Live-Audiodeskription der Heimspiele', category: 'FANS', sortOrder: 1 },
  { id: '2', key: 'kidsclub', label: 'KidsClub', url: 'https://www.fc-erzgebirge.de/fans/kidsclub', description: 'Für die jüngsten Veilchen-Fans', category: 'FANS', sortOrder: 2 },
  { id: '3', key: 'stadionfuehrung', label: 'Stadionführungen', url: 'https://www.fc-erzgebirge.de/tickets/stadionfuehrungen', description: 'Blick hinter die Kulissen des Erzgebirgsstadions', category: 'FANS', sortOrder: 3 },
  { id: '4', key: 'gaestefans', label: 'Infos für Gästefans', url: 'https://www.fc-erzgebirge.de/fans/infos-fuer-gaestefans', description: 'Anreise, Gästeblock, Tickets', category: 'FANS', sortOrder: 4 },
  { id: '5', key: 'fanbeauftragter', label: 'Fanbeauftragter', url: 'https://www.fc-erzgebirge.de/fans/fanbeauftragter', description: 'Kontakt & Infos', category: 'FANS', sortOrder: 5 },
  { id: '6', key: 'fanprojekt', label: 'Fanprojekt', url: 'https://www.fc-erzgebirge.de/fans/fanprojekt', description: 'Sozialpädagogische Fanarbeit', category: 'FANS', sortOrder: 6 },
  { id: '7', key: 'barrierefreiheit', label: 'Barrierefreiheit', url: 'https://www.fc-erzgebirge.de/fans/team-barrierefrei', description: 'Inklusion im Stadion', category: 'FANS', sortOrder: 7 },
  { id: '8', key: 'steigerfunk', label: 'Steigerfunk', url: 'https://www.fc-erzgebirge.de/fans/steigerfunk', description: 'Das Fanradio live am Spieltag', category: 'FANS', sortOrder: 8 },
  { id: '9', key: 'mitglied_werden', label: 'Mitglied werden', url: 'https://www.fc-erzgebirge.de/verein/mitglieder', description: 'Jetzt Kumpel werden', category: 'VEREIN', sortOrder: 1 },
  { id: '10', key: 'geschenkmitgliedschaft', label: 'Geschenkmitgliedschaft', url: 'https://www.fc-erzgebirge.de/verein/geschenkmitgliedschaft', description: 'Verschenke Kumpel-Sein', category: 'VEREIN', sortOrder: 2 },
  { id: '11', key: 'lebenslange_mitgliedschaft', label: 'Lebenslange Mitgliedschaft', url: 'https://www.fc-erzgebirge.de/verein/lebenslange-mitgliedschaft', description: 'Für immer Veilchen', category: 'VEREIN', sortOrder: 3 },
  { id: '12', key: 'ticketshop', label: 'Offizieller Ticketshop', url: 'https://customer59.ticketing.cloud.sap/shop?shopid=103', description: 'Tickets für alle Heimspiele', category: 'TICKETS', sortOrder: 1 },
  { id: '13', key: 'vorverkaufsstellen', label: 'Vorverkaufsstellen', url: 'https://www.fc-erzgebirge.de/tickets/vorverkaufsstellen', description: 'Wo du Tickets vor Ort kaufen kannst', category: 'TICKETS', sortOrder: 2 },
  { id: '14', key: 'fanshop', label: 'Offizieller Fanshop', url: 'https://www.fc-erzgebirge.shop', description: 'Offizieller Merchandise', category: 'SHOP', sortOrder: 1 },
  { id: '15', key: 'nachhaltigkeit', label: 'Nachhaltigkeit', url: 'https://www.fc-erzgebirge.de/verein/nachhaltigkeit', description: 'Engagement für Umwelt & Soziales', category: 'VEREIN', sortOrder: 4 },
  { id: '16', key: 'satzung', label: 'Satzung & Ordnungen', url: 'https://www.fc-erzgebirge.de/verein/satzung', description: 'Rechtliche Grundlagen', category: 'VEREIN', sortOrder: 5 },
  { id: '17', key: 'geschichte', label: 'Vereinsgeschichte', url: 'https://www.fc-erzgebirge.de/verein/geschichte', description: '80 Jahre FC Erzgebirge Aue', category: 'TRADITION', sortOrder: 1 },
  { id: '18', key: 'traditionsteam', label: 'Traditionsteam', url: 'https://www.fc-erzgebirge.de/traditionsteam', description: 'Legenden im Einsatz', category: 'TRADITION', sortOrder: 2 },
  { id: '19', key: 'vereinsspielplan', label: 'Vereinsspielplan', url: 'https://www.fc-erzgebirge.de/teams/vereinsspielplan', description: 'Alle Teams auf einen Blick', category: 'TEAMS', sortOrder: 1 },
  { id: '20', key: 'nachwuchs', label: 'Nachwuchs', url: 'https://www.fc-erzgebirge.de/teams/nachwuchs-2526/u19-a-junioren', description: 'U19, U17, U15 & weitere Jugendteams', category: 'TEAMS', sortOrder: 2 },
  { id: '21', key: 'leistungszentrum', label: 'Leistungszentrum', url: 'https://www.fc-erzgebirge.de/leistungszentrum/news', description: 'Nachwuchs-Förderung & Ausbildung', category: 'LEISTUNGSZENTRUM', sortOrder: 1 },
]

export default function LinksAdminPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredLinks = mockLinks.filter(link => {
    const matchesSearch = link.label.toLowerCase().includes(search.toLowerCase()) ||
      link.key.toLowerCase().includes(search.toLowerCase()) ||
      link.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'all' || link.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      console.log('Delete link:', deleteId)
      setDeleteId(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    const config = categoryConfig[category]
    if (!config) return <Tag className="h-4 w-4" />
    const Icon = config.icon
    return <Icon className="h-4 w-4" />
  }

  const getCategoryBadge = (category: string) => {
    const config = categoryConfig[category]
    if (!config) return <Badge variant="outline">{category}</Badge>
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fc-fg">Links verwalten</h1>
          <p className="mt-2 text-fc-fg/70">Offizielle Links zu Verein, Fans, Tickets, Shop & mehr</p>
        </div>
        <Link href="/admin/links/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Link hinzufügen
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <CardTitle className="text-xl">Links ({mockLinks.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
                <Input
                  placeholder="Links suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg focus:outline-none focus:ring-2 focus:ring-fc-violet"
              >
                <option value="all">Alle Kategorien</option>
                <option value="FANS">Fans</option>
                <option value="VEREIN">Verein</option>
                <option value="TICKETS">Tickets</option>
                <option value="SHOP">Shop</option>
                <option value="TRADITION">Tradition</option>
                <option value="TEAMS">Teams</option>
                <option value="LEISTUNGSZENTRUM">Leistungszentrum</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-fc-surface border-b border-fc-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Kategorie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">URL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Beschreibung</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Sortierung</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fc-border">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-fc-violet/5 transition-colors">
                    <td className="px-4 py-4 font-mono text-sm text-fc-fg/70">{link.key}</td>
                    <td className="px-4 py-4 font-medium text-fc-fg">{link.label}</td>
                    <td className="px-4 py-3">{getCategoryBadge(link.category)}</td>
                    <td className="px-4 py-4">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-fc-violet hover:underline text-sm flex items-center gap-1 max-w-xs truncate">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        {link.url.length > 50 ? link.url.substring(0, 50) + '...' : link.url}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-fc-fg/70 max-w-md truncate">{link.description || '—'}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{link.sortOrder}</td>
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-fc-fg/50 hover:text-fc-fg">
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/links/${link.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(link.id)}
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
            <h3 className="text-lg font-semibold text-fc-fg mb-4">Link löschen</h3>
            <p className="text-fc-fg/70 mb-6">
              Bist du sicher, dass du diesen Link löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
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