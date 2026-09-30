import bcrypt from 'bcrypt'
import Admin from "../models/Admin.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplications.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { generateAdminToken } from "../utils/generateToken.js";
import { FREE_APPLICATION_LIMIT, FREE_JOB_POST_LIMIT } from "../utils/planLimits.js";

const pageParams = (req, defaults = { page: 1, limit: 20 }) => {
    const page = Math.max(1, Number(req.query.page) || defaults.page)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || defaults.limit))
    return { page, limit, skip: (page - 1) * limit }
}

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' })
        }
        const admin = await Admin.findOne({ email })
        if (!admin || !admin.isActive) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }
        const ok = await bcrypt.compare(password, admin.password)
        if (!ok) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }
        res.json({
            success: true,
            admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
            token: generateAdminToken(admin._id),
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getAdminMe = async (req, res) => {
    res.json({ success: true, admin: req.admin })
}

// ---- Overview / stats ----
export const getOverview = async (req, res) => {
    try {
        const [users, companies, jobs, applications, payments, blockedUsers, blockedCompanies, pendingJobs] = await Promise.all([
            User.countDocuments(),
            Company.countDocuments(),
            Job.countDocuments(),
            JobApplication.countDocuments(),
            Payment.countDocuments({ status: 'paid' }),
            User.countDocuments({ isBlocked: true }),
            Company.countDocuments({ isBlocked: true }),
            Job.countDocuments({ status: 'pending' }),
        ])
        const proCompanies = await Company.countDocuments({ plan: 'pro' })
        const proUsers = await User.countDocuments({ plan: 'pro' })
        const byStatus = await JobApplication.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ])
        const last7 = Date.now() - 7 * 24 * 60 * 60 * 1000
        const recentApplications = await JobApplication.aggregate([
            { $match: { date: { $gte: last7 } } },
            { $group: { _id: { $toDate: '$date' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ])
        res.json({
            success: true,
            stats: { users, companies, jobs, applications, paidSubscriptions: payments, blockedUsers, blockedCompanies, pendingJobs, proCompanies, proUsers },
            applicationsByStatus: byStatus,
            recentApplications,
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// ---- Users ----
export const listUsers = async (req, res) => {
    try {
        const { page, limit, skip } = pageParams(req)
        const q = req.query.q
        const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {}
        if (req.query.blocked === 'true') filter.isBlocked = true
        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
        ])
        const withCounts = await Promise.all(users.map(async (u) => {
            const applications = await JobApplication.countDocuments({ userId: u._id })
            return { ...u.toObject(), applications, applicationLimit: FREE_APPLICATION_LIMIT }
        }))
        res.json({ success: true, total, page, limit, users: withCounts })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getUserDetail = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })
        const applications = await JobApplication.find({ userId: user._id })
            .populate('jobId', 'title location')
            .populate('companyId', 'name')
            .sort({ date: -1 })
            .limit(50)
        res.json({ success: true, user, applications })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const setUserBlocked = async (req, res) => {
    try {
        const { blocked } = req.body
        const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: !!blocked }, { new: true })
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })
        res.json({ success: true, user, message: user.isBlocked ? 'User blocked' : 'User activated' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })
        await JobApplication.deleteMany({ userId: req.params.id })
        res.json({ success: true, message: 'User and their applications deleted' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// ---- Recruiters / companies ----
export const listCompanies = async (req, res) => {
    try {
        const { page, limit, skip } = pageParams(req)
        const q = req.query.q
        const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {}
        if (req.query.blocked === 'true') filter.isBlocked = true
        if (req.query.verified === 'false') filter.isVerified = false
        const [total, companies] = await Promise.all([
            Company.countDocuments(filter),
            Company.find(filter).select('-password').sort({ _id: -1 }).skip(skip).limit(limit),
        ])
        const withCounts = await Promise.all(companies.map(async (c) => {
            const jobs = await Job.countDocuments({ companyId: c._id })
            return { ...c.toObject(), jobs, jobLimit: FREE_JOB_POST_LIMIT }
        }))
        res.json({ success: true, total, page, limit, companies: withCounts })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getCompanyDetail = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).select('-password')
        if (!company) return res.status(404).json({ success: false, message: 'Recruiter not found' })
        const jobs = await Job.find({ companyId: company._id }).sort({ date: -1 }).limit(50)
        res.json({ success: true, company, jobs, jobLimit: FREE_JOB_POST_LIMIT })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const setCompanyBlocked = async (req, res) => {
    try {
        const { blocked } = req.body
        const company = await Company.findByIdAndUpdate(req.params.id, { isBlocked: !!blocked }, { new: true }).select('-password')
        if (!company) return res.status(404).json({ success: false, message: 'Recruiter not found' })
        res.json({ success: true, company, message: company.isBlocked ? 'Recruiter blocked' : 'Recruiter activated' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const setCompanyVerified = async (req, res) => {
    try {
        const { verified } = req.body
        const company = await Company.findByIdAndUpdate(req.params.id, { isVerified: !!verified }, { new: true }).select('-password')
        if (!company) return res.status(404).json({ success: false, message: 'Recruiter not found' })
        res.json({ success: true, company })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id)
        if (!company) return res.status(404).json({ success: false, message: 'Recruiter not found' })
        const jobs = await Job.find({ companyId: req.params.id }).select('_id')
        const jobIds = jobs.map((j) => j._id)
        await Job.deleteMany({ companyId: req.params.id })
        if (jobIds.length) await JobApplication.deleteMany({ jobId: { $in: jobIds } })
        res.json({ success: true, message: 'Recruiter, jobs and applications deleted' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// ---- Jobs ----
export const listJobs = async (req, res) => {
    try {
        const { page, limit, skip } = pageParams(req)
        const filter = {}
        if (req.query.status) filter.status = req.query.status
        if (req.query.q) filter.title = new RegExp(req.query.q, 'i')
        if (req.query.companyId) filter.companyId = req.query.companyId
        const [total, jobs] = await Promise.all([
            Job.countDocuments(filter),
            Job.find(filter).populate('companyId', 'name email isBlocked isVerified').sort({ date: -1 }).skip(skip).limit(limit),
        ])
        res.json({ success: true, total, page, limit, jobs })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const setJobStatus = async (req, res) => {
    try {
        const { status } = req.body
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' })
        }
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { status, moderatedBy: req.admin._id, moderatedAt: new Date() },
            { new: true }
        )
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
        res.json({ success: true, job })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const updateJob = async (req, res) => {
    try {
        const allowed = ['title', 'description', 'location', 'category', 'level', 'salary', 'visible']
        const patch = {}
        for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k]
        const job = await Job.findByIdAndUpdate(req.params.id, patch, { new: true })
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
        res.json({ success: true, job })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id)
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
        await JobApplication.deleteMany({ jobId: req.params.id })
        res.json({ success: true, message: 'Job and its applications deleted' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// ---- Applications monitor ----
export const listAllApplications = async (req, res) => {
    try {
        const { page, limit, skip } = pageParams(req)
        const filter = {}
        if (req.query.status) filter.status = req.query.status
        const [total, applications] = await Promise.all([
            JobApplication.countDocuments(filter),
            JobApplication.find(filter)
                .populate('userId', 'name email')
                .populate('companyId', 'name email')
                .populate('jobId', 'title location')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
        ])
        // Unusual activity: users with many applications in last hour
        const hourAgo = Date.now() - 60 * 60 * 1000
        const burst = await JobApplication.aggregate([
            { $match: { date: { $gte: hourAgo } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $match: { count: { $gte: 10 } } },
        ])
        res.json({ success: true, total, page, limit, applications, suspiciousBursts: burst })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// ---- Subscriptions ----
export const listSubscriptions = async (req, res) => {
    try {
        const { page, limit, skip } = pageParams(req)
        const [total, payments] = await Promise.all([
            Payment.countDocuments(),
            Payment.find().sort({ date: -1 }).skip(skip).limit(limit),
        ])
        const [freeCompanies, proCompanies, freeUsers, proUsers] = await Promise.all([
            Company.countDocuments({ plan: 'free' }),
            Company.countDocuments({ plan: 'pro' }),
            User.countDocuments({ plan: 'free' }),
            User.countDocuments({ plan: 'pro' }),
        ])
        const topCompanies = await Job.aggregate([
            { $group: { _id: '$companyId', jobs: { $sum: 1 } } },
            { $sort: { jobs: -1 } },
            { $limit: 10 },
        ])
        res.json({
            success: true, total, page, limit, payments,
            summary: { freeCompanies, proCompanies, freeUsers, proUsers, jobLimit: FREE_JOB_POST_LIMIT, applicationLimit: FREE_APPLICATION_LIMIT },
            topCompaniesByJobs: topCompanies,
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
