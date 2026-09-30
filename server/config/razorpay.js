import Razorpay from 'razorpay'

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null

if (!razorpay) {
  console.warn('Razorpay not configured: missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET')
}

export default razorpay
