import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@kumpelapp/db'
import { UserRole } from '@prisma/client'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
    },
    github: {
      clientId: process.env['GITHUB_CLIENT_ID'] || '',
      clientSecret: process.env['GITHUB_CLIENT_SECRET'] || '',
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'FAN',
        input: false,
      },
      quietFrom: {
        type: 'number',
        required: false,
      },
      quietTo: {
        type: 'number',
        required: false,
      },
      highContrast: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  callbacks: {
    async afterCreateUser({ user }: { user: { id: string } }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'FAN' as UserRole,
        },
      })
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user