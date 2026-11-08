'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, MoreVertical, MapPin, Check, AlertCircle, Clock, Car, Train } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Input } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@kumpelapp/ui'
import { cn } from '@kumpelapp/utils'

const reviewStatusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  CHECKED: { label: 'Geprüft', color: 'bg-fc-win/10 text-fc-win', icon: Check },
  AUTO: { label: 'Automatisch', color: 'bg-fc-violet/10 text-fc-violet', icon: AlertCircle },
  DRAFT: { label: 'Entwurf', color: 'bg-fc-draw/10 text-fc-draw', icon: Clock },
}

const mockVenues = [
  { id: '1', slug: 'sparkassen-erzgebirgsstadion', name: 'Sparkassen-Erzgebirgsstadion', city: 'Aue-Bad Schlema', address: 'Gerd-Schädlich-Platz 1, 08280 Aue-Bad Schlema', lat: 50.5847, lng: 12.6989, capacity: 15500, distanceKm: 0, travelMinutesCar: 0, awayBlockInfo: 'Heimstadion', travelCar: 'A72, B169', travelTrain: 'RB/RE bis Aue, dann Bus', parkingInfo: 'P1-P4 (2000 Plätze)', reviewStatus: 'CHECKED', source: 'manuell', sourceUrl: 'https://www.fc-erzgebirge.de/verein/stadion/erzgebirgsstadion' },
  { id: '2', slug: 'preussenstadion-stahnsdorf', name: 'Preußenstadion', city: 'Stahnsdorf', address: 'Potsdamer Str. 92, 14532 Stahnsdorf', lat: 52.3833, lng: 13.1833, capacity: 3500, distanceKm: 190, travelMinutesCar: 150, awayBlockInfo: 'Block G (Gäste)', travelCar: 'A100, A115', travelTrain: 'RE7 bis Stahnsdorf, dann Bus 620', parkingInfo: 'Gäste-Parkplatz P3 (500m)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q123456' },
  { id: '3', slug: 'karl-liebknecht-stadion', name: 'Karl-Liebknecht-Stadion', city: 'Potsdam', address: 'Am Luftschiffhafen 1, 14471 Potsdam', lat: 52.4097, lng: 13.0678, capacity: 10787, distanceKm: 190, travelMinutesCar: 150, awayBlockInfo: 'Block H/I (Gäste)', travelCar: 'A100, A115', travelTrain: 'S7/RE1 bis Potsdam Hbf, dann Tram 92/96', parkingInfo: 'Parkplatz P2 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q789012' },
  { id: '4', slug: 'stadion-altglienicke', name: 'Stadion Altglienicke', city: 'Berlin', address: 'Köpenicker Str. 158, 12555 Berlin', lat: 52.4094, lng: 13.5436, capacity: 2500, distanceKm: 195, travelMinutesCar: 160, awayBlockInfo: 'Block C (Gäste)', travelCar: 'A100, A113', travelTrain: 'S9 bis Altglienicke, dann Bus 164', parkingInfo: 'Straßenparkplätze', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q345678' },
  { id: '5', slug: 'werner-seelenbinder-stadion', name: 'Werner-Seelenbinder-Stadion', city: 'Berlin', address: 'Conrad-Blenkle-Str. 25, 10369 Berlin', lat: 52.5233, lng: 13.4733, capacity: 3000, distanceKm: 195, travelMinutesCar: 160, awayBlockInfo: 'Block B (Gäste)', travelCar: 'A100, A114', travelTrain: 'S5/S7/S75 bis Ostkreuz, dann Tram 21', parkingInfo: 'Parkplatz P1 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q901234' },
  { id: '6', slug: 'stadion-im-sportforum', name: 'Stadion im Sportforum', city: 'Berlin', address: 'Weißenseer Weg 53, 13053 Berlin', lat: 52.5556, lng: 13.4639, capacity: 7500, distanceKm: 200, travelMinutesCar: 165, awayBlockInfo: 'Block D (Gäste)', travelCar: 'A100, A114', travelTrain: 'S5/S7/S75 bis Hohenschönhausen, dann Bus 154', parkingInfo: 'Parkplatz P3 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q567890' },
  { id: '7', slug: 'alfred-kunze-sportpark', name: 'Alfred-Kunze-Sportpark', city: 'Leipzig', address: 'Lützenberger Str. 10, 04177 Leipzig', lat: 51.3397, lng: 12.3731, capacity: 4999, distanceKm: 95, travelMinutesCar: 75, awayBlockInfo: 'Block E/F (Gäste)', travelCar: 'A9, A72', travelTrain: 'ICE/RE bis Leipzig Hbf, dann Tram 7', parkingInfo: 'Parkplatz P1 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q111213' },
  { id: '8', slug: 'stadion-der-freundschaft', name: 'Stadion der Freundschaft', city: 'Cottbus', address: 'Thiemstraße 110, 03042 Cottbus', lat: 51.7611, lng: 14.3447, capacity: 22528, distanceKm: 135, travelMinutesCar: 105, awayBlockInfo: 'Block K (Gäste)', travelCar: 'A13, A15', travelTrain: 'RE1/RE2 bis Cottbus Hbf, dann Bus 2', parkingInfo: 'Parkplatz P2 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q141516' },
  { id: '9', slug: 'volksparkstadion-greifswald', name: 'Volksparkstadion', city: 'Greifswald', address: 'Hans-Beimler-Str. 1, 17489 Greifswald', lat: 54.0958, lng: 13.3822, capacity: 5000, distanceKm: 320, travelMinutesCar: 240, awayBlockInfo: 'Block A (Gäste)', travelCar: 'A20, A19', travelTrain: 'RE3/RE10 bis Greifswald, dann Bus 2', parkingInfo: 'Parkplatz P1 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q171819' },
  { id: '10', slug: 'heinz-steyer-stadion', name: 'Heinz-Steyer-Stadion', city: 'Dresden', address: 'Schönfelder Str. 1, 01099 Dresden', lat: 51.0504, lng: 13.7372, capacity: 30000, distanceKm: 75, travelMinutesCar: 60, awayBlockInfo: 'Block G (Gäste)', travelCar: 'A4, A17', travelTrain: 'S1/S2 bis Dresden Mitte, dann Tram 10', parkingInfo: 'Parkplatz P1 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q202122' },
  { id: '11', slug: 'ernst-grube-stadion', name: 'Ernst-Grube-Stadion', city: 'Magdeburg', address: 'Wilhelm-Höcker-Str. 1, 39108 Magdeburg', lat: 52.1277, lng: 11.6292, capacity: 25000, distanceKm: 220, travelMinutesCar: 180, awayBlockInfo: 'Block H (Gäste)', travelCar: 'A2, A14', travelTrain: 'ICE/IC bis Magdeburg Hbf, dann Tram 5', parkingInfo: 'Parkplatz P3 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q232425' },
  { id: '12', slug: 'stadion-am-luftschiffhafen', name: 'Stadion am Luftschiffhafen', city: 'Potsdam', address: 'Am Luftschiffhafen 1, 14471 Potsdam', lat: 52.4097, lng: 13.0678, capacity: 5000, distanceKm: 190, travelMinutesCar: 150, awayBlockInfo: 'Block B (Gäste)', travelCar: 'A100, A115', travelTrain: 'S7/RE1 bis Potsdam Hbf, dann Tram 92/96', parkingInfo: 'Parkplatz P2 (Gäste)', reviewStatus: 'AUTO', source: 'wikidata', sourceUrl: 'https://www.wikidata.org/wiki/Q262728' },
]

export default function VenuesAdminPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredVenues = mockVenues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(search.toLowerCase()) ||
      venue.city.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'all' || venue.reviewStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (deleteId) {
      console.log('Delete venue:', deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fc-fg">Stadien verwalten</h1>
          <p className="mt-2 text-fc-fg/70">Auswärts-Stadien der Regionalliga Nordost & Heimstadion</p>
        </div>
        <Link href="/admin/venues/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Stadion hinzufügen
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <CardTitle className="text-xl">Stadien ({mockVenues.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fc-fg/40" aria-hidden="true" />
                <Input
                  placeholder="Stadien suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg focus:outline-none focus:ring-2 focus:ring-fc-violet"
              >
                <option value="all">Alle Status</option>
                <option value="CHECKED">Geprüft</option>
                <option value="AUTO">Automatisch</option>
                <option value="DRAFT">Entwurf</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-fc-surface border-b border-fc-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Stadion</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Stadt</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Kapazität</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Entfernung</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Fahrzeit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Quelle</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fc-border">
                {filteredVenues.map((venue) => {
                  const statusConfig = reviewStatusConfig[venue.reviewStatus]
                  const StatusIcon = statusConfig.icon
                  return (
                    <tr key={venue.id} className="hover:bg-fc-violet/5 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-fc-fg">{venue.name}</p>
                          <p className="text-sm text-fc-fg/60">{venue.address}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-fc-fg/70">{venue.city}</td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        {venue.capacity ? venue.capacity.toLocaleString('de-DE') : '—'}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        {venue.distanceKm ? `${venue.distanceKm} km` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        {venue.travelMinutesCar ? `${venue.travelMinutesCar} min` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-fc-fg/60">
                        {venue.source === 'manuell' ? 'Manuell' : venue.source}
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
                              <Link href={`/admin/venues/${venue.slug}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                                <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                                Ansehen
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/venues/${venue.slug}/edit`} className="flex w-full items-center px-2 py-1.5 text-sm" onClick={() => {}}>
                                <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(venue.id)}
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
            <h3 className="text-lg font-semibold text-fc-fg mb-4">Stadion löschen</h3>
            <p className="text-fc-fg/70 mb-6">
              Bist du sicher, dass du dieses Stadion löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
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