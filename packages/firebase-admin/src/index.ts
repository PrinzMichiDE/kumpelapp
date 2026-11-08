import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
import { getMessaging, Messaging } from 'firebase-admin/messaging'

let app: App | null = null

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

function getAppInstance(): App {
  if (app) return app
  
  const existingApps = getApps()
  let existingApp: App | undefined
  if (existingApps.length > 0) {
    existingApp = existingApps[0]
  }
  
  if (existingApp) {
    app = existingApp
    return app
  }
  
  const projectId = getEnv('FIREBASE_PROJECT_ID')
  const clientEmail = getEnv('FIREBASE_CLIENT_EMAIL')
  const privateKey = getEnv('FIREBASE_PRIVATE_KEY').replace(/\n/g, '\n')
  
  const newApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
  
  app = newApp
  return newApp
}

export function getFirebaseAdmin(): { app: App; messaging: import('firebase-admin/messaging').Messaging } {
  const firebaseApp = getAppInstance()
  const messaging = getMessaging(firebaseApp)
  return { app: firebaseApp, messaging }
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const { messaging } = getFirebaseAdmin()
  await messaging.send({
    token,
    notification: { title, body },
    data: data || {},
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  })
}

export async function sendMulticastNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const { messaging } = getFirebaseAdmin()
  await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: data || {},
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  })
}
