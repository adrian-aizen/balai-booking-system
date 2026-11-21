import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, CalendarDays, Home as HomeIcon, Users,
  Check, X, TreePine, LogIn, Sparkles, Package, Info
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import MoltenMetal from '../ui/MoltenMetal';
import LoginModal from '../ui/LoginModal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const handleMobileFocus = (e) => {
  if (window.innerWidth < 1024) {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
};

const PACKAGES = [
  {
    name: 'Beloved',
    paxRange: '2–4 pax',
    minPax: 1,
    maxPax: 4,
    basePax: 4,
    bedrooms: '1 Bedroom',
    nonPeakRate: 5000,
    peakRate: 6000,
    nonPeakResFee: 2500,
    peakResFee: 3000,
    nonPeakTime: '3:00 PM – 11:00 AM',
    peakTime: '2:00 PM – 10:00 AM',
    amenities: ['Swimming pool', '1 Bedroom', '1 Toilet & bath', 'Videoke area', 'Kitchen & Dining', 'BBQ Grill', 'Garden', 'Free WiFi', 'Parking (1–2 vehicles)'],
  },
  {
    name: 'Bliss',
    paxRange: '5–6 pax',
    minPax: 5,
    maxPax: 6,
    basePax: 6,
    bedrooms: '1 Bedroom',
    nonPeakRate: 6000,
    peakRate: 7000,
    nonPeakResFee: 2500,
    peakResFee: 3500,
    nonPeakTime: '3:00 PM – 11:00 AM',
    peakTime: '2:00 PM – 10:00 AM',
    amenities: ['Swimming pool', '1 Bedroom', '1 Toilet & bath', 'Videoke area', 'Kitchen & Dining', 'BBQ Grill', 'Garden', 'Free WiFi', 'Parking (1–2 vehicles)'],
  },
  {
    name: 'Bunch',
    paxRange: '7–12 pax',
    minPax: 7,
    maxPax: 12,
    basePax: 12,
    bedrooms: '2 Bedrooms',
    nonPeakRate: 7000,
    peakRate: 8000,
    nonPeakResFee: 2500,
    peakResFee: 4000,
    nonPeakTime: '3:00 PM – 11:00 AM',
    peakTime: '2:00 PM – 10:00 AM',
    amenities: ['Swimming pool', '2 Bedrooms', '1 Toilet & bath', 'Videoke area', 'Kitchen & Dining', 'BBQ Grill', 'Garden', 'Free WiFi', 'Parking (1–2 vehicles)'],
  },
  {
    name: 'Bloom',
    paxRange: 'Up to 18 pax',
    minPax: 13,
    maxPax: 18,
    basePax: 18,
    bedrooms: '3 Bedrooms',
    nonPeakRate: 12000,
    peakRate: 14000,
    nonPeakResFee: 3000,
    peakResFee: 5000,
    nonPeakTime: '3:00 PM – 11:00 AM',
    peakTime: '3:00 PM – 11:00 AM',
    amenities: ['Swimming pool', '3 Bedrooms', 'Videoke room', 'Billiards', 'Basketball', 'Outdoor dining', 'Kitchen', 'BBQ Grill', 'Free WiFi', 'Parking space'],
  },
  {
    name: 'Bond',
    paxRange: 'Up to 26 pax (Max 30)',
    minPax: 19,
    maxPax: 30,
    basePax: 26,
    extraHeadFee: 500,
    bedrooms: '5 Bedrooms (4 AC, 1 Fanned)',
    nonPeakRate: 14000,
    peakRate: 18000,
    nonPeakResFee: 3000,
    peakResFee: 5000,
    nonPeakTime: '3:00 PM – 11:00 AM',
    peakTime: '3:00 PM – 11:00 AM',
    amenities: ['Swimming pool', '5 Bedrooms', 'Videoke room', 'Billiards', 'Basketball', 'Outdoor dining', 'Kitchen', 'BBQ Grill', 'Free WiFi', 'Parking space'],
  },
  {
    name: 'Bash',
    paxRange: 'Up to 40 pax',
    minPax: 31,
    maxPax: 40,
    basePax: 40,
    bedrooms: '7 Bedrooms (6 AC, 1 Fanned)',
    nonPeakRate: 22000,
    peakRate: 26000,
    nonPeakResFee: 3000,
    peakResFee: 5000,
    nonPeakTime: '3:00 PM – 11:00 AM',
    peakTime: '3:00 PM – 11:00 AM',
    amenities: ['Swimming pool', '7 Bedrooms', 'Videoke room', 'Billiards', 'Basketball', 'Outdoor dining', 'Kitchen', 'BBQ Grill', 'Free WiFi', 'Parking space'],
  },
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

const FormField = ({ icon: Icon, label, type = "text", name, value, onChange, placeholder, min, max, compact, maxLength, pattern, title }) => (
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
      required
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

export default function BookingForm() {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [confirmation, setConfirmation] = useState({
    show: false,
    refId: '',
    packageName: '',
    checkIn: '',
    checkOut: '',
    people: 0,
    totalPrice: 0,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    checkIn: null,
    checkOut: null,
    package: 'Beloved',
    people: 2
  });

  const selectedPkg = PACKAGES.find((p) => p.name === formData.package) || PACKAGES[0];

  useEffect(() => {
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
        console.error("Error fetching reserved dates:", error);
      }
    };

    fetchBookings();
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "number") {
      value = value.replace(/\D/g, '');
    }

    setFormData((prevData) => {
      if (name === "people") {
        if (value === '') return { ...prevData, people: '' };
        const clampedPax = Math.min(40, Math.max(1, Number(value)));
        const matchedPkg = getRecommendedPackageByPax(clampedPax);
        return {
          ...prevData,
          people: clampedPax,
          package: matchedPkg.name,
        };
      }

      if (name === "package") {
        const chosenPkg = PACKAGES.find((p) => p.name === value) || PACKAGES[0];
        let adjustedPeople = Number(prevData.people) || chosenPkg.minPax;
        if (adjustedPeople > chosenPkg.maxPax) {
          adjustedPeople = chosenPkg.maxPax;
        }
        return {
          ...prevData,
          package: value,
          people: adjustedPeople,
        };
      }
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
      ...(name === 'checkIn' && { checkOut: null }),
    }));
  };

  const handleSelectPackageFromModal = (pkg) => {
    setFormData((prev) => {
      const currentPax = Number(prev.people) || pkg.minPax;
      const adjustedPax = currentPax > pkg.maxPax ? pkg.maxPax : currentPax < pkg.minPax ? pkg.minPax : currentPax;
      return {
        ...prev,
        package: pkg.name,
        people: adjustedPax,
      };
    });
    setIsPackagesOpen(false);
  };

  let minCheckOut = new Date();
  let maxCheckOut = null;

  if (formData.checkIn) {
    minCheckOut = new Date(formData.checkIn);
    minCheckOut.setDate(minCheckOut.getDate() + 1);

    const checkInTime = new Date(formData.checkIn);
    checkInTime.setHours(0, 0, 0, 0);

    const nextBooking = activeBookings.find((b) => b.start > checkInTime);
    if (nextBooking) {
      maxCheckOut = nextBooking.start;
    }
  }

  const paxCount = Math.max(1, Number(formData.people) || 1);
  const extraPax = selectedPkg.extraHeadFee && paxCount > selectedPkg.basePax ? paxCount - selectedPkg.basePax : 0;
  const extraFee = extraPax * (selectedPkg.extraHeadFee || 0);
  const nightlyTotal = selectedPkg.nonPeakRate + extraFee;
  const nights = getNights(formData.checkIn, formData.checkOut);
  const estimatedTotal = nightlyTotal * nights;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut) return;

    const checkInStr = formatDateForDB(formData.checkIn);
    const checkOutStr = formatDateForDB(formData.checkOut);

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        checkIn: checkInStr,
        checkOut: checkOutStr,
        email: formData.email,
        guestName: formData.name,
        package: formData.package,
        people: Number(formData.people),
        phone: formData.number,
        status: "pending",
        totalPrice: estimatedTotal,
      });

      setConfirmation({
        show: true,
        refId: docRef.id,
        packageName: formData.package,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        people: Number(formData.people),
        totalPrice: estimatedTotal,
      });
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-poppins flex flex-col items-center justify-center pt-24 lg:pt-0 pb-12 px-6 lg:px-20">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      {/* --- BOOKING CONFIRMATION MODAL --- */}
      {confirmation.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-emerald-100">
              <Check size={40} strokeWidth={3} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">Request Sent!</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Your booking request has been submitted. We will contact you shortly to confirm your reservation.
            </p>

            <div className="bg-[#FDF3E1] rounded-2xl p-4 mb-4 border border-[#F5E1C8] text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Package</span>
                <span className="font-bold text-gray-900">{confirmation.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guests</span>
                <span className="font-semibold text-gray-800">{confirmation.people} pax</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dates</span>
                <span className="font-semibold text-gray-800">
                  {confirmation.checkIn} → {confirmation.checkOut}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-[#F5E1C8]">
                <span className="text-gray-500">Est. Total</span>
                <span className="font-bold text-[#C98A1E]">
                  ₱{confirmation.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-3.5 mb-6 border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                Reference ID
              </p>
              <p className="text-xs font-mono font-bold text-[#C98A1E] break-all">
                {confirmation.refId}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-[#C98A1E] text-white py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-[#b57a18] transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* --- PACKAGES POP-UP MODAL --- */}
      {isPackagesOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm overflow-y-auto overscroll-none animate-fade-in"
          onClick={() => setIsPackagesOpen(false)}
        >
          <div className="flex min-h-[100dvh] items-center justify-center p-4 py-8">
            <div
              className="bg-white rounded-[32px] p-6 lg:p-8 w-full max-w-2xl shadow-2xl relative animate-fade-in-up"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsPackagesOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
              >
                <X size={22} />
              </button>

              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C98A1E] mb-1">Balai 88</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Available <span className="italic text-[#C98A1E]">Packages</span>
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                *1 yr old and up included in headcount · ₱500/pet/night fee (non-negotiable).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
                {PACKAGES.map((pkg) => {
                  const isCurrent = formData.package === pkg.name;
                  return (
                    <div
                      key={pkg.name}
                      className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#FDF3E1] border-[#C98A1E] shadow-sm'
                          : 'bg-[#F8F9FA] border-gray-100 hover:border-orange-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-base font-bold text-gray-900">{pkg.name}</h3>
                            <p className="text-[11px] font-medium text-[#C98A1E]">{pkg.paxRange} · {pkg.bedrooms}</p>
                          </div>
                          {isCurrent && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#C98A1E] text-white text-[9px] font-bold uppercase tracking-wider">
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-3 text-[11px]">
                          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                            <p className="text-[9px] font-bold uppercase text-gray-400">Non-Peak</p>
                            <p className="text-sm font-bold text-gray-900">₱{pkg.nonPeakRate.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-500">Res. fee: ₱{pkg.nonPeakResFee.toLocaleString()}</p>
                          </div>
                          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                            <p className="text-[9px] font-bold uppercase text-gray-400">Peak / Holiday</p>
                            <p className="text-sm font-bold text-[#C98A1E]">₱{pkg.peakRate.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-500">Res. fee: ₱{pkg.peakResFee.toLocaleString()}</p>
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-500 mb-2">
                          <span className="font-semibold text-gray-700">Check-in/out:</span> {pkg.nonPeakTime}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {pkg.amenities.map((item) => (
                            <span
                              key={item}
                              className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[9px] font-medium text-gray-600"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectPackageFromModal(pkg)}
                        className={`w-full py-2 rounded-full text-xs font-bold transition-colors ${
                          isCurrent
                            ? 'bg-[#C98A1E] text-white'
                            : 'bg-white border border-[#C98A1E] text-[#C98A1E] hover:bg-[#C98A1E] hover:text-white'
                        }`}
                      >
                        {isCurrent ? 'Selected' : `Choose ${pkg.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MATCHED ADMIN ACCENT COLOR & MOLTEN METAL --- */}
      <div className="fixed inset-0 -z-10 bg-[#C98A1E]">
        <MoltenMetal
          colors={["#C98A1E","#ffffff"]}
          coreColor="#ffffff"
          speed={0.73}
          scale={5.6}
          detail={3.6}
          glow={1.6}
          thickness={1.03}
          haze={1}
          mouseInteraction={false}
          flareOnClick={false}
          colorMode="frost"
          swirl={2}
          turbulence={0.33}
          brightness={2.4}
          rotation={16}
          offsetX={0.12}
          grain={0}
          drift={1}
          mouseStrength={0.53}
        />
      </div>

      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} bg-black/30 backdrop-blur-xl border-r border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]`}>
        <div className="p-6 flex flex-col h-full">
          <button onClick={() => setIsNavOpen(false)} className="self-end text-white/70 hover:text-white mb-8 transition-colors">
            <X size={24} />
          </button>
          <nav className="flex flex-col gap-6 text-gray-400">
            <button onClick={() => { setIsNavOpen(false); navigate('/'); }} className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold">
              <HomeIcon size={20} /> <span className="text-sm">Home</span>
            </button>
            <button onClick={() => { setIsNavOpen(false); navigate('/#about'); }} className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold">
              <TreePine size={20} /> <span className="text-sm">About Us</span>
            </button>
            <button onClick={() => setIsNavOpen(false)} className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold text-white font-semibold">
              <CalendarDays size={20} /> <span className="text-sm">Book Now</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsNavOpen(false);
                setIsLoginOpen(true);
              }}
              className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold mt-4"
            >
              <LogIn size={20} /> <span className="text-sm">Admin Access</span>
            </button>
          </nav>
        </div>
      </div>

      <button 
        onClick={() => setIsNavOpen(true)}
        className="fixed top-6 left-6 z-40 p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/30 transition-all"
      >
        <div className="flex flex-col gap-1.5 w-5">
          <span className="block h-0.5 w-full bg-white rounded-full"></span>
          <span className="block h-0.5 w-full bg-white rounded-full"></span>
          <span className="block h-0.5 w-full bg-white rounded-full"></span>
        </div>
      </button>

      <div className="w-full max-w-6xl relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        <div className="w-full lg:w-1/2 drop-shadow-md text-center lg:text-left mt-8 lg:mt-0">
          <h1 className="text-4xl lg:text-6xl text-white font-light leading-tight mb-4 lg:mb-6">
            Your private <br className="hidden lg:block"/> retreat for <br className="hidden lg:block"/> 
            <span className="font-serif italic font-bold">rest and <br className="lg:hidden"/> relaxation.</span>
          </h1>
          <div className="w-16 lg:w-24 h-[2px] bg-white mb-4 lg:mb-6 mx-auto lg:mx-0"></div>
          <p className="text-white text-xs lg:text-sm font-medium tracking-wide lg:leading-relaxed">
            A TRANQUIL AND SECLUDED VILLA <br/> WHERE YOU CAN TRULY UNWIND.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md w-full max-w-sm lg:max-w-md rounded-[32px] p-6 lg:p-8 shadow-2xl relative animate-fade-in-up shrink-0">          
          <button 
            onClick={() => navigate('/')} 
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl lg:text-2xl font-bold text-black mb-6">
            How long do you <span className="italic text-[#C98A1E]">plan to stay?</span>
          </h2>

          <form onSubmit={handleSubmit}>
            <FormField icon={User} label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Juan Cruz" />
            <FormField icon={Mail} label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. jcruz@gmail.com" />
            <FormField icon={Phone} label="Number" type="tel" name="number" value={formData.number} onChange={handleChange} placeholder="e.g. 09123456789" maxLength="11" pattern="[0-9]{11}" title="Please enter an 11-digit mobile number"/>        
            
            <div className="flex gap-2">
              <div className="flex-[1.3] min-w-0">
                <PackageSelectField icon={Package} label="Package" name="package" value={formData.package} onChange={handleChange} compact={true} />
              </div>
              <div className="flex-1 min-w-0">
                <FormField 
                  icon={Users} 
                  label="Pax" 
                  type="number" 
                  name="people" 
                  min="1" 
                  max="40" 
                  value={formData.people} 
                  onChange={handleChange} 
                  compact={true} 
                />
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

            {/* --- SELECTED PACKAGE SUMMARY & POP-UP TRIGGER --- */}
            <div className="mt-1 mb-4 rounded-2xl bg-[#FDF3E1] border border-[#F5E1C8] p-3.5 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#C98A1E] flex items-center gap-1">
                    <Sparkles size={12} /> {selectedPkg.name}
                  </p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{selectedPkg.paxRange} · {selectedPkg.bedrooms}</p>
                </div>
                <div className="text-right shrink-0">
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

              <div className="mt-2.5 pt-2 border-t border-[#F5E1C8] flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Peak: ₱{selectedPkg.peakRate.toLocaleString()}/night</span>
                <button
                  type="button"
                  onClick={() => setIsPackagesOpen(true)}
                  className="text-[11px] font-bold text-[#C98A1E] hover:underline flex items-center gap-1"
                >
                  <Info size={12} /> View All Packages
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-2 w-full bg-[#C98A1E] text-white py-3 rounded-full font-medium text-sm shadow-md hover:bg-[#b57a18] transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Check size={18} />
                  Book Now
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}