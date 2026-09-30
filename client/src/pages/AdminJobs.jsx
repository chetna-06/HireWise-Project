import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const AdminJobs = () => {
  const { backendUrl, adminToken } = useContext(AppContext)
  const [jobs, setJobs] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [total, setTotal] = useState(0)
  const [editing, setEditing] = useState(null)
  const headers = { admintoken: adminToken }

  const load = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/jobs', { headers, params: { q, status: status || undefined, limit: 20 } })
      if (data.success) { setJobs(data.jobs); setTotal(data.total) }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => { if (adminToken) load() }, [adminToken])

  const setStatusOf = async (job, next) => {
    try {
      const { data } = await axios.patch(backendUrl + `/api/admin/jobs/${job._id}/status`, { status: next }, { headers })
      if (data.success) { toast.success(`Job ${next}`); load() }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}"?`)) return
    try {
      const { data } = await axios.delete(backendUrl + `/api/admin/jobs/${job._id}`, { headers })
      if (data.success) { toast.success(data.message); load() }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const saveEdit = async () => {
    try {
      const { data } = await axios.put(backendUrl + `/api/admin/jobs/${editing._id}`, {
        title: editing.title, location: editing.location, category: editing.category,
        level: editing.level, salary: Number(editing.salary), visible: editing.visible,
      }, { headers })
      if (data.success) { toast.success('Job updated'); setEditing(null); load() }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center flex-wrap gap-2'>
        <h1 className='text-2xl font-bold'>Jobs ({total})</h1>
        <div className='flex gap-2'>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder='Search title' className='border px-3 py-1.5 rounded text-sm' />
          <select value={status} onChange={e => setStatus(e.target.value)} className='border px-3 py-1.5 rounded text-sm'>
            <option value=''>All</option>
            <option value='approved'>Approved</option>
            <option value='pending'>Pending</option>
            <option value='rejected'>Rejected</option>
          </select>
          <button onClick={load} className='bg-black text-white px-4 py-1.5 rounded text-sm'>Filter</button>
        </div>
      </div>
      <div className='mt-4 bg-white border rounded-xl overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead><tr className='text-left border-b'>
            <th className='p-3'>Title</th><th className='p-3'>Company</th><th className='p-3'>Status</th>
            <th className='p-3'>Visible</th><th className='p-3'>Actions</th>
          </tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j._id} className='border-b'>
                <td className='p-3'>{j.title}</td>
                <td className='p-3'>{j.companyId?.name || '-'}</td>
                <td className='p-3'>{j.status}</td>
                <td className='p-3'>{j.visible ? 'Yes' : 'No'}</td>
                <td className='p-3 flex flex-wrap gap-2'>
                  <button onClick={() => setStatusOf(j, 'approved')} className='border px-2 py-1 rounded'>Approve</button>
                  <button onClick={() => setStatusOf(j, 'rejected')} className='border px-2 py-1 rounded'>Reject</button>
                  <button onClick={() => setEditing({ ...j })} className='border px-2 py-1 rounded'>Edit</button>
                  <button onClick={() => remove(j)} className='border border-red-300 text-red-600 px-2 py-1 rounded'>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl p-5 w-full max-w-md flex flex-col gap-2'>
            <h2 className='font-bold'>Edit job</h2>
            <input className='border px-3 py-2 rounded' value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            <input className='border px-3 py-2 rounded' value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} />
            <input className='border px-3 py-2 rounded' value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} />
            <input className='border px-3 py-2 rounded' value={editing.salary} type='number' onChange={e => setEditing({ ...editing, salary: e.target.value })} />
            <label className='text-sm flex items-center gap-2'>
              <input type='checkbox' checked={!!editing.visible} onChange={e => setEditing({ ...editing, visible: e.target.checked })} /> Visible
            </label>
            <div className='flex gap-2 mt-2'>
              <button onClick={() => setEditing(null)} className='flex-1 border py-2 rounded'>Cancel</button>
              <button onClick={saveEdit} className='flex-1 bg-black text-white py-2 rounded'>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminJobs
