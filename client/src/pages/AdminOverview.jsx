import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Card = ({ label, value }) => (
  <div className='bg-white border rounded-xl p-4'>
    <p className='text-sm text-gray-500'>{label}</p>
    <p className='text-2xl font-bold mt-1'>{value}</p>
  </div>
)

const AdminOverview = () => {
  const { backendUrl, adminToken } = useContext(AppContext)
  const [data, setData] = useState(null)
  const headers = { admintoken: adminToken }

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/admin/overview', { headers })
        if (data.success) setData(data)
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      }
    }
    if (adminToken) load()
  }, [adminToken])

  if (!data) return <p>Loading...</p>
  const s = data.stats
  return (
    <div>
      <h1 className='text-2xl font-bold'>Platform overview</h1>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
        <Card label='Users' value={s.users} />
        <Card label='Recruiters' value={s.companies} />
        <Card label='Jobs' value={s.jobs} />
        <Card label='Applications' value={s.applications} />
        <Card label='Paid subscriptions' value={s.paidSubscriptions} />
        <Card label='Pro recruiters' value={s.proCompanies} />
        <Card label='Pro seekers' value={s.proUsers} />
        <Card label='Pending jobs' value={s.pendingJobs} />
        <Card label='Blocked users' value={s.blockedUsers} />
        <Card label='Blocked recruiters' value={s.blockedCompanies} />
      </div>
      <div className='mt-6 bg-white border rounded-xl p-4'>
        <h2 className='font-semibold'>Applications by status</h2>
        <div className='mt-2 flex gap-3 text-sm'>
          {data.applicationsByStatus.map((r) => (
            <span key={r._id} className='bg-gray-100 px-3 py-1 rounded'>{r._id}: {r.count}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminOverview
