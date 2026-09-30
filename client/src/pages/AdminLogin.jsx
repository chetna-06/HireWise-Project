import React, { useContext, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const inputCls = 'w-full px-3 py-2 border-2 border-gray-300 rounded'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { backendUrl, setAdminToken, fetchAdminData } = useContext(AppContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
      if (data.success) {
        setAdminToken(data.token)
        localStorage.setItem('adminToken', data.token)
        await fetchAdminData()
        toast.success('Welcome, Admin')
        navigate('/admin/overview')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <form onSubmit={submit} className='w-full max-w-sm bg-white border rounded-xl p-6 shadow'>
        <h1 className='text-2xl font-bold'>HireWise Admin</h1>
        <p className='text-sm text-gray-500 mt-1'>Separate email/password login for platform admins.</p>
        <div className='mt-4 flex flex-col gap-3'>
          <div>
            <p className='mb-1 text-sm'>Email</p>
            <input className={inputCls} type='email' value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <p className='mb-1 text-sm'>Password</p>
            <input className={inputCls} type='password' value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className='mt-2 bg-black text-white py-2 rounded disabled:opacity-60'>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminLogin
