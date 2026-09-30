import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import { clerkMiddleware } from '@clerk/express'


//Initialize express
const app = express()

// CORS FIRST so even boot/DB errors still send CORS headers
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
}));
app.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks)
app.use(express.json())
app.use(clerkMiddleware())

//connect to databse (non-fatal: server still listens so frontend gets JSON, not CORS opaque failure)
try {
  await connectDB()
} catch (err) {
  console.error("Database connection failed, server running in degraded mode:", err.message)
}
try {
  await connectCloudinary()
  console.log("Cloudinary configured")
} catch (err) {
  console.error("Cloudinary configuration failed:", err.message)
}

//routes
app.get('/', (req, res) => res.send("API Working"))
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
// app.post('/webhooks',clerkWebhooks)

app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)

//port
const PORT = process.env.PORT || 5000
Sentry.setupExpressErrorHandler(app);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})







