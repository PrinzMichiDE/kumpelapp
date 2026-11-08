import { auth } from '@kumpelapp/auth'
import { NextRequest } from 'next/server'

export const { GET, POST } = auth.handler

export const runtime = 'nodejs'