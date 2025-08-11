import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { whop } from './api.js';

// Environment variable check
if (!process.env.WHOP_COMPANY_TOKEN) {
  console.error('❌ WHOP_COMPANY_TOKEN environment variable is missing!');
  process.exit(1);
}
console.log('✅ Environment variables loaded successfully');

const app = express();

// ===== CORS: allow all domains =====
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));
app.options('*', cors());

// ===== Body parsing =====
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Lookup user from receipt
app.post('/api/lookup-user-from-receipt', async (req, res) => {
  try {
    const { receiptId } = req.body;
    if (!receiptId) return res.status(400).json({ error: "Missing receiptId" });

    const payment = await whop.payments.retrievePayment({
      paymentId: receiptId,
      expand: ["user"],
    });

    const userId = payment?.user?.id || payment?.user;
    const email = payment?.user?.email;
    if (!userId) return res.status(404).json({ error: "User not found on payment" });

    res.status(200).json({ userId, email });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// Create charge
app.post('/api/charge', async (req, res) => {
  try {
    const { whopUserId, amount, currency, memo } = req.body;
    if (!whopUserId || !amount || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await whop.payments.chargeUser({
      userId: whopUserId,
      amount,
      currency,
      metadata: memo ? { memo } : undefined,
    });

    if (!result?.inAppPurchase) {
      return res.status(500).json({ error: "No inAppPurchase returned." });
    }

    res.status(200).json(result.inAppPurchase);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API listening on port ${PORT}`);
  console.log('🚀 Server started successfully!');
  console.log('🌐 Server accessible from external IP addresses');
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
