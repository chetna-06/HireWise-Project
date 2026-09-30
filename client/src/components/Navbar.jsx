import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
const Navbar = () => {
    const {openSignIn}=useClerk()
    const {user}=useUser()
    const navigate=useNavigate()
    const {setShowRecruiterLogin,planInfo}=useContext(AppContext)
  return (
    <div className='shadow py-4'>
        <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
        <img onClick={()=>navigate('/')}  className='cursor-pointer' src={assets.logo} alt=""></img>
        {
            user
            ?<div className='flex items-center gap-3'>
                <Link to={'/applications'}>Applied Jobs</Link>
                <p>|</p>
                <Link to={'/pricing'} className='text-blue-600'>Pricing</Link>
                <p>|</p>
                {planInfo?.role==='user' && (
                  <span className={`text-xs px-2 py-1 rounded ${planInfo.plan==='pro' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{planInfo.plan==='pro' ? `Pro` : `${planInfo.used}/${planInfo.limit} free`}</span>
                )}
                <p className='max-sm:hidden'>Hi, {user.firstName+" "+user.lastName}</p>
                <UserButton/>
            </div>
            :<div className='flex gap-4 max-sm:text-xs items-center'>
            {/* <Link to={'/pricing'} className='text-gray-600'>Pricing</Link> */}
            <Link to={'/pricing'} className='text-black'>Upgrade Plan</Link>
            <button onClick={e=>setShowRecruiterLogin(true)} className='text-gray-600'>Recruiter Login</button>
            <button onClick={ e=> openSignIn()} className='bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full '>Login</button>
        </div>
        }
        
        </div>
    </div>
  )
}

export default Navbar