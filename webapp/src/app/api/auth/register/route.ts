import { auth } from '@kumpelapp/auth'
import { NextRequest, NextResponse } from 'next/server'

// This route is handled by Better Auth automatically at /api/auth/sign-up
// This file exists for documentation purposes only
export async function POST(request: Request) {
  return Response.json({ message: 'Use /api/auth/sign-up for registration' }, { status: 400 })
}