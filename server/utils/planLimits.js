// Centralised free-plan limits + pricing (paise/INR).
// Recruiter: 5 job posts free. Seeker: 5 applications free.
export const FREE_JOB_POST_LIMIT = 5
export const FREE_APPLICATION_LIMIT = 5

// One-time Pro upgrade price. Override with env PRO_PLAN_PRICE_INR.
export const PRO_PLAN_PRICE_INR = Number(process.env.PRO_PLAN_PRICE_INR || 499)
export const PRO_PLAN_AMOUNT_PAISE = Math.round(PRO_PLAN_PRICE_INR * 100)

export const isPro = (doc) => doc?.plan === 'pro'
