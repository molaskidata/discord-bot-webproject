import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config({ path: "../.env" });

const app = express();
const port = 3002;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'Coffee & Codes Activity Server Online',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.post("/api/token", async (req, res) => {
  try {
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.body.code,
      }),
    });

    const { access_token } = await response.json();
    res.send({access_token});
  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.status(500).json({ error: 'OAuth authentication failed' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`☕ Coffee & Codes Activity Server listening at http://localhost:${port}`);
});
