// Lazy loader for Razorpay Checkout.js (ported from HealthBridge web/src/lib/razorpay.ts)
let razorpayPromise;

export function loadRazorpay() {
  if (!razorpayPromise) {
    razorpayPromise = new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        razorpayPromise = undefined;
        reject(new Error('Unable to load payment script'));
      };
      document.body.appendChild(script);
    });
  }
  return razorpayPromise;
}
