import { createContext, useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();
export const AppContextProvider=(props)=>{
    const backendUrl=import.meta.env.VITE_BACKEND_URL
    const {user}=useUser()
    const {getToken}=useAuth()

    const [searchFilter,setSearchFilter]=useState({
        title:'',
        location:''
    })
    
    const [isSearched,setIsSearched]=useState(false)
    const [jobs,setJobs]=useState([])
    const [showRecruiterLogin,setShowRecruiterLogin]=useState(false)
    const [companyToken,setCompanyToken]=useState(null)
    const [companyData,setCompanyData]=useState(null)
    const [userData,setUserData]=useState(null)
    const [userApplications,setUserApplications]=useState([])
    const [planInfo,setPlanInfo]=useState(null)
    const [adminToken,setAdminToken]=useState(()=>localStorage.getItem('adminToken'))
    const [adminData,setAdminData]=useState(null)


    const fetchJobs=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/jobs')
            if(data.success){
                setJobs(data.jobs)
                console.log(data.jobs);
            }
            else{
                toast.error(data.message)
            }

        }
        catch(error){
            toast.error(error.message)
        }
        
    }
    //to fetch company dtaa
    const fetchCompanyData=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/company/company',{headers:{token:companyToken}})
            if(data.success){
                setCompanyData(data.company)
                console.log(data.company)
            }
            else{
                toast.error(data.message)
            }

        }
        catch(error){
            toast.error(error.message)
        }
    }
    //fetch user data
    const fetchUserData=async()=>{
        try{
            const token=await getToken();
            const {data}=await axios.get(backendUrl+'/api/users/user',
                {headers:{Authorization:`Bearer ${token}`}})
                if(data.success){
                    setUserData(data.user)
                }
                else{
                    if(data.code==='ACCOUNT_BLOCKED'){
                        setUserData(null)
                        toast.error('Your account has been blocked by admin')
                    } else {
                        toast.error(data.message)
                    }
                }
            
        }
        catch(error){
            const payload=error.response?.data
            if(error.response?.status===403 && payload?.code==='ACCOUNT_BLOCKED'){
                setUserData(null)
                toast.error('Your account has been blocked by admin')
            } else {
                toast.error(payload?.message || error.message)
            }
        }

    }
//to fetch user's applied appliction data
const fetchUserApplications=async()=>{
    try{
        const token=await getToken()
        const {data}=await axios.get(backendUrl+'/api/users/applications',
            {headers:{Authorization:`Bearer ${token}`}}
        )
        if(data.success){
            setUserApplications(data.applications)
        }
        else{
            toast.error(data.message)
        }
    }
    catch(error){
        toast.error(error.message)
    }
}

//fetch plan/limit status for current role (company preferred if logged in)
const fetchPlanStatus=async()=>{
    try{
        const headers={}
        if(companyToken){
            headers.token=companyToken
        } else if(user){
            const token=await getToken()
            if(token) headers.Authorization=`Bearer ${token}`
            else return
        } else {
            return
        }
        const {data}=await axios.get(backendUrl+'/api/payments/plan',{headers})
        if(data.success){
            setPlanInfo(data)
        }
    }
    catch(error){
        // Fully silent: plan widget is non-critical, avoid scary "Network Error" logs when backend is down
    }
}

    useEffect(()=>{
        fetchJobs()
        const storedCompanyToken=localStorage.getItem('companyToken')
        if(storedCompanyToken){
            setCompanyToken(storedCompanyToken)
        }
},[])
useEffect(()=>{
    if(companyToken){
        fetchCompanyData()
    }
},[companyToken])

useEffect(()=>{
    if(user){
        fetchUserData()
        fetchUserApplications()
    }
},[user])
useEffect(()=>{
    if(companyToken || user){
        fetchPlanStatus()
    }
},[companyToken,user])
const fetchAdminData=async()=>{
    if(!adminToken) return
    try{
        const {data}=await axios.get(backendUrl+'/api/admin/me',{headers:{admintoken:adminToken}})
        if(data.success) setAdminData(data.admin)
        else { setAdminData(null) }
    }
    catch(error){ setAdminData(null) }
}
const adminLogout=()=>{
    setAdminToken(null)
    setAdminData(null)
    localStorage.removeItem('adminToken')
}
useEffect(()=>{
    if(adminToken){
        localStorage.setItem('adminToken',adminToken)
        fetchAdminData()
    }
},[adminToken])
const value={
        setSearchFilter,searchFilter,
        isSearched,setIsSearched,
        jobs,setJobs,
        showRecruiterLogin,setShowRecruiterLogin,
        companyToken,setCompanyToken,
        companyData,setCompanyData,
        backendUrl,
        userData,setUserData,
        userApplications,setUserApplications,
        fetchUserData,
        fetchUserApplications,
        fetchCompanyData,
        planInfo,setPlanInfo,
        fetchPlanStatus,
        adminToken,setAdminToken,
        adminData,setAdminData,
        fetchAdminData,adminLogout
    }
    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)
}