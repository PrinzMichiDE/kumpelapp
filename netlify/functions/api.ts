import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"

// Simple proxy to Next.js API routes for Netlify Functions
const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const path = event.path.replace('/.netlify/functions/api', '')
  const method = event.httpMethod
  const headers: Record<string, string> = {}
  
  // Forward headers
  Object.entries(event.headers).forEach(([key, value]) => {
    if (key.toLowerCase() !== 'host') {
      headers[key] = value
    }
  })

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${path}`, {
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: event.body,
    })

    const data = await response.json()
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify(data),
    }
  } catch (error) {
    console.error('Netlify function error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
    }
  }
}

export { handler }