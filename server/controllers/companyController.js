import Company from "../models/Company.js";
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from "cloudinary"
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplications.js";
import { FREE_JOB_POST_LIMIT } from "../utils/planLimits.js";

export const registerCompany=async(req,res)=>{
    const {name,email,password}=req.body
    const imageFile=req.file;
    console.log("IMAGE FILE:", imageFile);
    if(!name || !email || !password || !imageFile){
        return res.json({success:false,message:"Missing Details"})
    }
    try{
        const companyExists=await Company.findOne({email})
        if(companyExists){
            return res.json({success:false,message:'Company already registered'})
        }
        const salt=await bcrypt.genSalt(10)
        const hashPassword=await bcrypt.hash(password,salt)
        // const imageUpload=await cloudinary.uploader.upload(imageFile.path)
       const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
    resource_type: 'image',
    folder: 'hirewise'
})
        const company=await Company.create({
            name,
            email,
            password:hashPassword,
            image:imageUpload.secure_url
        })
        res.json({
            success:true,
            company:{
                _id:company._id,
                name:company.name,
                email:company.email,
                image:company.image
            },
            token: generateToken(company._id)
        })
    }
    catch(error){
        console.log("CLOUDINARY ERROR:", error)
        res.json({success:false,message:error.message})
    }

}

export const loginCompany=async(req,res)=>{
    const {email,password}=req.body
    try{
        const company=await Company.findOne({email})
        if(await bcrypt.compare(password,company.password)){
            res.json({
                success:true,
                company:{
                     _id:company._id,
                name:company.name,
                email:company.email,
                image:company.image
                },
                token:generateToken(company._id)
            })
        }
        else{
            res.json({success:false,message:'Invalid email or password'})
        }
    }
    catch(error){
        res.json({success:false,message:error.message})
    }

}

export const getCompanyData=async(req,res)=>{
    
    try{
        const company=req.company
        res.json({success:true,company})
    }
    catch(error){
        res.json({
            success:false,message:error.message
        })
    }

}

export const postJob=async(req,res)=>{
    const {title,description,location,salary,level,category}=req.body
    const companyId=req.company._id
    // console.log(companyId,{title,description,location,salary});

    try{
        // Free plan: recruiters can post only FREE_JOB_POST_LIMIT jobs
        const company=await Company.findById(companyId).select('plan')
        const jobCount=await Job.countDocuments({companyId})
        if(company?.plan!=='pro' && jobCount>=FREE_JOB_POST_LIMIT){
            return res.status(402).json({
                success:false,
                code:'LIMIT_EXCEEDED',
                message:`Free plan allows only ${FREE_JOB_POST_LIMIT} job posts. Upgrade to Pro for unlimited posts.`,
                used:jobCount,
                limit:FREE_JOB_POST_LIMIT,
                plan:company?.plan || 'free'
            })
        }
        const newJob=new Job({
            title,
            description,
            location,
            salary,
            companyId,
            date:Date.now(),
            level,
            category
        })
        await newJob.save()
        res.json({success:true,newJob})
    }
    catch(error){
        res.json({success:false,message:error.message})
    }

}

export const getCompanyJobApplicants=async(req,res)=>{
    try{
        const companyId=req.company._id
        //find job application
        const applications=await JobApplication.find({companyId})
        .populate('userId','name image resume')
        .populate('jobId','title location category salary')
        .exec()

        return res.json({success:true,applications})
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}

export const getCompanyPostedJobs=async(req,res)=>{
    try{
        const companyId=req.company._id
        const jobs=await Job.find({companyId})
       

        const jobsData=await Promise.all(jobs.map(async(job)=>{
            const applicants=await JobApplication.find({jobId:job._id})
            return {...job.toObject(),applicants:applicants.length}
        }))
         const company=await Company.findById(companyId).select('plan')
         res.json({success:true,jobsData,plan:company?.plan || 'free',used:jobs.length,limit:FREE_JOB_POST_LIMIT})
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
    
}

export const ChangeJobApplicationsStatus=async(req,res)=>{
    try{
        const {id,status}=req.body
    //find job application
    await JobApplication.findOneAndUpdate({_id:id},{status})

    res.json({success:true,message:'Status Changed'})
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
    
}

export const ChangeVisibility=async(req,res)=>{
    try{
        const {id}=req.body
        const companyId=req.company._id
        const job=await Job.findById(id)
        if(companyId.toString()===job.companyId.toString()){
            job.visible=!job.visible
        }
        await job.save()
        res.json({success:true,job})
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}