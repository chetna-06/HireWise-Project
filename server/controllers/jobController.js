import Job from "../models/Job.js"



//get all jobs
export const getJobs=async(req,res)=>{
    try{
        const jobs=await Job.find({visible:true,status:'approved'})
        .populate({path:'companyId',select:'-password'})

        // Hide jobs from blocked recruiters
        const filtered=jobs.filter((j)=>j.companyId && !j.companyId.isBlocked)
        res.json({success:true,jobs:filtered})
    }
    catch(error){
        res.json({success:false,message:error.message})
    }

}

//get single job by id
export const getJobById=async(req,res)=>{
    try{
        const {id}=req.params
        const job=await Job.findById(id)
        .populate({
            path:'companyId',
            select:"-password"
        })
        if(!job){
            return res.json({
                success:false,
                message:'Job not found'
            })
        }
        if(job.status==='rejected'){
            return res.json({
                success:false,
                message:'Job not available'
            })
        }
        if(job.companyId?.isBlocked){
            return res.json({
                success:false,
                message:'Job not available'
            })
        }
        res.json({
            success:true,
            job
        })
    }
    catch(error){
        res.json({success:false,message:error.message})
    }

}