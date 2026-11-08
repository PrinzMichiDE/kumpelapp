import { createAuthClient } from 'better-auth/react'
import type { auth } from './server'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  changePassword,
  forgetPassword,
  resetPassword,
  verifyEmail,
  linkSocial,
  unlinkAccount,
} = authClient

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User