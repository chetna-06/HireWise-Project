import jwt from 'jsonwebtoken'
import Company from '../models/Company.js'
import Admin from '../models/Admin.js'

export const protectCompany=async(req,res,next)=>{
    const token=req.headers.token
    if(!token){
        return res.json({success:false,message:'Not authorized, Login Again'})
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const company=await Company.findById(decoded.id).select('-password')
        if(!company){
            return res.json({success:false,message:'Company not found'})
        }
        if(company.isBlocked){
            return res.status(403).json({success:false,message:'Account blocked by admin',code:'ACCOUNT_BLOCKED'})
        }
        req.company=company
        next()
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}

export const protectAdmin=async(req,res,next)=>{
    const token=req.headers.admintoken || req.headers.token
    if(!token){
        return res.status(401).json({success:false,message:'Admin login required'})
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        if(decoded.type!=='admin'){
            return res.status(403).json({success:false,message:'Admin access required'})
        }
        const admin=await Admin.findById(decoded.id).select('-password')
        if(!admin || !admin.isActive){
            return res.status(403).json({success:false,message:'Admin account inactive'})
        }
        req.admin=admin
        next()
    }
    catch(error){
        res.status(401).json({success:false,message:error.message})
    }
}