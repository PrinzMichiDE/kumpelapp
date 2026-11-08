import { auth } from '@kumpelapp/auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Ungültige Eingabedaten', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ein Konto mit dieser E-Mail existiert bereits' },
        { status: 409 }
      )
    }

    const user = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: 'FAN',
      },
    })

    return NextResponse.json({
      message: 'Registrierung erfolgreich',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}