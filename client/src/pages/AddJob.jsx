import React, { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets'
import axios from 'axios'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import UpgradeModal from '../components/UpgradeModal'

const AddJob = () => {
    const [title,setTitle]=useState('')
    const [location,setLocation]=useState('Bangalore')
    const [category,setCategory]=useState('Programming')
    const [level,setLevel]=useState('Beginner Level')
    const [salary,setSalary]=useState(0)
    const [showUpgrade,setShowUpgrade]=useState(false)
    const [limitInfo,setLimitInfo]=useState(null)
    const editorRef=useRef(null)
    const quillRef=useRef(null)
    const {backendUrl,companyToken,fetchPlanStatus,planInfo,fetchCompanyData}=useContext(AppContext)

    const onSubmitHandler=async(e)=>{
        e.preventDefault()
        try{
            const description=quillRef.current.root.innerHTML
            const {data}=await axios.post(backendUrl+'/api/company/post-job',
                {title,description,location,salary,category,level},
                {headers:{token:companyToken}}
            )
            if(data.success){
                toast.success(data.message || 'Job posted')
                setTitle('')
                setSalary(0)
                quillRef.current.root.innerHTML=""
                fetchPlanStatus?.()
            }
            else{
                toast.error(data.message)
            }
        }
        catch(error){
            const payload=error.response?.data
            if(error.response?.status===402 || payload?.code==='LIMIT_EXCEEDED'){
                setLimitInfo(payload)
                setShowUpgrade(true)
                toast.warn(payload?.message || 'Free limit reached. Upgrade to Pro.')
            } else {
                toast.error(payload?.message || error.message)
            }
        }
    }

    useEffect(()=>{
        //initiate quill
        if(!quillRef.current && editorRef.current){
            quillRef.current=new Quill(editorRef.current,{
                theme:'snow'
            })
        }
    },[])

  return (
    <>
    <div className='container p-4 flex flex-col w-full items-start gap-3'>
        <div className='w-full max-w-lg rounded-lg bg-gray-50 border px-3 py-2 text-sm text-gray-600'>
          {planInfo?.role==='company' ? (
            <span>Job posts: <b>{planInfo.used}/{planInfo.limit}</b> {planInfo.plan==='pro' ? '(Pro — unlimited)' : '(Free)'} {planInfo.plan!=='pro' && <button type="button" onClick={()=>setShowUpgrade(true)} className='ml-2 text-blue-600 underline'>Upgrade</button>}</span>
          ) : (
            <span>Free plan: 5 job posts. Upgrade to Pro for unlimited posts. <button type="button" onClick={()=>setShowUpgrade(true)} className='ml-1 text-blue-600 underline'>Upgrade</button></span>
          )}
        </div>
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div className='w-full'>
            <p className='mb-2'>Job Title</p>
            <input className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded' type="text" placeholder='Type here' onChange={e=>setTitle(e.target.value)} value={title} required/>
        </div>
        <div className='w-full max-w-lg '>
            <p className='my-2'>Job Description</p>
            <div ref={editorRef}>

            </div>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
            <div>
                <p className='mb-2'>Job Category</p>
                <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setCategory(e.target.value)}>
                    {JobCategories.map((category,index)=>(
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
            </div>
             <div>
                <p className='mb-2'>Job Location</p>
                <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setLocation(e.target.value)}>
                    {JobLocations.map((location,index)=>(
                        <option key={index} value={location}>{location}</option>
                    ))}
                </select>
            </div>
             <div>
                <p className='mb-2'>Job Level</p>
                <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setLevel(e.target.value)}>
                   <option value="Beginner Level">Beginner Level</option>
                   <option value="Intermediate Level">Intermediate Level</option>
                   <option value="Senior Level">Senior Level</option>
                </select>
            </div>
        </div>
        <div>
            <p className='mb-2'>Job Salary</p>
            <input min={0} className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]' onChange={e=>setSalary(e.target.value)} type="Number" placeholder='2500' />
        </div>
        <button className='w-28 py-3 mt-4 bg-black text-white rounded'>ADD</button>
    </form>
    </div>
    {showUpgrade && (
      <UpgradeModal
        role="company"
        backendUrl={backendUrl}
        getHeaders={async()=>({token:companyToken})}
        used={limitInfo?.used ?? planInfo?.used}
        limit={limitInfo?.limit ?? planInfo?.limit ?? 5}
        onUpgraded={()=>{ fetchPlanStatus?.(); fetchCompanyData?.(); }}
        onClose={()=>{ setShowUpgrade(false); setLimitInfo(null); }}
      />
    )}
    </>
  )
}

export default AddJob