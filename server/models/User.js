import mongoose from "mongoose";
const userSchema=new mongoose.Schema({
    _id:{type:String,required:true},
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    resume:{type:String},
    resumeText:{type:String,default:''},
    image:{type:String,required:true},
    plan:{type:String,enum:['free','pro'],default:'free'},
    proSince:{type:Date,default:null},
    razorpayOrderId:{type:String,default:null},
    razorpayPaymentId:{type:String,default:null},
    isBlocked:{type:Boolean,default:false},
   
})

const User=mongoose.model('User',userSchema)

export default User;