import jwt from 'jsonwebtoken'

const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'30d'
    })
}

export const generateAdminToken=(id)=>{
    return jwt.sign({id,type:'admin'},process.env.JWT_SECRET,{
        expiresIn:'1d'
    })
}

export default generateToken