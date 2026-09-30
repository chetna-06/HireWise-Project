import mongoose from "mongoose";

const companySchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    image:{type:String,required:true},
    password:{type:String,required:true},
    plan:{type:String,enum:['free','pro'],default:'free'},
    proSince:{type:Date,default:null},
    razorpayOrderId:{type:String,default:null},
    razorpayPaymentId:{type:String,default:null},
})

const Company=mongoose.model('Company',companySchema)

export default Company