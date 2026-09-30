import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadRazorpay } from '../lib/razorpay';

// Shared Pro-upgrade checkout used by both recruiters (companyToken) and seekers (Clerk token).
// Props: role 'company' | 'user', backendUrl, getHeaders: async () => headers object,
// onUpgraded: () => void, onClose: () => void, used, limit
const UpgradeModal = ({ role, backendUrl, getHeaders, onUpgraded, onClose, used, limit }) => {
  const [loading, setLoading] = useState(false);
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const isCompany = role === 'company';

  const handlePay = async () => {
    try {
      if (!keyId) {
        toast.error('Payments not configured (missing VITE_RAZORPAY_KEY_ID)');
        return;
      }
      setLoading(true);
      const headers = (await getHeaders?.()) || {};
      const { data } = await axios.post(
        `${backendUrl}/api/payments/create-order`,
        {},
        { headers }
      );
      if (!data.success) {
        if (data.code === 'ALREADY_PRO') {
          toast.success('Already on Pro plan');
          onUpgraded?.();
          onClose?.();
          return;
        }
        toast.error(data.message);
        return;
      }

      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        toast.error('Payments not configured');
        return;
      }

      await new Promise((resolve, reject) => {
        const rzp = new Razorpay({
          key: keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'HireWise',
          description: isCompany ? 'Recruiter Pro — unlimited job posts' : 'Seeker Pro — unlimited applications',
          order_id: data.order.id,
          theme: { color: '#2563eb' },
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(
                `${backendUrl}/api/payments/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                { headers: (await getHeaders?.()) || {} }
              );
              if (verifyRes.data.success) {
                toast.success('Upgraded to Pro!');
                onUpgraded?.();
                onClose?.();
                resolve();
              } else {
                reject(new Error(verifyRes.data.message || 'Verification failed'));
              }
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        });
        rzp.on('payment.failed', (resp) => {
          reject(new Error(resp?.error?.description || 'Payment failed'));
        });
        rzp.open();
      });
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold">Upgrade to Pro</h2>
        <p className="mt-2 text-sm text-gray-600">
          {isCompany
            ? `Free plan allows ${limit ?? 5} job posts. You have used ${used ?? '—'}. Upgrade for unlimited job posts.`
            : `Free plan allows ${limit ?? 5} job applications. You have used ${used ?? '—'}. Upgrade for unlimited applications.`}
        </p>
        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm">
          <p className="font-semibold">HireWise Pro — ₹499 one-time</p>
          <ul className="mt-1 list-disc pl-5 text-gray-600">
            <li>{isCompany ? 'Unlimited job posts' : 'Unlimited job applications'}</li>
            <li>Instant activation via Razorpay</li>
            <li>Secure UPI / card / netbanking</li>
          </ul>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded border border-gray-300 py-2 text-gray-700"
          >
            Later
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex-1 rounded bg-blue-600 py-2 text-white disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Pay ₹499'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
