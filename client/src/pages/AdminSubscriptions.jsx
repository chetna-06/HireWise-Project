import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const AdminSubscriptions = () => {
  const { backendUrl, adminToken } = useContext(AppContext)
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/admin/subscriptions', {
          headers: { admintoken: adminToken },
          params: { limit: 30 },
        })
        if (data.success) setData(data)
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      }
    }
    if (adminToken) load()
  }, [adminToken])

  if (!data) return <p>Loading...</p>
  return (
    <div>
      <h1 className='text-2xl font-bold'>Subscriptions</h1>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
        <div className='bg-white border rounded-xl p-4'><p className='text-sm text-gray-500'>Free recruiters</p><p className='text-2xl font-bold'>{data.summary.freeCompanies}</p></div>
        <div className='bg-white border rounded-xl p-4'><p className='text-sm text-gray-500'>Pro recruiters</p><p className='text-2xl font-bold'>{data.summary.proCompanies}</p></div>
        <div className='bg-white border rounded-xl p-4'><p className='text-sm text-gray-500'>Free seekers</p><p className='text-2xl font-bold'>{data.summary.freeUsers}</p></div>
        <div className='bg-white border rounded-xl p-4'><p className='text-sm text-gray-500'>Pro seekers</p><p className='text-2xl font-bold'>{data.summary.proUsers}</p></div>
      </div>
      <p className='mt-3 text-sm text-gray-500'>Free limits: {data.summary.jobLimit} posts / {data.summary.applicationLimit} applications.</p>
      <div className='mt-4 bg-white border rounded-xl overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead><tr className='text-left border-b'>
            <th className='p-3'>Order</th><th className='p-3'>Role</th><th className='p-3'>Amount</th><th className='p-3'>Status</th><th className='p-3'>Date</th>
          </tr></thead>
          <tbody>
            {data.payments.map((p) => (
              <tr key={p._id} className='border-b'>
                <td className='p-3'>{p.orderId}</td>
                <td className='p-3'>{p.role}</td>
                <td className='p-3'>₹{(p.amount / 100).toFixed(0)}</td>
                <td className='p-3'>{p.status}</td>
                <td className='p-3'>{p.date ? new Date(p.date).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminSubscriptions
