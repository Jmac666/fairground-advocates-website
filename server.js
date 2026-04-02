const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const app = express();

const PORT = process.env.PORT || 3000;

// --- Security headers ---
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// --- Block source/config files from being served ---
const BLOCKED = ['/server.js', '/package.json', '/package-lock.json', '/railway.toml', '/README.md', '/.gitignore'];
app.get(BLOCKED, (req, res) => res.status(404).end());

// --- Body parsing with size limit ---
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname)));

// --- Mail transport ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

// --- Rate limiter: 5 submissions per IP per 15 min ---
const intakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.redirect('/?error=true')
});

// --- HTML escape helper ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Intake form handler ---
app.post('/intake', intakeLimiter, async (req, res) => {
  const { fname, lname, email, phone, city, type, referral, description } = req.body;

  // Server-side validation
  if (!fname || !lname || !email || !city || !type || !description) {
    return res.redirect('/?error=true');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.redirect('/?error=true');
  }

  // Sanitize all fields before putting in email HTML
  const s = {
    fname:       escapeHtml(fname),
    lname:       escapeHtml(lname),
    email:       escapeHtml(email),
    phone:       escapeHtml(phone),
    city:        escapeHtml(city),
    type:        escapeHtml(type),
    referral:    escapeHtml(referral),
    description: escapeHtml(description),
  };

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: 'realgringofurioso@gmail.com',
    subject: `New Intake: ${s.fname} ${s.lname} â€” ${s.type}`,
    html: `
      <h2 style="font-family:sans-serif;color:#1a2535;">New Fair Ground Advocates Intake</h2>
      <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;color:#666;width:180px;">Name</td><td style="padding:8px;font-weight:600;">${s.fname} ${s.lname}</td></tr>
        <tr style="background:#f5f7fa;"><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;"><a href="mailto:${s.email}">${s.email}</a></td></tr>
        <tr><td style="padding:8px;color:#666;">Phone</td><td style="padding:8px;">${s.phone || 'Not provided'}</td></tr>
        <tr style="background:#f5f7fa;"><td style="padding:8px;color:#666;">Location</td><td style="padding:8px;">${s.city}</td></tr>
        <tr><td style="padding:8px;color:#666;">Type of Help</td><td style="padding:8px;">${s.type}</td></tr>
        <tr style="background:#f5f7fa;"><td style="padding:8px;color:#666;">Found Us Via</td><td style="padding:8px;">${s.referral || 'Not provided'}</td></tr>
        <tr><td style="padding:8px;color:#666;vertical-align:top;">Description</td><td style="padding:8px;">${s.description}</td></tr>
      </table>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect('/?submitted=true');
  } catch (err) {
    console.error('Mail error:', err);
    res.redirect('/?error=true');
  }
});

app.get('/our-story', (req, res) => {
  res.sendFile(path.join(__dirname, 'story.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Fair Ground Advocates running on port ${PORT}`);
});
