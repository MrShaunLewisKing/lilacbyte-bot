# Lilac Discord Bot 🌸 (`lilacbyte.xyz Bot`)

[![Railway Deploy](https://railway.app/button.svg)](https://railway.app/template)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)
[![Website](https://img.shields.io/badge/website-lilacbyte.xyz-f472b6?style=for-the-badge&logo=safari&logoColor=white)](https://lilacbyte.xyz)

The official 24/7 Discord Bot for **[lilacbyte.xyz](https://lilacbyte.xyz)**. Built with Discord.js v14 and TypeScript, designed to run 24/7 on **Railway** and seamlessly connect with your Vercel-hosted frontend.

---

## ✨ Features

- 🟢 **24/7 Online Gateway**: Keeps the bot persistently online in Discord servers with a live presence (`🌸 lilacbyte.xyz`).
- 🔗 **Bidirectional Website Connector**: Automatically syncs presence and telemetry with `https://lilacbyte.xyz/api/bot`.
- ⚡ **Interactive Slash Commands**:
  - `/profile` & `/card`: Rich embeds displaying Lilac's live info with direct interactive link buttons.
  - `/music`: Shows current track info (`Cruel Summer`) with player links.
  - `/ping`: Latency and API gateway telemetry.
  - `/status`: Checks connector bridge health between Railway and Vercel.

---

## 🛠️ Railway Deployment (Step-by-Step)

1. **Create GitHub Repo**: Push this code to your GitHub account (e.g. `MrShaunLewisKing/lilacbyte-bot`).
2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app) and click **"New Project" > "Deploy from GitHub repo"**.
   - Select your bot repository.
3. **Configure Environment Variables** in Railway dashboard:
   - `DISCORD_TOKEN`: Your Discord Bot Token (from Discord Developer Portal).
   - `CLIENT_ID`: `1199007203768672297`
   - `LILAC_API_URL`: `https://lilacbyte.xyz/api/bot`
4. **Deploy Slash Commands**:
   - Run `npm run deploy-commands` locally or via Railway deployment trigger to register the `/` commands with Discord.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure .env
cp .env.example .env

# 3. Deploy slash commands to Discord
npm run deploy-commands

# 4. Start local bot
npm run dev
```

---

## 🌸 License

Created with love by Lilac.
