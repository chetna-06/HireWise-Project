import express from 'express'
import { createOrder, getPlanStatus, verifyPayment } from '../controllers/paymentController.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Company (JWT in `token` header) or seeker (Clerk session via clerkMiddleware).
// Try company auth first, fall through to Clerk identity inside the controller.
const tryProtectCompany = (req, _res, next) => {
    if (req.headers.token) {
        return protectCompany(req, _res, next)
    }
    next()
}

router.post('/create-order', tryProtectCompany, createOrder)
router.post('/verify', tryProtectCompany, verifyPayment)
router.get('/plan', tryProtectCompany, getPlanStatus)

export default router
