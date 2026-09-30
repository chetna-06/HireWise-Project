import React, { useContext }  from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useEffect, useState } from 'react'
import UpgradeModal from '../components/UpgradeModal'

const Dashboard = () => {
    const navigate=useNavigate()
    const {companyData,setCompanyData,setCompanyToken,backendUrl,companyToken,planInfo,fetchPlanStatus,fetchCompanyData}=useContext(AppContext)
    const [showUpgrade,setShowUpgrade]=useState(false)
    //logout 
    const logout=()=>{
        setCompanyToken(null)
        localStorage.removeItem('companyToken')
        setCompanyData(null)
        navigate('/')


    }
    useEffect(()=>{
        if(companyData){
            navigate('/dashboard/manage-jobs')
        }

    },[companyData])
  return (
    <div className='min-h-screen'>
        {/* navbar for recruiter panel */}
        <div className='shadow py-4'>
            <div className='px-5 flex justify-between items-center'>
                <img onClick={e=>navigate('/')} className='max-sm:w-32 cursor-pointer' src={assets.logo} alt="" />
                {companyData &&(
                    <div className='flex items-center gap-3'>
                    <span className={`text-xs px-2 py-1 rounded ${companyData.plan==='pro' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{companyData.plan==='pro' ? 'Pro' : 'Free'}</span>
                    {companyData.plan!=='pro' && (
                      <button onClick={()=>setShowUpgrade(true)} className='text-xs bg-blue-600 text-white px-3 py-1.5 rounded'>Upgrade</button>
                    )}
                    {planInfo?.role==='company' && (
                      <span className='text-xs text-gray-500 max-sm:hidden'>{planInfo.used}/{planInfo.limit} jobs</span>
                    )}
                    
                    <p className='max-sm:hidden'>Welcome, {companyData.name}</p>
                    <div className='relative group'>
                        <img className='w-8 border rounded-full' src={companyData.image} alt="" />
                        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
                            <ul className='list-none m-0 p-2 bg-white rounded-md border text-sm'>
                                <li onClick={logout} className='py-1 px-2 cursor-pointer pr-10'>Logout</li>
                            </ul>
                        </div>
                    </div>
                </div>
                )}
                
            </div>
        </div>
        <div className='flex items-start'>

            {/* left sidebar */}
            <div className='inline-block min-h-screen border-r-2'>
                <ul className='flex flex-col items-start pt-5 text-gray-800'>
                    <NavLink className={({isActive})=>` flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/add-job'}>
                        <img className='min-w-4' src={assets.add_icon} alt="" />
                        <p className='max-sm:hidden'>Add Job</p>
                    </NavLink>
                    <NavLink className={({isActive})=>` flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/manage-jobs'}>
                        <img className='min-w-4' src={assets.home_icon} alt="" />
                        <p className='max-sm:hidden'>Manage Job</p>
                    </NavLink>
                    <NavLink className={({isActive})=>` flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/view-applications'}>
                        <img className='min-w-4' src={assets.person_tick_icon} alt="" />
                        <p className='max-sm:hidden'>View Applications</p>
                    </NavLink>
                </ul>
            </div>
            <div className='flex-1 h-full p-2 sm:p-5'>
                <Outlet/>
            </div>
        </div>
        {showUpgrade && (
          <UpgradeModal
            role="company"
            backendUrl={backendUrl}
            getHeaders={async()=>({token:companyToken})}
            used={planInfo?.used}
            limit={planInfo?.limit ?? 5}
            onUpgraded={()=>{ fetchCompanyData?.(); fetchPlanStatus?.(); }}
            onClose={()=>setShowUpgrade(false)}
          />
        )}
    </div>
  )
}

export default Dashboard