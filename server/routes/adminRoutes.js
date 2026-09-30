import express from 'express'
import {
    deleteCompany, deleteJob, deleteUser, getAdminMe, getCompanyDetail, getOverview,
    getUserDetail, listAllApplications, listCompanies, listJobs, listSubscriptions,
    listUsers, loginAdmin, setCompanyBlocked, setCompanyVerified, setJobStatus,
    setUserBlocked, updateJob,
} from '../controllers/adminController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', loginAdmin)
router.get('/me', protectAdmin, getAdminMe)
router.get('/overview', protectAdmin, getOverview)

router.get('/users', protectAdmin, listUsers)
router.get('/users/:id', protectAdmin, getUserDetail)
router.patch('/users/:id/block', protectAdmin, setUserBlocked)
router.delete('/users/:id', protectAdmin, deleteUser)

router.get('/companies', protectAdmin, listCompanies)
router.get('/companies/:id', protectAdmin, getCompanyDetail)
router.patch('/companies/:id/block', protectAdmin, setCompanyBlocked)
router.patch('/companies/:id/verify', protectAdmin, setCompanyVerified)
router.delete('/companies/:id', protectAdmin, deleteCompany)

router.get('/jobs', protectAdmin, listJobs)
router.patch('/jobs/:id/status', protectAdmin, setJobStatus)
router.put('/jobs/:id', protectAdmin, updateJob)
router.delete('/jobs/:id', protectAdmin, deleteJob)

router.get('/applications', protectAdmin, listAllApplications)
router.get('/subscriptions', protectAdmin, listSubscriptions)

export default router
