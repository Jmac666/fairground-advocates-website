# Fair Ground Advocates — Website

## Deploy to Railway

1. Push this folder to a GitHub repo
2. In Railway, click "New Project" and select "Deploy from GitHub repo"
3. Select your repo — Railway will auto-detect and deploy
4. Set environment variables in Railway (Settings > Variables):
   - MAIL_USER = realgringofurioso@gmail.com
   - MAIL_PASS = your Gmail app password (see below)
5. In Railway project settings, go to "Domains"
6. Click "Add Custom Domain" and enter fairgroundadvocates.org
7. Update DNS at Namecheap with the CNAME Railway provides

## Gmail App Password Setup

Gmail requires an App Password for third-party apps — your regular password won't work.

1. Go to myaccount.google.com
2. Security > 2-Step Verification (must be enabled)
3. Security > App Passwords
4. Create a new app password, name it "Fair Ground Advocates"
5. Copy the 16-character password
6. Paste it as MAIL_PASS in Railway environment variables

## How Form Submissions Work

When someone submits the intake form, the server emails the submission directly to realgringofurioso@gmail.com with all their details formatted cleanly. No third party involved.

## Local Development

```bash
npm install
npm start
```

Create a .env file locally:
```
MAIL_USER=realgringofurioso@gmail.com
MAIL_PASS=your_app_password
```

Then open http://localhost:3000
