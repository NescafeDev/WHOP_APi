import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';

// Add environment variable check
if (!process.env.WHOP_COMPANY_TOKEN) {
  console.error('❌ WHOP_COMPANY_TOKEN environment variable is missing!');
  console.error('Please create a .env file with your Whop company token.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('🔑 WHOP_COMPANY_TOKEN:', process.env.WHOP_COMPANY_TOKEN ? 'Set' : 'Missing');

const app = express();
app.use(cors({ origin: [/localhost:\d+$/, /\.clickfunnels\.com$/], credentials: false }));
app.use(express.json());

const ChargeSchema = z.object({
    whopUserId: z.string().min(1),
    amount: z.number().int().positive(), // e.g., 1999 for $19.99
    currency: z.string().toLowerCase().length(3), // "usd"
    memo: z.string().max(200).optional(),
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/api/charge', async (req, res) => {
    console.log(req.body);
    const parsed = ChargeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { whopUserId, amount, currency, memo } = parsed.data;
  
    try {
      const r = await fetch('https://api.whop.com/v5/company/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHOP_COMPANY_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: whopUserId,
          amount,
          currency,
          memo,
        }),
      });
  
      const json = await r.json();
      if (!r.ok) {
        return res.status(r.status).json({ error: 'Whop error', details: json });
      }
  
      // If you’re using the 2-step in-app flow, this returns an inAppPurchase you pass to the iframe SDK.
      return res.json(json);
    } catch (err) {
      console.error('Charge error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.listen(process.env.PORT || 8081, '0.0.0.0', () => {
    console.log(`✅ API listening on port ${process.env.PORT || 8081}`);
    console.log('🚀 Server started successfully!');
    console.log('🌐 Server accessible from external IP addresses');
  }).on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  });