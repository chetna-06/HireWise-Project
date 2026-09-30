import React, { useContext } from 'react'
import { Route,Routes } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import Pricing from './pages/Pricing'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminGuard from './components/AdminGuard'
import AdminOverview from './pages/AdminOverview'
import AdminUsers from './pages/AdminUsers'
import AdminRecruiters from './pages/AdminRecruiters'
import AdminJobs from './pages/AdminJobs'
import AdminApplications from './pages/AdminApplications'
import AdminSubscriptions from './pages/AdminSubscriptions'
import Blocked from './pages/Blocked'
import UserBlockedGuard from './components/UserBlockedGuard'
import 'quill/dist/quill.snow.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const {showRecruiterLogin,companyToken}=useContext(AppContext)
  return (
    <div>
      { showRecruiterLogin && <RecruiterLogin/>}
      <ToastContainer />
      <Routes>
        <Route path='/blocked' element={<Blocked/>}></Route>
        <Route element={<UserBlockedGuard/>}>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/apply-job/:id' element={<ApplyJob/>}></Route>
          <Route path='/applications' element={<Applications/>}></Route>
        </Route>
        <Route path='/pricing' element={<Pricing/>}></Route>
        <Route path='/admin/login' element={<AdminLogin/>}></Route>
        <Route element={<AdminGuard/>}>
          <Route path='/admin' element={<AdminDashboard/>}>
            <Route path='overview' element={<AdminOverview/>}></Route>
            <Route path='users' element={<AdminUsers/>}></Route>
            <Route path='recruiters' element={<AdminRecruiters/>}></Route>
            <Route path='jobs' element={<AdminJobs/>}></Route>
            <Route path='applications' element={<AdminApplications/>}></Route>
            <Route path='subscriptions' element={<AdminSubscriptions/>}></Route>
          </Route>
        </Route>
        <Route path='/dashboard' element={<Dashboard/>}>
        {companyToken?<>
         <Route path='add-job' element={<AddJob/>}></Route>
        <Route path='manage-jobs' element={<ManageJobs/>}></Route>
        <Route path='view-applications' element={<ViewApplications/>}></Route>
        </>:null
        }
       
        </Route>
      </Routes>
    </div>
  )
}

export default App