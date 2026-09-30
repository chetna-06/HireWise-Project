import React, { useContext } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, Briefcase, CreditCard, FileCheck2, LayoutDashboard, Users } from 'lucide-react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useEffect } from 'react'

const sideLink = ({ isActive }) => ` flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { adminData, adminLogout, fetchAdminData, adminToken } = useContext(AppContext)

  const logout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  useEffect(() => {
    if (adminToken && !adminData) fetchAdminData?.()
  }, [adminToken])

  return (
    <div className='min-h-screen'>
      {/* navbar for admin panel — same as recruiter Dashboard */}
      <div className='shadow py-4'>
        <div className='px-5 flex justify-between items-center'>
          <img onClick={() => navigate('/admin/overview')} className='max-sm:w-32 cursor-pointer' src={assets.logo} alt="" />
          {adminData && (
            <div className='flex items-center gap-3'>
              <span className='text-xs px-2 py-1 rounded bg-blue-100 text-blue-700'>Admin</span>
              <p className='max-sm:hidden'>Welcome, {adminData.name || 'Admin'}</p>
              <div className='relative group'>
                <img className='w-8 border rounded-full' src={assets.profile_img} alt="" />
                <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
                  <ul className='list-none m-0 p-2 bg-white rounded-md border text-sm'>
                    <li className='py-1 px-2 pr-10 text-gray-500 max-w-48 truncate'>{adminData.email}</li>
                    <li onClick={logout} className='py-1 px-2 cursor-pointer pr-10'>Logout</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='flex items-start'>

        {/* left sidebar — same pattern as recruiter Dashboard */}
        <div className='inline-block min-h-screen border-r-2'>
          <ul className='flex flex-col items-start pt-5 text-gray-800'>
            <NavLink className={sideLink} to='/admin/overview'>
              <LayoutDashboard className='min-w-4' size={18} />
              <p className='max-sm:hidden'>Overview</p>
            </NavLink>
            <NavLink className={sideLink} to='/admin/users'>
              <Users className='min-w-4' size={18} />
              <p className='max-sm:hidden'>Users</p>
            </NavLink>
            <NavLink className={sideLink} to='/admin/recruiters'>
              <Building2 className='min-w-4' size={18} />
              <p className='max-sm:hidden'>Recruiters</p>
            </NavLink>
            <NavLink className={sideLink} to='/admin/jobs'>
              <Briefcase className='min-w-4' size={18} />
              <p className='max-sm:hidden'>Jobs</p>
            </NavLink>
            <NavLink className={sideLink} to='/admin/applications'>
              <FileCheck2 className='min-w-4' size={18} />
              <p className='max-sm:hidden'>Applications</p>
            </NavLink>
            <NavLink className={sideLink} to='/admin/subscriptions'>
              <CreditCard className='min-w-4' size={18} />
              <p className='max-sm:hidden'>Subscriptions</p>
            </NavLink>
          </ul>
        </div>
        <div className='flex-1 h-full p-2 sm:p-5'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
