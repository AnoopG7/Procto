const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication logic
  if (email && password) {
    res.json({
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        id: '12345',
        email,
        role: 'student',
        firstName: 'Test',
        lastName: 'User'
      }
    });
  } else {
    res.status(400).json({ error: 'Email and password required' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Mock registration logic
  if (email && password && firstName && lastName) {
    res.json({
      message: 'User registered successfully',
      user: {
        id: '12345',
        email,
        role: 'student',
        firstName,
        lastName
      }
    });
  } else {
    res.status(400).json({ error: 'All fields are required' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
