import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../../firebase'; // makes sure Firebase is initialised before getAuth()
import balaiLogo from '../../assets/BalaiLogo.svg';
 
const GOLD = "#B97216";
 
const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
 
const inputBase =
  "w-full rounded-2xl bg-[#F7F7F7] px-4 py-3.5 text-base text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#C98A1E]/40";
 
const emptyForm = {
  title: "",
  discountType: "percentage", // "percentage" | "fixed"
  discountValue: "",
  startDate: "",
  endDate: "",
};
 
const PromoCreation = ({ onSave }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
 
  // Login check: if nobody is signed in, go back to the login page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (!user) navigate('/admin', { replace: true });
      else setChecking(false);
    });
    return unsubscribe;
  }, [navigate]);
 
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EAEAEA] text-sm text-neutral-500">
        Loading...
      </div>
    );
  }
 
  const today = new Date();
  const weekday = today.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
  const monthDay = today.toLocaleString("en-US", { month: "long", day: "numeric" });
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaved(false);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };
 
  const validate = () => {
    const next = {};
    const value = Number(form.discountValue);
 
    if (!form.title.trim()) next.title = "Give the promo a title.";
    if (!form.discountValue || value <= 0) next.discountValue = "Enter a value above 0.";
    else if (form.discountType === "percentage" && value > 100) next.discountValue = "Percentage can't exceed 100.";
    if (!form.startDate) next.startDate = "Pick a start date.";
    if (!form.endDate) next.endDate = "Pick an end date.";
    else if (form.startDate && form.endDate < form.startDate) next.endDate = "End date can't be before the start date.";
 
    setErrors(next);
    return Object.keys(next).length === 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
 
    const promo = {
      title: form.title.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      startDate: form.startDate,
      endDate: form.endDate,
      autoApply: true, // applied automatically at checkout
    };
 
    // Hook for saving (Firestore etc.). For now it just logs the promo.
    if (onSave) await onSave(promo);
    else console.log("New promo:", promo);
 
    setSaved(true);
    setForm(emptyForm);
  };
 
  const unit = form.discountType === "percentage" ? "%" : "₱";
 
  return (
    <div className="min-h-screen bg-[#EAEAEA] font-['Poppins',sans-serif] text-neutral-900">
      <div className="mx-auto w-full max-w-md px-6 pb-12 pt-6">
 
        {/* Top bar */}
        <header className="flex items-start justify-between">
          <button type="button" onClick={() => navigate('/admin-dashboard')} aria-label="Back to dashboard">
            <img src={balaiLogo} alt="Balai 88 Logo" className="h-10 w-auto object-contain" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm"
            style={{ backgroundColor: GOLD }}
          >
            <BellIcon />
          </button>
        </header>
 
        <h1 className="mt-6 text-4xl font-semibold" style={{ color: GOLD }}>Promotions</h1>
 
        {/* Daily schedule */}
        <p className="mt-6 text-[11px] text-neutral-500">Daily Schedule</p>
        <p className="mt-1 text-2xl" style={{ color: GOLD }}>
          <span className="font-semibold">{weekday}</span> {monthDay}
        </p>
 
        <form onSubmit={handleSubmit} noValidate>
 
          {/* Promo title */}
          <div className="mt-8">
            <label htmlFor="title" className="text-[11px] text-neutral-500">Promo Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Christmas Promo"
              className={`${inputBase} mt-2`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>
 
          {/* Discount details */}
          <div className="mt-8">
            <p className="text-[11px] text-neutral-500">Discount Details</p>
            <div className="mt-1 flex items-center justify-between">
              <h2 className="text-2xl" style={{ color: GOLD }}>
                Offer <span className="font-semibold italic">Setup</span>
              </h2>
              <span
                className="rounded-full border px-3 py-1 text-[10px]"
                style={{ color: GOLD, borderColor: GOLD, backgroundColor: "#F1DDB8" }}
              >
                Auto-applied at Checkout
              </span>
            </div>
 
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="discountType" className="text-[10px] text-neutral-500">Discount Type</label>
                <div className="relative mt-1">
                  <select
                    id="discountType"
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className={`${inputBase} appearance-none pr-10`}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                  <span
                    className="pointer-events-none absolute right-4 top-1/2 h-0 w-0 -translate-y-1/2 border-x-[5px] border-t-[6px] border-x-transparent"
                    style={{ borderTopColor: GOLD }}
                    aria-hidden="true"
                  />
                </div>
              </div>
 
              <div>
                <label htmlFor="discountValue" className="text-[10px] text-neutral-500">Discount Value</label>
                <div className="relative mt-1">
                  <input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={form.discountValue}
                    onChange={handleChange}
                    placeholder="10"
                    className={`${inputBase} pr-10`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                    {unit}
                  </span>
                </div>
              </div>
            </div>
            {errors.discountValue && <p className="mt-1 text-xs text-red-600">{errors.discountValue}</p>}
          </div>
 
          {/* Schedule period */}
          <div className="mt-8">
            <p className="text-[11px] text-neutral-500">Schedule Period</p>
            <h2 className="mt-1 text-2xl" style={{ color: GOLD }}>
              Active <span className="font-semibold italic">Dates</span>
            </h2>
 
            <div className="mt-3 grid grid-cols-2 gap-4">
              {[
                { id: "startDate", label: "Start Date" },
                { id: "endDate", label: "End Date" },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="text-[10px] text-neutral-500">{field.label}</label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: GOLD }}>
                      <CalendarIcon />
                    </span>
                    <input
                      id={field.id}
                      name={field.id}
                      type="date"
                      value={form[field.id]}
                      onChange={handleChange}
                      min={field.id === "endDate" ? form.startDate || undefined : undefined}
                      className={`${inputBase} pl-11 text-sm [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
                    />
                  </div>
                  {errors[field.id] && <p className="mt-1 text-xs text-red-600">{errors[field.id]}</p>}
                </div>
              ))}
            </div>
          </div>
 
          {saved && (
            <p role="status" className="mt-6 rounded-xl border border-green-500 bg-green-50 px-4 py-3 text-sm text-green-700">
              Promo created. It will be applied automatically at checkout during its active dates.
            </p>
          )}
 
          <button
            type="submit"
            className="mt-8 w-full rounded-full py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            style={{ backgroundColor: GOLD }}
          >
            Create Promo
          </button>
        </form>
      </div>
    </div>
  );
};
 
export default PromoCreation;