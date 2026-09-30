import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const AdminApplications = () => {
  const { backendUrl, adminToken } = useContext(AppContext)
  const [apps, setApps] = useState([])
  const [total, setTotal] = useState(0)
  const [bursts, setBursts] = useState([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/admin/applications', {
          headers: { admintoken: adminToken },
          params: { status: status || undefined, limit: 30 },
        })
        if (data.success) { setApps(data.applications); setTotal(data.total); setBursts(data.suspiciousBursts || []) }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      }
    }
    if (adminToken) load()
  }, [adminToken, status])

  return (
    <div>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Applications ({total})</h1>
        <select value={status} onChange={e => setStatus(e.target.value)} className='border px-3 py-1.5 rounded text-sm'>
          <option value=''>All statuses</option>
          <option value='Pending'>Pending</option>
          <option value='Accepted'>Accepted</option>
          <option value='Rejected'>Rejected</option>
        </select>
      </div>
      {bursts.length > 0 && (
        <div className='mt-3 bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-sm'>
          Unusual activity: {bursts.length} user(s) applied 10+ times in the last hour.
        </div>
      )}
      <div className='mt-4 bg-white border rounded-xl overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead><tr className='text-left border-b'>
            <th className='p-3'>Seeker</th><th className='p-3'>Job</th><th className='p-3'>Recruiter</th><th className='p-3'>Status</th><th className='p-3'>Date</th>
          </tr></thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a._id} className='border-b'>
                <td className='p-3'>{a.userId?.name} ({a.userId?.email})</td>
                <td className='p-3'>{a.jobId?.title}</td>
                <td className='p-3'>{a.companyId?.name}</td>
                <td className='p-3'>{a.status}</td>
                <td className='p-3'>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminApplications
