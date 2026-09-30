import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    role: { type: String, enum: ['company', 'user'], required: true },
    // company ObjectId as string, or Clerk userId string
    refId: { type: String, required: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, default: null },
    signature: { type: String, default: null },
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: 'INR' },
    receipt: { type: String, required: true },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    plan: { type: String, default: 'pro' },
    date: { type: Number, default: () => Date.now() },
})

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment
