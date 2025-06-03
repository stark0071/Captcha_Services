const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'captcha-demo-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 * 30 } // 30 minutes
}));

// In-memory storage for demo purposes
const users = new Map();
// Add a demo user
users.set('demo', { username: 'demo', password: 'password123' });

// CAPTCHA generator function
function generateCaptcha() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let captcha = '';
  for (let i = 0; i < 5; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

// Generate simple SVG CAPTCHA
function createCaptchaSvg(text) {
  const width = 200;
  const height = 60;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f5f5f5" />`;
  
  // Add noise lines
  for (let i = 0; i < 5; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aaa" stroke-width="1" />`;
  }
  
  // Add text with some styling
  const charWidth = width / (text.length + 1);
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const x = charWidth * (i + 1);
    const y = height / 2 + (Math.random() * 10 - 5);
    const rotate = Math.floor(Math.random() * 20 - 10);
    
    svg += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="30" 
            font-weight="bold" text-anchor="middle" fill="#333"
            transform="rotate(${rotate}, ${x}, ${y})">${char}</text>`;
  }
  
  svg += '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// API Routes
app.get('/api/captcha', (req, res) => {
  const captchaText = generateCaptcha();
  req.session.captcha = captchaText;
  
  const captchaImage = createCaptchaSvg(captchaText);
  res.json({ image: captchaImage });
});

app.post('/api/login', (req, res) => {
  const { username, password, captchaInput } = req.body;
  
  // Check captcha
  if (!req.session.captcha || req.session.captcha.toLowerCase() !== captchaInput.toLowerCase()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Incorrect CAPTCHA. Please try again.' 
    });
  }
  
  // Check credentials
  const user = users.get(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password.' 
    });
  }
  
  // Clear captcha after successful validation
  delete req.session.captcha;
  
  res.json({ 
    success: true, 
    message: 'Login successful!',
    user: { username: user.username }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});