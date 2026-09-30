import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UpgradeModal from '../components/UpgradeModal';
import { AppContext } from '../context/AppContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { backendUrl, companyToken, companyData, userData, fetchCompanyData, fetchUserData, fetchPlanStatus, planInfo } =
    useContext(AppContext);
  const [showModal, setShowModal] = useState(null); // 'company' | 'user' | null

  const companyHeaders = async () => ({ token: companyToken });
  const userHeaders = async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-center text-3xl font-bold">Simple pricing, upgrade when you need more</h1>
        <p className="mt-2 text-center text-gray-600">
          Free: 5 job posts for recruiters, 5 applications for seekers. Pro unlocks unlimited.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Recruiter Pro</h2>
            <p className="mt-1 text-3xl font-bold">₹499 <span className="text-sm font-normal text-gray-500">one-time</span></p>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-600">
              <li>Unlimited job posts (free: 5)</li>
              <li>Manage + track all applicants</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Status: {companyData ? `${companyData.plan || 'free'} plan` : 'login as recruiter to upgrade'}
              {planInfo?.role === 'company' ? ` • ${planInfo.used}/${planInfo.limit} used` : ''}
            </p>
            <button
              onClick={() => (companyToken ? setShowModal('company') : navigate('/dashboard/manage-jobs'))}
              className="mt-4 w-full rounded bg-black py-2 text-white"
            >
              {companyData?.plan === 'pro' ? 'Already Pro' : 'Upgrade recruiter plan'}
            </button>
          </div>
          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">Seeker Pro</h2>
            <p className="mt-1 text-3xl font-bold">₹499 <span className="text-sm font-normal text-gray-500">one-time</span></p>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-600">
              <li>Unlimited applications (free: 5)</li>
              <li>Apply without interruption</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Status: {userData ? `${userData.plan || 'free'} plan` : 'login as seeker to upgrade'}
              {planInfo?.role === 'user' ? ` • ${planInfo.used}/${planInfo.limit} used` : ''}
            </p>
            <button
              onClick={() => (userData ? setShowModal('user') : navigate('/'))}
              className="mt-4 w-full rounded bg-blue-600 py-2 text-white"
            >
              {userData?.plan === 'pro' ? 'Already Pro' : 'Upgrade seeker plan'}
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <UpgradeModal
          role={showModal}
          backendUrl={backendUrl}
          getHeaders={showModal === 'company' ? companyHeaders : userHeaders}
          used={planInfo?.used}
          limit={planInfo?.limit}
          onUpgraded={() => {
            if (showModal === 'company') fetchCompanyData?.();
            else fetchUserData?.();
            fetchPlanStatus?.();
          }}
          onClose={() => setShowModal(null)}
        />
      )}
      <Footer />
    </>
  );
};

export default Pricing;
