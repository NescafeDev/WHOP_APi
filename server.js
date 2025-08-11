import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';

import { whop } from './api';

// Add environment variable check
if (!process.env.WHOP_COMPANY_TOKEN) {
  console.error('❌ WHOP_COMPANY_TOKEN environment variable is missing!');
  console.error('Please create a .env file with your Whop company token.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('🔑 WHOP_COMPANY_TOKEN:', process.env.WHOP_COMPANY_TOKEN ? 'Set' : 'Missing');

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all origins
    return callback(null, true);
  },
  credentials: false
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/api/lookup-user-from-receipt', async (req, res) => {
  try {
    const { receiptId } = req.body;
    if (!receiptId) return res.status(400).json({ error: "Missing receiptId" });

    // v2 payment + expand user
    const payment = await whop.payments.retrievePayment({
      paymentId: receiptId,
      expand: ["user"],
    }); // result includes user when expanded. :contentReference[oaicite:4]{index=4}

    const userId = payment.user.id || payment.user;
    const email = payment.user.email;
    if (!userId) return res.status(404).json({ error: "User not found on payment" });

    res.status(200).json({ userId, email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/charge', async (req, res) => {
  try {
    const { whopUserId, amount, currency, memo } = req.body;
    if (!whopUserId || !amount || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Server operation: create a pending purchase
    const result = await whop.payments.chargeUser({
      userId: whopUserId,
      amount,               // cents, e.g. 1999 for $19.99
      currency,             // "usd"
      metadata: memo ? { memo } : undefined,
    }); // server-only API per docs. :contentReference[oaicite:5]{index=5}

    if (!result?.inAppPurchase) {
      return res.status(500).json({ error: "No inAppPurchase returned." });
    }
    res.status(200).json(result.inAppPurchase); // client will confirm via modal
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
})

app.listen(process.env.PORT || 8081, '0.0.0.0', () => {
  console.log(`✅ API listening on port ${process.env.PORT || 8081}`);
  console.log('🚀 Server started successfully!');
  console.log('🌐 Server accessible from external IP addresses');
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});