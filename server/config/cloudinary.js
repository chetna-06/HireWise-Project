import {v2 as cloudinary} from 'cloudinary'

const connectCloudinary=async()=>{
    
    cloudinary.config({
        cloud_name:process.env.CLOUDINARY_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_SECRET_KEY
    })
    console.log("Cloud:", process.env.CLOUDINARY_NAME)
    console.log("API Key:", process.env.CLOUDINARY_API_KEY)
    console.log("Secret loaded:", !!process.env.CLOUDINARY_SECRET_KEY)

    try {
        const result = await cloudinary.api.ping()
        console.log("CLOUDINARY PING:", result)
    } catch (error) {
        console.log("CLOUDINARY PING ERROR:", error)
    }

}

export default connectCloudinary