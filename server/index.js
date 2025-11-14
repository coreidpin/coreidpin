const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'your-supabase-url',
  process.env.SUPABASE_SERVICE_KEY || 'your-service-key'
);

// Email availability check
app.post('/api/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ available: !data });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, title, phone, location } = req.body;

    // Validation
    if (!email || !password || !name || !title) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: [
          { path: ['email'], message: 'Email is required' },
          { path: ['password'], message: 'Password is required' },
          { path: ['name'], message: 'Name is required' },
          { path: ['title'], message: 'Title is required' }
        ].filter(d => !req.body[d.path[0]])
      });
    }

    // Check if email exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = jwt.sign(
      { email: email.toLowerCase(), type: 'verification' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        name: name.trim(),
        title: title.trim(),
        phone: phone?.trim(),
        location: location?.trim(),
        status: 'pending_verification',
        verification_token: verificationToken,
        verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        registration_ip: req.ip,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      userId: user.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});