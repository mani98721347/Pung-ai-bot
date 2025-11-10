# 🚀 Free Hosting Guide for Pung AI Discord Bot

Your Discord bot is now ready to be hosted online 24/7! Here are the best **FREE** hosting options:

---

## 🥇 Option 1: Render.com (Recommended)

**Why?** Free tier, easy setup, great for Discord bots, no credit card required.

### Setup Steps:
1. **Create Account**: Go to [render.com](https://render.com) and sign up (GitHub login works)

2. **Prepare Your Code**:
   - Push your bot code to GitHub (if not already)
   - Make sure `package.json` and `config.env` are in the repo
   - **IMPORTANT**: Add `config.env` to `.gitignore` (never commit API keys!)

3. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - **Settings**:
     - **Name**: `pung-ai-bot`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`

4. **Add Environment Variables**:
   - Click "Environment" tab
   - Add these variables:
     ```
     DISCORD_TOKEN=your_discord_token_here
     GEMINI_API_KEY=your_gemini_api_key_here
     OWNER_ID=your_discord_user_id
     ```

5. **Deploy**: Click "Create Web Service" and wait for deployment!

### ⚠️ Limitations:
- Free tier spins down after 15 minutes of inactivity
- Takes ~30 seconds to wake up when first message comes
- 750 hours/month (enough for 24/7 most of the month)

---

## 🥈 Option 2: Railway.app

**Why?** More generous free tier, faster performance, modern UI.

### Setup Steps:
1. **Create Account**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your bot repository

3. **Add Environment Variables**:
   - Click on your service
   - Go to "Variables" tab
   - Add:
     ```
     DISCORD_TOKEN=your_discord_token_here
     GEMINI_API_KEY=your_gemini_api_key_here
     OWNER_ID=your_discord_user_id
     ```

4. **Deploy**: Railway auto-detects Node.js and deploys!

### ⚠️ Limitations:
- $5 free credit per month (usually enough for small bots)
- After credits run out, bot stops until next month
- Requires credit card for verification (not charged)

---

## 🥉 Option 3: Fly.io

**Why?** Great for lightweight bots, good free tier, multiple regions.

### Setup Steps:
1. **Install Fly CLI**:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Sign Up & Login**:
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Initialize App** (in your bot directory):
   ```bash
   fly launch
   ```
   - Say "No" to PostgreSQL
   - Say "No" to Redis
   - Choose free tier region

4. **Set Environment Variables**:
   ```bash
   fly secrets set DISCORD_TOKEN="your_token_here"
   fly secrets set GEMINI_API_KEY="your_key_here"
   fly secrets set OWNER_ID="your_id_here"
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

### ⚠️ Limitations:
- 3 free VMs (enough for Discord bot)
- Shared CPU, 256MB RAM per VM
- Credit card required for verification

---

## 🏅 Option 4: Glitch.com

**Why?** No credit card needed, beginner-friendly, code editor included.

### Setup Steps:
1. **Create Account**: Go to [glitch.com](https://glitch.com) and sign up

2. **New Project**:
   - Click "New Project" → "Import from GitHub"
   - Enter your repository URL

3. **Add .env File**:
   - Click on `.env` in file list
   - Add your variables:
     ```
     DISCORD_TOKEN=your_token_here
     GEMINI_API_KEY=your_key_here
     OWNER_ID=your_id_here
     ```

4. **Auto Deploy**: Glitch starts your bot automatically!

### ⚠️ Limitations:
- Bot sleeps after 5 minutes of HTTP inactivity
- Need to add uptime monitor (UptimeRobot.com) to keep alive
- 4000 hours/month (enough for 24/7)

---

## 🎯 Recommended Setup for 24/7 Hosting

### Best Option: **Render.com** + **UptimeRobot.com**

1. **Host on Render.com** (steps above)

2. **Keep Bot Alive with UptimeRobot**:
   - Go to [uptimerobot.com](https://uptimerobot.com) (free account)
   - Add "New Monitor"
   - **Monitor Type**: HTTP(s)
   - **URL**: Your Render.com app URL
   - **Monitoring Interval**: 5 minutes
   - This pings your bot every 5 minutes, keeping it awake!

3. **Add Health Endpoint** (optional, in `bot.js`):
   ```javascript
   // Add after imports
   import express from 'express';
   const app = express();
   
   app.get('/', (req, res) => {
     res.send('Bot is running!');
   });
   
   app.listen(3000, () => {
     console.log('Health check server on port 3000');
   });
   ```

4. **Update package.json** (add express):
   ```bash
   npm install express
   ```

---

## 💰 Comparison Table

| Platform | Free Tier | Credit Card | Keeps Running 24/7 | Setup Difficulty |
|----------|-----------|-------------|-------------------|------------------|
| **Render** | ✅ Great | ❌ No | ⚠️ With monitor | ⭐⭐ Easy |
| **Railway** | ✅ Good | ⚠️ Yes | ✅ Yes | ⭐ Very Easy |
| **Fly.io** | ✅ Good | ⚠️ Yes | ✅ Yes | ⭐⭐⭐ Medium |
| **Glitch** | ✅ Good | ❌ No | ⚠️ With monitor | ⭐ Very Easy |

---

## 🔧 Important Notes

### Before Deploying:

1. **Never commit sensitive data**:
   ```bash
   # Create .gitignore
   echo "config.env" >> .gitignore
   echo "node_modules/" >> .gitignore
   echo ".env" >> .gitignore
   ```

2. **Test locally first**:
   ```bash
   npm install
   npm start
   ```

3. **Check bot permissions** in Discord:
   - Server Members Intent
   - Message Content Intent
   - Manage Roles permission
   - Moderate Members permission

### After Deploying:

1. **Monitor logs** to check for errors
2. **Test all commands** to ensure everything works
3. **Set up UptimeRobot** if using Render/Glitch
4. **Check memory usage** - optimize if needed

---

## 🆘 Troubleshooting

### Bot goes offline randomly:
- Check your hosting platform's logs
- Verify environment variables are set correctly
- Add UptimeRobot monitoring

### Bot is slow to respond:
- Free tier instances are slower
- Consider Railway or Fly.io for better performance
- Optimize your code to reduce API calls

### "Out of memory" errors:
- Free tiers have limited RAM (256-512MB)
- Remove unnecessary logs
- Clear conversation history more frequently

### Bot doesn't start:
- Check logs for errors
- Verify `DISCORD_TOKEN` and `GEMINI_API_KEY` are correct
- Ensure `package.json` has correct start command

---

## 🎉 Recommended Path

**For Beginners**: Start with **Render.com** + **UptimeRobot**
- No credit card needed
- Easy setup
- 24/7 uptime with monitor
- Free forever

**For Better Performance**: Use **Railway.app**
- More generous free tier
- Faster response times
- Better for active servers
- Requires credit card (not charged)

---

## 📝 Next Steps

1. Choose your hosting platform
2. Push code to GitHub
3. Deploy following the steps above
4. Add environment variables
5. Test the bot
6. Set up monitoring (if needed)
7. Enjoy your 24/7 Discord bot! 🎮

---

**Need help?** Check the platform's documentation or Discord communities for support!

**Pro Tip**: Use Railway.app for the first month (generous free tier), then switch to Render + UptimeRobot for long-term free hosting!
