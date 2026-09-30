import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const AdminRecruiters = () => {
  const { backendUrl, adminToken } = useContext(AppContext)
  const [companies, setCompanies] = useState([])
  const [q, setQ] = useState('')
  const [total, setTotal] = useState(0)
  const headers = { admintoken: adminToken }

  const load = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/companies', { headers, params: { q, limit: 20 } })
      if (data.success) { setCompanies(data.companies); setTotal(data.total) }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => { if (adminToken) load() }, [adminToken])

  const toggleBlock = async (c) => {
    try {
      const { data } = await axios.patch(backendUrl + `/api/admin/companies/${c._id}/block`, { blocked: !c.isBlocked }, { headers })
      if (data.success) { toast.success(data.message); load() }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const toggleVerify = async (c) => {
    try {
      const { data } = await axios.patch(backendUrl + `/api/admin/companies/${c._id}/verify`, { verified: !c.isVerified }, { headers })
      if (data.success) { toast.success(c.isVerified ? 'Unverified' : 'Verified'); load() }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.email}? Jobs + applications will be deleted.`)) return
    try {
      const { data } = await axios.delete(backendUrl + `/api/admin/companies/${c._id}`, { headers })
      if (data.success) { toast.success(data.message); load() }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Recruiters ({total})</h1>
        <div className='flex gap-2'>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder='Search name/email' className='border px-3 py-1.5 rounded text-sm' />
          <button onClick={load} className='bg-black text-white px-4 py-1.5 rounded text-sm'>Search</button>
        </div>
      </div>
      <div className='mt-4 bg-white border rounded-xl overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead><tr className='text-left border-b'>
            <th className='p-3'>Company</th><th className='p-3'>Email</th><th className='p-3'>Plan</th>
            <th className='p-3'>Jobs</th><th className='p-3'>Verified</th><th className='p-3'>Status</th><th className='p-3'>Actions</th>
          </tr></thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c._id} className='border-b'>
                <td className='p-3'>{c.name}</td>
                <td className='p-3'>{c.email}</td>
                <td className='p-3'>{c.plan}</td>
                <td className='p-3'>{c.jobs}/{c.jobLimit}</td>
                <td className='p-3'>{c.isVerified ? 'Yes' : 'No'}</td>
                <td className='p-3'>{c.isBlocked ? 'Blocked' : 'Active'}</td>
                <td className='p-3 flex flex-wrap gap-2'>
                  <button onClick={() => toggleVerify(c)} className='border px-3 py-1 rounded'>{c.isVerified ? 'Unverify' : 'Verify'}</button>
                  <button onClick={() => toggleBlock(c)} className='border px-3 py-1 rounded'>{c.isBlocked ? 'Activate' : 'Block'}</button>
                  <button onClick={() => remove(c)} className='border border-red-300 text-red-600 px-3 py-1 rounded'>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminRecruiters
