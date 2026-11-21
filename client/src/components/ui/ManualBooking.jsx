import { useState, useEffect } from 'react';
import { User, Mail, Phone, CalendarDays, Users, Check, X, Package, Sparkles, Percent } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper to push the input into view when the mobile keyboard opens
const handleMobileFocus = (e) => {
  if (window.innerWidth < 1024) {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
};

// Same packages and rates as the guest Booking Form
const PACKAGES = [
  { name: 'Beloved', paxRange: '2–4 pax', minPax: 1, maxPax: 4, basePax: 4, bedrooms: '1 Bedroom', nonPeakRate: 5000, peakRate: 6000 },
  { name: 'Bliss', paxRange: '5–6 pax', minPax: 5, maxPax: 6, basePax: 6, bedrooms: '1 Bedroom', nonPeakRate: 6000, peakRate: 7000 },
  { name: 'Bunch', paxRange: '7–12 pax', minPax: 7, maxPax: 12, basePax: 12, bedrooms: '2 Bedrooms', nonPeakRate: 7000, peakRate: 8000 },
  { name: 'Bloom', paxRange: 'Up to 18 pax', minPax: 13, maxPax: 18, basePax: 18, bedrooms: '3 Bedrooms', nonPeakRate: 12000, peakRate: 14000 },
  { name: 'Bond', paxRange: 'Up to 26 pax (Max 30)', minPax: 19, maxPax: 30, basePax: 26, extraHeadFee: 500, bedrooms: '5 Bedrooms (4 AC, 1 Fanned)', nonPeakRate: 14000, peakRate: 18000 },
  { name: 'Bash', paxRange: 'Up to 40 pax', minPax: 31, maxPax: 40, basePax: 40, bedrooms: '7 Bedrooms (6 AC, 1 Fanned)', nonPeakRate: 22000, peakRate: 26000 },
];

const getRecommendedPackageByPax = (pax) => {
  const count = Math.max(1, Math.min(40, Number(pax) || 1));
  return PACKAGES.find((p) => count <= p.maxPax) || PACKAGES[PACKAGES.length - 1];
};

const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

const formatDateForDB = (dateObj) => {
  if (!dateObj) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// How much a promo takes off the subtotal (never below ₱0)
const calcDiscount = (promo, subtotal) => {
  const value = Number(promo.discountValue) || 0;
  const raw = promo.discountType === 'percentage' ? (subtotal * value) / 100 : value;
  return Math.min(Math.round(raw), subtotal);
};

const FormField = ({ icon: Icon, label, type = "text", name, value, onChange, placeholder, min, max, maxLength, pattern, title, compact, required = true }) => (
  <div className={`flex items-center bg-[#EFEFEF] rounded-xl py-2.5 mb-3 ${compact ? 'px-2' : 'px-3'}`}>
    <div className={`flex items-center text-gray-400 shrink-0 ${compact ? 'w-auto' : 'w-20'}`}>
      <Icon size={14} className={`text-[#C98A1E] shrink-0 ${compact ? 'mr-1' : 'mr-1.5'}`} />
      <span className="text-[11px] font-medium whitespace-nowrap">{label}</span>
    </div>
    <div className={`w-px h-5 bg-gray-300 ${compact ? 'ml-1.5 mr-2' : 'mx-2'} shrink-0`}></div>
    <input 
      type={type} 
      name={name}
      value={value}
      onChange={onChange}
      onFocus={handleMobileFocus}
      placeholder={placeholder}
      min={min}
      max={max}
      maxLength={maxLength}
      pattern={pattern}
      title={title}
      required={required}
      className="bg-transparent flex-1 outline-none text-xs text-gray-800 font-medium w-full min-w-0" 
    />
  </div>
);

const DatePickerField = ({ icon: Icon, label, selected, onChange, minDate, maxDate, excludeDates, disabled, placeholderText }) => (
  <div className={`flex items-center bg-[#EFEFEF] rounded-xl py-2.5 mb-3 px-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <div className="flex items-center text-gray-400 shrink-0 w-20">
      <Icon size={14} className="text-[#C98A1E] shrink-0 mr-1.5" />
      <span className="text-[11px] font-medium whitespace-nowrap">{label}</span>
    </div>
    <div className="w-px h-5 bg-gray-300 mx-2 shrink-0"></div>
    <DatePicker
      selected={selected}
      onChange={onChange}
      onFocus={handleMobileFocus}
      minDate={minDate}
      maxDate={maxDate}
      excludeDates={excludeDates}
      dateFormat="MMMM d, yyyy"
      placeholderText={placeholderText || "Select date"}
      disabled={disabled}
      className={`bg-transparent flex-1 outline-none text-xs text-gray-800 font-medium w-full min-w-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      wrapperClassName="w-full flex-1"
      required
    />
  </div>
);

const PackageSelectField = ({ icon: Icon, label, name, value, onChange, compact }) => (
  <div className={`flex items-center bg-[#EFEFEF] rounded-xl py-2.5 mb-3 ${compact ? 'px-2' : 'px-3'}`}>
    <div className={`flex items-center text-gray-400 shrink-0 ${compact ? 'w-auto' : 'w-20'}`}>
      <Icon size={14} className={`text-[#C98A1E] shrink-0 ${compact ? 'mr-1' : 'mr-1.5'}`} />
      <span className="text-[11px] font-medium whitespace-nowrap">{label}</span>
    </div>
    <div className={`w-px h-5 bg-gray-300 ${compact ? 'ml-1.5 mr-2' : 'mx-2'} shrink-0`}></div>
    <select
      name={name}
      value={value}
      onChange={onChange}
      onFocus={handleMobileFocus}
      className="bg-transparent flex-1 outline-none text-xs text-gray-800 font-medium w-full min-w-0 cursor-pointer"
    >
      {PACKAGES.map((pkg) => (
        <option key={pkg.name} value={pkg.name}>
          {pkg.name}
        </option>
      ))}
    </select>
  </div>
);

// Moved outside the component to prevent recreating the object on every render
const initialFormState = {
  name: '',
  email: '',
  number: '',
  checkIn: null,
  checkOut: null,
  package: 'Beloved',
  people: 2
};

export default function ManualBookingModal({ isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [promos, setPromos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  const handleCloseModal = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setFormData(initialFormState);
    }, 300); // Clears the form after the fade-out animation finishes
  };

  // Load booked dates and promos each time the modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, "bookings"),
          where("status", "in", ["pending", "confirmed"])
        );
        const snapshot = await getDocs(q);

        const allBlockedNights = [];
        const bookings = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.checkIn || !data.checkOut) return;

          const [inY, inM, inD] = String(data.checkIn).split('-').map(Number);
          const start = new Date(inY, inM - 1, inD);
          const [outY, outM, outD] = String(data.checkOut).split('-').map(Number);
          const end = new Date(outY, outM - 1, outD);

          bookings.push({ start, end });

          const curr = new Date(start);
          while (curr < end) {
            allBlockedNights.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
          }
        });

        bookings.sort((a, b) => a.start - b.start);
        setActiveBookings(bookings);
        setBookedDates(allBlockedNights);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    const fetchPromos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'promotions'));
        setPromos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching promos:', error);
      }
    };

    fetchBookings();
    fetchPromos();
  }, [isOpen]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "number") value = value.replace(/\D/g, '');

    setFormData((prevData) => {
      if (name === "people") {
        if (value === '') return { ...prevData, people: '' };
        const clampedPax = Math.min(40, Math.max(1, Number(value)));
        const matchedPkg = getRecommendedPackageByPax(clampedPax);
        return { ...prevData, people: clampedPax, package: matchedPkg.name };
      }

      if (name === "package") {
        const chosenPkg = PACKAGES.find((p) => p.name === value) || PACKAGES[0];
        let adjustedPeople = Number(prevData.people) || chosenPkg.minPax;
        if (adjustedPeople > chosenPkg.maxPax) adjustedPeople = chosenPkg.maxPax;
        return { ...prevData, package: value, people: adjustedPeople };
      }

      return { ...prevData, [name]: value };
    });
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
      ...(name === 'checkIn' && { checkOut: null }),
    }));
  };

  let minCheckOut = new Date();
  let maxCheckOut = null;

  if (formData.checkIn) {
    minCheckOut = new Date(formData.checkIn);
    minCheckOut.setDate(minCheckOut.getDate() + 1);

    const checkInTime = new Date(formData.checkIn);
    checkInTime.setHours(0, 0, 0, 0);

    const nextBooking = activeBookings.find((b) => b.start > checkInTime);
    if (nextBooking) maxCheckOut = nextBooking.start;
  }

  // --- PRICE CALCULATION (with promo) ---
  const selectedPkg = PACKAGES.find((p) => p.name === formData.package) || PACKAGES[0];
  const paxCount = Math.max(1, Number(formData.people) || 1);
  const extraPax = selectedPkg.extraHeadFee && paxCount > selectedPkg.basePax ? paxCount - selectedPkg.basePax : 0;
  const extraFee = extraPax * (selectedPkg.extraHeadFee || 0);
  const nightlyTotal = selectedPkg.nonPeakRate + extraFee;
  const nights = getNights(formData.checkIn, formData.checkOut);
  const subtotal = nightlyTotal * nights;

  const checkInKey = formData.checkIn ? formatDateForDB(formData.checkIn) : null;

  // Biggest discount among promos whose dates include the check-in date
  const appliedPromo = checkInKey
    ? promos.reduce((best, promo) => {
        if (!promo.startDate || !promo.endDate) return best;
        if (checkInKey < promo.startDate || checkInKey > promo.endDate) return best;
        const amount = calcDiscount(promo, subtotal);
        return amount > (best?.amount || 0) ? { ...promo, amount } : best;
      }, null)
    : null;

  const discountAmount = appliedPromo ? appliedPromo.amount : 0;
  const estimatedTotal = subtotal - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!formData.checkIn || !formData.checkOut) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        guestName: formData.name || "Guest",
        email: formData.email || "",
        phone: formData.number || "",
        checkIn: formatDateForDB(formData.checkIn),
        checkOut: formatDateForDB(formData.checkOut),
        package: formData.package,
        people: Number(formData.people) || 1,
        status: "confirmed", 
        totalPrice: estimatedTotal,
        subtotal,
        discountAmount,
        promoId: appliedPromo?.id || null,
        promoTitle: appliedPromo?.title || null,
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      console.error("Booking Error:", error);
      alert(`Firebase Error: ${error.message}\n\nCheck your Firestore Rules if it says "Missing permissions".`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm font-poppins overflow-y-auto overscroll-none animate-fade-in">
      <div className="flex min-h-[100dvh] items-center justify-center p-4 py-8 md:py-12">
        <div className="bg-white rounded-[32px] p-6 lg:p-8 w-full max-w-md shadow-2xl relative animate-fade-in-up">
          
          <button 
            onClick={handleCloseModal} 
            className="absolute top-6 right-6 text-gray-400 hover:text-[#C98A1E] transition-colors"
          >
            <X size={20} />
          </button>

          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
                <Check size={40} strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-sm text-gray-500">The schedule has been updated instantly.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl lg:text-2xl font-bold text-black mb-1">
                Manual <span className="italic text-[#C98A1E]">Booking</span>
              </h2>
              <p className="text-xs text-gray-500 mb-6">Create a confirmed reservation instantly.</p>

              <form onSubmit={handleSubmit}>
                <FormField icon={User} label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Juan Cruz" />
                <FormField icon={Mail} label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. jcruz@gmail.com" required={false} />
                <FormField icon={Phone} label="Number" type="tel" name="number" value={formData.number} onChange={handleChange} placeholder="e.g. 09123456789" maxLength="11" pattern="[0-9]{11}" title="Please enter an 11-digit mobile number"/>        
                
                <div className="flex gap-2">
                  <div className="flex-[1.3] min-w-0">
                    <PackageSelectField icon={Package} label="Package" name="package" value={formData.package} onChange={handleChange} compact={true} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <FormField icon={Users} label="Pax" type="number" name="people" min="1" max="40" value={formData.people} onChange={handleChange} compact={true} />
                  </div>
                </div>

                <DatePickerField 
                  icon={CalendarDays} 
                  label="Check In" 
                  selected={formData.checkIn} 
                  onChange={(date) => handleDateChange('checkIn', date)} 
                  minDate={new Date()}
                  excludeDates={bookedDates}
                />
                
                <DatePickerField 
                  icon={CalendarDays} 
                  label="Check Out" 
                  selected={formData.checkOut} 
                  onChange={(date) => handleDateChange('checkOut', date)} 
                  minDate={minCheckOut}
                  maxDate={maxCheckOut}
                  disabled={!formData.checkIn}
                  placeholderText={!formData.checkIn ? "Select Check In first" : "Select date"}
                />

                {/* --- PACKAGE & PRICE SUMMARY --- */}
                <div className="mt-1 mb-2 rounded-2xl bg-[#FDF3E1] border border-[#F5E1C8] p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#C98A1E] flex items-center gap-1">
                        <Sparkles size={12} /> {selectedPkg.name}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">{selectedPkg.paxRange} · {selectedPkg.bedrooms}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {discountAmount > 0 && (
                        <p className="text-[10px] text-gray-400 line-through">₱{subtotal.toLocaleString()}</p>
                      )}
                      <p className="text-sm font-bold text-[#C98A1E]">₱{estimatedTotal.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">
                        {nights > 1 ? `for ${nights} nights` : 'non-peak / night'}
                      </p>
                    </div>
                  </div>

                  {extraPax > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#F5E1C8] text-[10px] text-gray-700 flex justify-between">
                      <span>Base (₱{selectedPkg.nonPeakRate.toLocaleString()}) + {extraPax} extra pax</span>
                      <span className="font-semibold">+₱{extraFee.toLocaleString()}</span>
                    </div>
                  )}

                  {appliedPromo && (
                    <div className="mt-2 pt-2 border-t border-[#F5E1C8] text-[10px] text-emerald-700 flex justify-between">
                      <span className="flex items-center gap-1">
                        <Percent size={11} /> {appliedPromo.title}
                        {appliedPromo.discountType === 'percentage'
                          ? ` (${appliedPromo.discountValue}% off)`
                          : ` (₱${appliedPromo.discountValue} off)`}
                      </span>
                      <span className="font-semibold">−₱{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-[#F5E1C8]">
                    <span className="text-[10px] text-gray-500">Peak: ₱{selectedPkg.peakRate.toLocaleString()}/night</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-4 w-full bg-[#C98A1E] text-white py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-[#b57a18] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : (
                    <>
                      <Check size={18} /> Confirm Booking
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}