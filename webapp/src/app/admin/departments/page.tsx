'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, MoreVertical, Building, Users, Shield, BookOpen, GraduationCap, Heart, MapPin, Dumbbell, Music, Utensils, Brush } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Input } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@kumpelapp/ui'

const departmentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Fußball: Shield,
  Boxen: Users,
  Ringen: Users,
  Turnen: GraduationCap,
  Volleyball: Users,
  Tischtennis: Users,
  Leichtathletik: GraduationCap,
  Schwimmen: GraduationCap,
}

const mockDepartments = [
  { id: '1', name: 'Fußball', description: 'Herren, Frauen, Nachwuchs, Traditionsteam', sortOrder: 1 },
  { id: '2', name: 'Boxen', description: 'Olympisches Boxen für Kinder, Jugendliche und Erwachsene', sortOrder: 2 },
  { id: '3', name: 'Ringen', description: 'Freistil und Griechisch-Römisch', sortOrder: 3 },
  { id: '4', name: 'Turnen', description: 'Gerätturnen, Rhythmische Sportgymnastik, Trampolin', sortOrder: 4 },
  { id: '5', name: 'Volleyball', description: 'Damen, Herren, Jugend', sortOrder: 5 },
  { id: '6', name: 'Tischtennis', description: 'Herren, Damen, Senioren, Jugend', sortOrder: 6 },
  { id: '7', name: 'Leichtathletik', description: 'Laufen, Springen, Werfen für alle Altersklassen', sortOrder: 7 },
  { id: '8', name: 'Schwimmen', description: 'Wettkampf und Breitensport', sortOrder: 8 },
]

export default function DepartmentsAdminPage() {
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredDepartments = mockDepartments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.description?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      console.log('Delete department:', deleteId)
      setDeleteId(null)
    }
  }

  const getIcon = (name: string) => {
    const Icon = departmentIcons[name] || Building
    return <Icon className="h-5 w-5" />
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fc-fg">Abteilungen verwalten</h1>
          <p className="mt-2 text-fc-fg/70">Alle Sportarten des FC Erzgebirge Aue e.V.</p>
        </div>
        <Link href="/admin/departments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Abteilung hinzufügen
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <CardTitle className="text-xl">Abteilungen ({mockDepartments.length})</CardTitle>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
              <Input
                placeholder="Abteilungen suchen..."
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Abteilung</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Beschreibung</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Sortierung</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fc-border">
                {mockDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-fc-violet/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-fc-violet/10 flex items-center justify-center">
                          {getIcon(dept.name)}
                        </div>
                        <div>
                          <p className="font-medium text-fc-fg">{dept.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-fc-fg/70">{dept.description}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{dept.sortOrder}</td>
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-fc-fg/50 hover:text-fc-fg">
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/departments/${dept.id}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(dept.id)}
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
            <h3 className="text-lg font-semibold text-fc-fg mb-4">Abteilung löschen</h3>
            <p className="text-fc-fg/70 mb-6">
              Bist du sicher, dass du diese Abteilung löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
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