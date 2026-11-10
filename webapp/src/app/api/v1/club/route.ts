import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section')?.trim() || 'all'

  try {
    const wantContacts = section === 'all' || section === 'contacts'
    const wantDepartments = section === 'all' || section === 'departments'
    const wantLinks = section === 'all' || section === 'links'

    const [contacts, departments, links] = await Promise.all([
      wantContacts ? prisma.clubContact.findMany({ orderBy: { role: 'asc' } }) : Promise.resolve([]),
      wantDepartments ? prisma.department.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }) : Promise.resolve([]),
      wantLinks
        ? prisma.staticLink.findMany({
            where: { category: { in: ['verein', 'Verein', 'club', 'Club', 'official', 'links', 'kontakt', 'shop', 'tickets', 'membership', 'fans', 'fan'] } },
            orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
          })
        : Promise.resolve([]),
    ])

    return NextResponse.json({
      contacts: contacts.map((c) => ({ id: c.id, role: c.role, name: c.name, email: c.email, phone: c.phone, url: c.url, note: c.note })),
      departments: departments.map((d) => ({ id: d.id, name: d.name, description: d.description, contactUrl: d.contactUrl, sortOrder: d.sortOrder })),
      links: links.map((l) => ({ id: l.id, key: l.key, label: l.label, url: l.url, description: l.description, category: l.category, sortOrder: l.sortOrder })),
      meta: { contacts: contacts.length, departments: departments.length, links: links.length },
    })
  } catch (error) {
    console.error('Failed to fetch club info', error)
    return NextResponse.json(
      { contacts: [], departments: [], links: [], meta: { contacts: 0, departments: 0, links: 0 }, error: 'FAILED_TO_FETCH_CLUB_INFO' },
      { status: 500 },
    )
  }
}
