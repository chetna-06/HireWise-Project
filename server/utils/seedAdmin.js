import bcrypt from 'bcrypt'
import Admin from "../models/Admin.js";

// Seeds a single super-admin from env on boot. Safe to run every start.
const seedAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL
        const password = process.env.ADMIN_PASSWORD
        if (!email || !password) {
            return
        }
        const existing = await Admin.findOne({ email })
        if (existing) {
            return
        }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        await Admin.create({ name: 'Super Admin', email, password: hash, role: 'superadmin' })
        console.log(`Admin seeded: ${email}`)
    } catch (err) {
        console.error("Admin seed failed:", err.message)
    }
}

export default seedAdmin
