import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../utils/supabase/client'

// Rate limiting: 5 requests per minute per IP
export const registerRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain special character'),
  name: z.string().min(1, 'Name is required').max(100),
  title: z.string().min(1, 'Professional title is required').max(200),
  phone: z.string().regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone format').optional(),
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
})

export async function checkEmailAvailability(req: Request, res: Response) {
  try {
    const { email } = req.body
    
    if (!email || !z.string().email().safeParse(email).success) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    res.json({ available: !data })
  } catch (error) {
    console.error('Email check error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function registerUser(req: Request, res: Response) {
  try {
    // Validate input
    const validation = registerSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      })
    }

    const { email, password, name, title, phone, location, company } = validation.data
    const clientIP = req.ip || req.connection.remoteAddress

    // Check email uniqueness
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate verification token
    const verificationToken = jwt.sign(
      { email: email.toLowerCase(), type: 'verification' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    // Create user record with transaction
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        name: name.trim(),
        title: title.trim(),
        phone: phone?.trim(),
        location: location?.trim(),
        company: company?.trim(),
        status: 'pending_verification',
        verification_token: verificationToken,
        verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        registration_ip: clientIP,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      throw userError
    }

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken)

    // Log registration event
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'user_registration',
        details: { email, ip: clientIP },
        timestamp: new Date().toISOString()
      })

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      userId: user.id
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid verification token' })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Find user with matching token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', decoded.email)
      .eq('verification_token', token)
      .single()

    if (error || !user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' })
    }

    // Check if already verified
    if (user.status === 'verified') {
      return res.status(200).json({ 
        success: true, 
        message: 'Email already verified',
        alreadyVerified: true 
      })
    }

    // Check token expiration
    if (new Date() > new Date(user.verification_expires)) {
      return res.status(400).json({ error: 'Verification token expired' })
    }

    // Update user status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'verified',
        email_verified_at: new Date().toISOString(),
        verification_token: null,
        verification_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Generate session token
    const sessionToken = jwt.sign(
      { userId: user.id, email: user.email, verified: true },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Log verification event
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'email_verification',
        details: { email: user.email },
        timestamp: new Date().toISOString()
      })

    res.json({
      success: true,
      message: 'Email verified successfully',
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: true
      }
    })

  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({ error: 'Verification failed' })
  }
}

async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/api/verify?token=${token}`
  
  // Email template with branding
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your CoreID Account</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">CoreID</h1>
        </div>
        
        <h2>Welcome to CoreID, ${name}!</h2>
        
        <p>Thank you for registering with CoreID. To complete your registration and start using our platform, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <p>If you didn't create an account with CoreID, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #666;">
          CoreID Team<br>
          Need help? Contact us at support@coreid.com
        </p>
      </div>
    </body>
    </html>
  `

  // Send email using your preferred service (SendGrid, AWS SES, etc.)
  // This is a placeholder - implement with your email service
}
