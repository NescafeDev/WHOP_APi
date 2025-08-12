import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware to see what's being received
app.use((req, res, next) => {
  console.log('📥 Request method:', req.method);
  console.log('📥 Request URL:', req.url);
  console.log('📥 Content-Type:', req.headers['content-type']);
  console.log('📥 Request body:', req.body);
  console.log('📥 Request body type:', typeof req.body);
  next();
});

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
    // const { receiptId } = req.body;
    // if (!receiptId) return res.status(400).json({ error: "Missing receiptId" });

    // // 1) GET /api/v2/payments/{id}
    // const payR = await fetch(`https://api.whop.com/api/v2/payments/${receiptId}`, {
    //   headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }
    // });
    // if (!payR.ok) throw new Error(`Failed to retrieve payment: ${payR.status}`);
    // const payment = await payR.json();

    // const userId = payment?.user?.id || payment?.user;
    // if (!userId) return res.status(404).json({ error: "User not found on payment" });

    // // 2) GET /api/v5/company/users/{id} for email/details
    // const userR = await fetch(`https://api.whop.com/api/v5/company/users/${userId}`, {
    //   headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }
    // });
    // if (!userR.ok) throw new Error(`Failed to retrieve user: ${userR.status}`);
    // const user = await userR.json();

    // return res.status(200).json({ userId, email: user.email || null });

    const { receiptId } = req.body;

    const result = await whop.payments.listReceiptsForCompany({
      companyId: "biz_IXkWSJQ9Qfs4hX",
      first: 1,
      filter: {
        currencies: "usd",
        planIds: ["plan_1Mh6CixKa66Pi"],
        query: receiptId,
        direction: "asc"
      }
    })

    const member = result.receipts.nodes[0].member;

    const userId = member.user.id;

    res.status(200).json({ userId });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Create charge
app.post('/api/charge', async (req, res) => {
  try {
    const { whopUserId, amount, currency, memo } = req.body;
    console.log('Req Data:', req.body);
    if (!whopUserId || !amount || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await whop.payments.chargeUser({
      userId: whopUserId,
      amount: parseFloat(amount),
      currency,
      metadata: memo ? { memo } : undefined,
    });

    if (!result?.inAppPurchase) {
      return res.status(500).json({ error: "No inAppPurchase returned." });
    }

    res.status(200).json(result.inAppPurchase);
  } catch (e) {
    res.status(500).json({ err: e.message || 'Server error' });
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
