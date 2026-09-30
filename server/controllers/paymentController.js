import crypto from 'crypto'
import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplications.js";
import { FREE_APPLICATION_LIMIT, FREE_JOB_POST_LIMIT, PRO_PLAN_AMOUNT_PAISE, PRO_PLAN_PRICE_INR } from "../utils/planLimits.js";

// Resolve caller identity from either company JWT (req.company) or Clerk (req.auth()).
const resolveIdentity = (req) => {
    if (req.company?._id) {
        return { role: 'company', refId: req.company._id.toString() }
    }
    try {
        const auth = typeof req.auth === 'function' ? req.auth() : req.auth
        const userId = auth?.userId
        if (userId) return { role: 'user', refId: userId }
    } catch { /* ignore */ }
    return null
}

// POST /api/payments/create-order  { role?: 'company'|'user' }
export const createOrder = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ success: false, message: 'Payments not configured' })
        }
        let { role } = req.body || {}
        const identity = resolveIdentity(req)
        if (!identity) {
            return res.status(401).json({ success: false, message: 'Not authorized' })
        }
        // Never trust client role if it conflicts with the authenticated identity
        role = identity.role
        const { refId } = identity

        // Already pro -> no need for another order
        if (role === 'company') {
            const company = await Company.findById(refId)
            if (company?.plan === 'pro') {
                return res.json({ success: false, message: 'Already on Pro plan', code: 'ALREADY_PRO' })
            }
        } else {
            const user = await User.findById(refId)
            if (user?.plan === 'pro') {
                return res.json({ success: false, message: 'Already on Pro plan', code: 'ALREADY_PRO' })
            }
        }

        const receipt = `pro_${role}_${refId}_${Date.now()}`
        const order = await razorpay.orders.create({
            amount: PRO_PLAN_AMOUNT_PAISE,
            currency: 'INR',
            receipt,
        })

        await Payment.create({
            role,
            refId,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt,
            status: 'created',
        })

        return res.json({
            success: true,
            order: { id: order.id, amount: order.amount, currency: order.currency, receipt },
            keyId: process.env.RAZORPAY_KEY_ID,
            priceINR: PRO_PLAN_PRICE_INR,
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// POST /api/payments/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ success: false, message: 'Payments not configured' })
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment details' })
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ success: false, message: 'Payments not configured' })
        }
        const identity = resolveIdentity(req)
        if (!identity) {
            return res.status(401).json({ success: false, message: 'Not authorized' })
        }
        const { role, refId } = identity

        // Same check as HealthBridge: HMAC(order_id|payment_id) must match signature
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')
        if (expected !== razorpay_signature) {
            await Payment.findOneAndUpdate({ orderId: razorpay_order_id }, { status: 'failed', paymentId: razorpay_payment_id, signature: razorpay_signature })
            return res.status(400).json({ success: false, message: 'Invalid payment signature' })
        }

        const orderInfo = await razorpay.orders.fetch(razorpay_order_id)
        if (orderInfo.status !== 'paid') {
            await Payment.findOneAndUpdate({ orderId: razorpay_order_id }, { status: 'failed', paymentId: razorpay_payment_id, signature: razorpay_signature })
            return res.status(400).json({ success: false, message: 'Payment not completed' })
        }

        const payment = await Payment.findOne({ orderId: razorpay_order_id })
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }
        if (payment.refId !== refId || payment.role !== role) {
            return res.status(403).json({ success: false, message: 'Order does not belong to this account' })
        }

        await Payment.findOneAndUpdate(
            { orderId: razorpay_order_id },
            { status: 'paid', paymentId: razorpay_payment_id, signature: razorpay_signature }
        )

        if (role === 'company') {
            const company = await Company.findByIdAndUpdate(
                refId,
                { plan: 'pro', proSince: new Date(), razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id },
                { new: true }
            ).select('-password')
            return res.json({ success: true, message: 'Upgraded to Pro', plan: 'pro', company })
        } else {
            const user = await User.findByIdAndUpdate(
                refId,
                { plan: 'pro', proSince: new Date(), razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id },
                { new: true }
            )
            return res.json({ success: true, message: 'Upgraded to Pro', plan: 'pro', user })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// GET /api/payments/plan  -> { role, plan, used, limit, priceINR }
export const getPlanStatus = async (req, res) => {
    try {
        const identity = resolveIdentity(req)
        if (!identity) {
            return res.status(401).json({ success: false, message: 'Not authorized' })
        }
        const { role, refId } = identity
        if (role === 'company') {
            const company = await Company.findById(refId).select('plan')
            const used = await Job.countDocuments({ companyId: refId })
            return res.json({
                success: true,
                role,
                plan: company?.plan || 'free',
                used,
                limit: FREE_JOB_POST_LIMIT,
                priceINR: PRO_PLAN_PRICE_INR,
            })
        } else {
            const user = await User.findById(refId).select('plan')
            const used = await JobApplication.countDocuments({ userId: refId })
            return res.json({
                success: true,
                role,
                plan: user?.plan || 'free',
                used,
                limit: FREE_APPLICATION_LIMIT,
                priceINR: PRO_PLAN_PRICE_INR,
            })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
