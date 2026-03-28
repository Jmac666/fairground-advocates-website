const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  }
});

app.post('/intake', async (req, res) => {
  const { fname, lname, email, phone, city, type, referral, description } = req.body;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: 'realgringofurioso@gmail.com',
    subject: `New Intake Request: ${fname} ${lname} (${type})`,
    html: `
      <h2 style="font-family:sans-serif;color:#1a2535;">New Fair Ground Advocates Intake</h2>
      <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;color:#666;width:180px;">Name</td><td style="padding:8px;font-weight:600;">${fname} ${lname}</td></tr>
        <tr style="background:#f5f7fa;"><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;color:#666;">Phone</td><td style="padding:8px;">${phone || 'Not provided'}</td></tr>
        <tr style="background:#f5f7fa;"><td style="padding:8px;color:#666;">Location</td><td style="padding:8px;">${city}</td></tr>
        <tr><td style="padding:8px;color:#666;">Type of Help</td><td style="padding:8px;">${type}</td></tr>
        <tr style="background:#f5f7fa;"><td style="padding:8px;color:#666;">Found Us Via</td><td style="padding:8px;">${referral || 'Not provided'}</td></tr>
        <tr><td style="padding:8px;color:#666;vertical-align:top;">Description</td><td style="padding:8px;">${description}</td></tr>
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Fair Ground Advocates running on port ${PORT}`);
});
