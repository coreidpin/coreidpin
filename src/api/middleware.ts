import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import helmet from 'helmet'
import cors from 'cors'

// Security middleware
export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  }),
]

// CSRF protection
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET') return next()
  
  const token = req.headers['x-csrf-token']
  const sessionToken = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token || !sessionToken) {
    return res.status(403).json({ error: 'CSRF token required' })
  }
  
  try {
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET!) as any
    if (decoded.csrfToken !== token) {
      return res.status(403).json({ error: 'Invalid CSRF token' })
    }
    next()
  } catch {
    res.status(403).json({ error: 'Invalid session' })
  }
}

// Input sanitization
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize)
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {}
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key])
      }
      return sanitized
    }
    return obj
  }
  
  req.body = sanitize(req.body)
  next()
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
  })
  
  next()
}
