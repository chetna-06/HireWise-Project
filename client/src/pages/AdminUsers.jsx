import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const AdminUsers = () => {
  const { backendUrl, adminToken } = useContext(AppContext)
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [total, setTotal] = useState(0)
  const headers = { admintoken: adminToken }

  const load = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/users', { headers, params: { q, limit: 20 } })
      if (data.success) { setUsers(data.users); setTotal(data.total) }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => { if (adminToken) load() }, [adminToken])

  const toggleBlock = async (u) => {
    try {
      const { data } = await axios.patch(backendUrl + `/api/admin/users/${u._id}/block`, { blocked: !u.isBlocked }, { headers })
      if (data.success) { toast.success(data.message); load() }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.email}? This also deletes their applications.`)) return
    try {
      const { data } = await axios.delete(backendUrl + `/api/admin/users/${u._id}`, { headers })
      if (data.success) { toast.success(data.message); load() }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Users ({total})</h1>
        <div className='flex gap-2'>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder='Search name/email' className='border px-3 py-1.5 rounded text-sm' />
          <button onClick={load} className='bg-black text-white px-4 py-1.5 rounded text-sm'>Search</button>
        </div>
      </div>
      <div className='mt-4 bg-white border rounded-xl overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead><tr className='text-left border-b'>
            <th className='p-3'>Name</th><th className='p-3'>Email</th><th className='p-3'>Plan</th>
            <th className='p-3'>Applications</th><th className='p-3'>Status</th><th className='p-3'>Actions</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className='border-b'>
                <td className='p-3'>{u.name}</td>
                <td className='p-3'>{u.email}</td>
                <td className='p-3'>{u.plan}</td>
                <td className='p-3'>{u.applications}/{u.applicationLimit}</td>
                <td className='p-3'>{u.isBlocked ? <span className='bg-red-100 text-red-700 px-2 py-1 rounded'>Blocked</span> : <span className='bg-green-100 text-green-700 px-2 py-1 rounded'>Active</span>}</td>
                <td className='p-3 flex gap-2'>
                  <button onClick={() => toggleBlock(u)} className='border px-3 py-1 rounded'>{u.isBlocked ? 'Activate' : 'Block'}</button>
                  <button onClick={() => remove(u)} className='border border-red-300 text-red-600 px-3 py-1 rounded'>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsers
