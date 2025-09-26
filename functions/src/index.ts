import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Simple HTTP function
export const api = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.path === '/health') {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    return;
  }

  if (req.path === '/auth/login' && req.method === 'POST') {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    res.json({
      success: true,
      message: 'Login endpoint ready',
      email
    });
    return;
  }

  if (req.path === '/companies' && req.method === 'GET') {
    // Simple response for now
    res.json({ 
      success: true, 
      companies: [],
      message: 'Companies endpoint ready'
    });
    return;
  }

  res.status(404).json({ error: 'Route not found' });
});