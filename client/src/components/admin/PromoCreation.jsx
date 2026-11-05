import { useEffect, useState } from 'react';
import { Percent, Bell as LucideBell, Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

// Rendered inside AdminDashboard (like AdminCalendar), so the login check,
// sidebar and notification modal all come from the dashboard shell.

// Firestore collection the promos are saved to. Make this match the collection name in your Firebase console.
const PROMOS_COLLECTION = 'promotions';

const emptyForm = {
  title: '',
  discountType: 'percentage', // "percentage" | "fixed"
  discountValue: '',
  startDate: '',
  endDate: '',
};

const labelClass = 'mb-1.5 block text-[10px] lg:text-xs font-bold uppercase tracking-wider text-gray-400';
const fieldClass =
  'w-full rounded-2xl border border-gray-100 bg-[#F8F9FA] px-4 py-3 lg:py-3.5 text-sm lg:text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#C98A1E] focus:ring-2 focus:ring-[#C98A1E]/20';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatShort = (yyyymmdd) => {
  if (!yyyymmdd) return '—';
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  return `${monthNames[m - 1]} ${d}, ${y}`;
};

const todayStr = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};

const getPromoStatus = (promo) => {
  const today = todayStr();
  if (promo.endDate < today) return { label: 'Ended', className: 'bg-gray-100 text-gray-500 border-gray-200' };
  if (promo.startDate > today) return { label: 'Upcoming', className: 'bg-blue-50 text-blue-600 border-blue-200' };
  return { label: 'Active', className: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
};

export default function PromoCreation({ onOpenNotif, pendingCount = 0 }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Existing promos (live) and delete flow
  const [promos, setPromos] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, PROMOS_COLLECTION),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // newest start date first
        list.sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')));
        setPromos(list);
        setLoadError('');
      },
      (err) => {
        console.error('Loading promos failed:', err);
        setLoadError("Couldn't load the existing promos.");
      }
    );
    return unsubscribe;
  }, []);

  const closeDeleteModal = () => {
    if (deleting) return;
    setPromoToDelete(null);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!promoToDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteDoc(doc(db, PROMOS_COLLECTION, promoToDelete.id));
      setPromoToDelete(null);
    } catch (err) {
      console.error('Deleting promo failed:', err);
      setDeleteError("Couldn't delete the promo. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const isPercent = form.discountType === 'percentage';
  const unit = isPercent ? '%' : '₱';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaved(false);
    setSaveError('');
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const next = {};
    const value = Number(form.discountValue);

    if (!form.title.trim()) next.title = 'Give the promo a title.';
    if (!form.discountValue || value <= 0) next.discountValue = 'Enter a value above 0.';
    else if (isPercent && value > 100) next.discountValue = "Percentage can't exceed 100.";
    if (!form.startDate) next.startDate = 'Pick a start date.';
    if (!form.endDate) next.endDate = 'Pick an end date.';
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
    };

    setSaving(true);
    setSaveError('');
    try {
      await addDoc(collection(db, PROMOS_COLLECTION), promo);
      setSaved(true);
      setForm(emptyForm);
    } catch (err) {
      console.error('Saving promo failed:', err);
      setSaveError("Couldn't save the promo. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const previewBadge = `${isPercent ? '' : '₱'}${form.discountValue || 0}${isPercent ? '%' : ''} OFF`;

  return (
    <div className="w-full bg-[#F8F9FA] font-poppins pb-20 animate-fade-in">

      {/* Delete confirmation modal */}
      {promoToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 animate-fade-in"
          onClick={closeDeleteModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-promo-title"
            className="bg-white rounded-[32px] p-6 lg:p-8 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <Trash2 size={22} />
            </div>
            <h3 id="delete-promo-title" className="text-xl font-bold text-gray-900">Delete this promo?</h3>
            <p className="mt-1 text-sm font-bold text-[#C98A1E] truncate">{promoToDelete.title}</p>
            <p className="mt-3 text-sm text-gray-500 font-medium">
              Guests will no longer get this discount, and its blue dots will disappear from the calendar. This can't be undone.
            </p>

            {deleteError && (
              <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 text-sm font-bold transition-all hover:bg-gray-200 active:scale-95 disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-bold shadow-md transition-all hover:bg-red-600 active:scale-95 disabled:opacity-70"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Responsive Container */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-10 lg:pt-14">

        {/* Header with Notification Bell */}
        <header className="flex items-center justify-end mb-4 lg:mb-8">
          <button
            type="button"
            onClick={onOpenNotif}
            aria-label="Notifications"
            className="relative w-10 h-10 lg:w-12 lg:h-12 bg-[#C98A1E] rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95"
          >
            <LucideBell className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
            {pendingCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 lg:w-3.5 lg:h-3.5 bg-red-500 border-2 border-[#F8F9FA] rounded-full shadow-sm animate-pulse"></span>
            )}
          </button>
        </header>

        {/* Title */}
        <div className="mb-6 lg:mb-10">
          <h2 className="text-[10px] lg:text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Balai 88</h2>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#C98A1E]">Promotions</h1>
        </div>

        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column: Promo form card */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm h-full">

              {/* Offer setup */}
              <div className="flex justify-between items-start gap-3 mb-6 lg:mb-8">
                <div className="min-w-0">
                  <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">New Promo</p>
                  <h3 className="text-xl lg:text-2xl font-bold text-[#C98A1E]">Offer Setup</h3>
                </div>
                <span className="shrink-0 px-3 py-2 rounded-full border border-[#C98A1E] text-[#C98A1E] text-[9px] lg:text-[10px] font-bold uppercase tracking-wider bg-[#C98A1E]/10 text-center leading-tight">
                  Auto-applied at Checkout
                </span>
              </div>

              <div>
                <label htmlFor="title" className={labelClass}>Promo Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Christmas Promo"
                  className={fieldClass}
                />
                {errors.title && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.title}</p>}
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="discountType" className={labelClass}>Discount Type</label>
                  <div className="relative">
                    <select
                      id="discountType"
                      name="discountType"
                      value={form.discountType}
                      onChange={handleChange}
                      className={`${fieldClass} appearance-none pr-10`}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#C98A1E]" size={18} />
                  </div>
                </div>

                <div>
                  <label htmlFor="discountValue" className={labelClass}>Discount Value</label>
                  <div className="relative">
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
                      className={`${fieldClass} pr-10`}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                      {unit}
                    </span>
                  </div>
                  {errors.discountValue && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.discountValue}</p>}
                </div>
              </div>

              {/* Schedule period */}
              <div className="mt-8 lg:mt-10 border-t border-gray-100 pt-6 lg:pt-8">
                <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Schedule Period</p>
                <h3 className="text-xl lg:text-2xl font-bold text-[#C98A1E] mb-5 lg:mb-6">Active Dates</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { id: 'startDate', label: 'Start Date' },
                    { id: 'endDate', label: 'End Date' },
                  ].map((f) => (
                    <div key={f.id}>
                      <label htmlFor={f.id} className={labelClass}>{f.label}</label>
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#C98A1E]" size={18} />
                        <input
                          id={f.id}
                          name={f.id}
                          type="date"
                          value={form[f.id]}
                          onChange={handleChange}
                          min={f.id === 'endDate' ? form.startDate || undefined : undefined}
                          className={`${fieldClass} pl-11 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
                        />
                      </div>
                      {errors[f.id] && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors[f.id]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {saved && (
                <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  Promo created. It will be applied automatically at checkout during its active dates.
                </p>
              )}
              {saveError && (
                <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {saveError}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-8 w-full lg:w-auto lg:px-12 py-3 lg:py-3.5 rounded-full bg-[#C98A1E] text-white text-sm lg:text-base font-bold shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Create Promo'}
              </button>
            </form>
          </div>

          {/* Right Column: Live preview */}
          <div className="lg:col-span-5 xl:col-span-4">
            <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Live Preview</p>
            <h3 className="text-lg lg:text-xl font-medium text-gray-400 mb-4 lg:mb-6">
              <span className="font-bold text-[#C98A1E]">NEW</span> Promo
            </h3>

            <div className="space-y-4">
              <div className="bg-[#FDF3E1] border border-[#F5E1C8] rounded-3xl p-5 lg:p-6 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#F5D8A9] flex items-center justify-center shrink-0 shadow-inner">
                  <Percent size={20} className="text-[#967444]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 lg:mb-1">Active Promo</p>
                  <p className="truncate text-sm lg:text-base font-bold text-gray-900">{form.title.trim() || 'Promo title'}</p>
                </div>
                <span className="shrink-0 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border border-emerald-200 shadow-sm">
                  {previewBadge}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-gray-50">
                <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Dates</p>
                <p className="text-sm lg:text-base font-bold text-gray-900">
                  {formatShort(form.startDate)} <span className="text-gray-400 font-medium">to</span> {formatShort(form.endDate)}
                </p>
                <p className="mt-3 text-xs lg:text-sm text-neutral-500 font-medium">
                  Applied automatically at checkout for stays within these dates.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Manage promos */}
        <section className="mt-10 lg:mt-14">
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm">
            <div className="flex justify-between items-start gap-3 mb-6 lg:mb-8">
              <div className="min-w-0">
                <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Manage</p>
                <h3 className="text-xl lg:text-2xl font-bold text-[#C98A1E]">All Promos</h3>
              </div>
              <span className="shrink-0 px-3 py-2 rounded-full border border-[#C98A1E] text-[#C98A1E] text-[9px] lg:text-[10px] font-bold uppercase tracking-wider bg-[#C98A1E]/10">
                {promos.length} total
              </span>
            </div>

            {loadError && (
              <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {loadError}
              </p>
            )}

            {!loadError && promos.length === 0 ? (
              <p className="text-xs lg:text-sm text-gray-400 text-center py-10 lg:py-12 border-2 border-dashed border-gray-300 rounded-3xl font-medium bg-white/50">
                No promos yet. Create one above.
              </p>
            ) : (
              <ul className="space-y-3">
                {promos.map((promo) => {
                  const status = getPromoStatus(promo);
                  return (
                    <li key={promo.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#F8F9FA] p-4 lg:p-5">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#F5D8A9] flex items-center justify-center shrink-0 shadow-inner">
                        <Percent size={20} className="text-[#967444]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm lg:text-base font-bold text-gray-900">{promo.title}</p>
                        <p className="mt-0.5 text-[10px] lg:text-xs text-neutral-500 font-medium">
                          {formatShort(promo.startDate)} to {formatShort(promo.endDate)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border border-emerald-200">
                            {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₱${promo.discountValue} OFF`}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => { setDeleteError(''); setPromoToDelete(promo); }}
                        aria-label={`Delete ${promo.title}`}
                        className="shrink-0 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center transition-all hover:bg-red-500 hover:text-white active:scale-95"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}