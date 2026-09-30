import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { AppContext } from '../context/AppContext'

const Blocked = () => {
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { setUserData, setUserBlocked } = useContext(AppContext)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch { /* ignore */ }
    setUserData(null)
    setUserBlocked(false)
    navigate('/')
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <div className='w-full max-w-md bg-white border rounded-xl p-8 shadow text-center'>
        <div className='mx-auto w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl font-bold'>!</div>
        <h1 className='mt-4 text-2xl font-bold'>You are blocked</h1>
        <p className='mt-2 text-sm text-gray-600'>
          Your account has been blocked by the admin for violating platform policies.
          You can't apply for jobs or access your applications.
        </p>
        <p className='mt-2 text-sm text-gray-600'>
          Think this is a mistake? Contact support.
        </p>
        <button onClick={handleSignOut} className='mt-6 w-full bg-black text-white py-2 rounded'>
          Sign out & go home
        </button>
      </div>
    </div>
  )
}

export default Blocked
