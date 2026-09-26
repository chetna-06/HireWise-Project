import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks=async(req,res)=>{
    try{
        const whook=new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        await whook.verify(req.body,{
            "svix-id":req.headers["svix-id"],
            "svix-timestamp":req.headers["svix-timestamp"],
            "svix-signature":req.headers["svix-signature"]
        })
        // const { data,type}=req.body
        const { data,type}=JSON.parse(req.body.toString())
        switch(type){
            case 'user.created':{
                console.log("PRIMARY EMAIL ID:", data.primary_email_address_id);
console.log("EMAIL ADDRESSES:", JSON.stringify(data.email_addresses, null, 2));
                const userData={
                    _id:data.id,
                    // email:data.email_addresses[0].email_address,
                    // email: data.email_addresses?.[0]?.email_address || '',
                    email: data.email_addresses?.find(
    email => email.id === data.primary_email_address_id
)?.email_address || '',
                    name:data.first_name+" "+data.last_name,
                    image:data.image_url,
                    resume:''
                }
                await User.create(userData)
                res.json({})
                break;
            }
            case 'user.updated':{
                console.log("UPDATED IMAGE URL:", data.image_url);
console.log("UPDATED PROFILE IMAGE URL:", data.profile_image_url);
                const userData={
                    email:data.email_addresses[0].email_address,
                    name:data.first_name+" "+data.last_name,
                    image:data.image_url
                }
                await User.findByIdAndUpdate(data.id,userData)
                res.json({})
                break;
            }
            case 'user.deleted':{
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }
            default:
                break;
        }
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:'Webhooks Error'})
    }
}