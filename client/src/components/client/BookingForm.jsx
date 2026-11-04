import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, CalendarDays, Home as HomeIcon, Users, Check, X, TreePine, LogIn } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import MoltenMetal from '../ui/MoltenMetal'; 

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FormField = ({ icon: Icon, label, type = "text", name, value, onChange, placeholder, maxLength, pattern, title, compact }) => (
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
      placeholder={placeholder}
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

const SelectField = ({ icon: Icon, label, name, value, onChange, compact }) => (
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
      className="bg-transparent flex-1 outline-none text-xs text-gray-800 font-medium w-full min-w-0 cursor-pointer"
    >
      <option value="Main Villa">Main</option>
      <option value="Mini Villa">Mini</option>
    </select>
  </div>
);

const [promos, setPromos] = useState([]);

useEffect(() => {
  getDocs(collection(db, 'promotions')).then((snap) =>
    setPromos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}, []);

const promo = getActivePromo(promos, checkIn, villaType, subtotal);
const { discount, total } = applyPromo(subtotal, promo);

export default function BookingForm() {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState({ show: false, refId: '' });
  
  const [bookedDates, setBookedDates] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    checkIn: null,
    checkOut: null,
    villaType: 'Main Villa',
    people: 1
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, "bookings"),
          where("villaType", "==", formData.villaType),
          where("status", "in", ["pending", "confirmed"])
        );
        const snapshot = await getDocs(q);
        
        let allBlockedNights = [];
        let bookings = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          
          // FIX: Explicitly parse YYYY-MM-DD components to enforce local timezone midnight
          const [inYear, inMonth, inDay] = data.checkIn.split('-').map(Number);
          const start = new Date(inYear, inMonth - 1, inDay);
          
          const [outYear, outMonth, outDay] = data.checkOut.split('-').map(Number);
          const end = new Date(outYear, outMonth - 1, outDay);
          
          bookings.push({ start, end });

          let curr = new Date(start);
          while (curr < end) {
            allBlockedNights.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
          }
        });

        bookings.sort((a,b) => a.start - b.start);
        setActiveBookings(bookings);
        setBookedDates(allBlockedNights);
        
        setFormData(prev => ({ ...prev, checkIn: null, checkOut: null }));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, [formData.villaType]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "number") value = value.replace(/\D/g, ''); 

    setFormData(prevData => {
      let updatedValue = value;
      if (name === "people") {
        const maxPax = prevData.villaType === 'Main Villa' ? 25 : 10;
        if (Number(value) > maxPax) updatedValue = maxPax; 
      }
      let updatedPeople = prevData.people;
      if (name === "villaType") {
        const newMaxPax = value === 'Main Villa' ? 25 : 10;
        if (Number(prevData.people) > newMaxPax) updatedPeople = newMaxPax;
      }
      return {
        ...prevData,
        [name]: updatedValue,
        ...(name === "villaType" && { people: updatedPeople })
      };
    });
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => {
      const updates = { [name]: date };
      if (name === 'checkIn') {
        updates.checkOut = null;
      }
      return { ...prev, ...updates };
    });
  };

  let minCheckOut = new Date();
  let maxCheckOut = null;
  
  if (formData.checkIn) {
    minCheckOut = new Date(formData.checkIn);
    minCheckOut.setDate(minCheckOut.getDate() + 1);

    const checkInTime = new Date(formData.checkIn);
    checkInTime.setHours(0,0,0,0);
    
    const nextBooking = activeBookings.find(b => b.start > checkInTime);
    if (nextBooking) {
      maxCheckOut = nextBooking.start;
    }
  }

  const formatDateForDB = (dateObj) => {
    if (!dateObj) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!formData.checkIn || !formData.checkOut) return;
    
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        guestName: formData.name,
        email: formData.email,
        phone: formData.number,
        checkIn: formatDateForDB(formData.checkIn),
        checkOut: formatDateForDB(formData.checkOut),
        villaType: formData.villaType,
        people: Number(formData.people),
        status: "pending",
        totalPrice: 0,
        createdAt: new Date().toISOString()
      });
      setSuccessData({ show: true, refId: docRef.id });
    } catch {
      alert("An error occurred while booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-poppins flex flex-col items-center justify-center pt-24 lg:pt-0 pb-12 px-6 lg:px-20">

      {successData.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-fade-in">
          <div className="bg-white rounded-[32px] p-8 lg:p-10 max-w-sm w-full text-center shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Your booking request has been successfully submitted. We will contact you shortly to confirm your reservation.
            </p>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 mb-8 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Reference ID</p>
              <p className="text-sm font-mono font-bold text-[#C98A1E] break-all">{successData.refId}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#C98A1E] text-white py-4 rounded-full font-bold text-sm shadow-md hover:bg-[#b57a18] transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

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
            <button className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold mt-4">
              <LogIn size={20} /> <span className="text-sm">Sign In</span>
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
                <div className="flex-1 min-w-0">
                    <SelectField icon={HomeIcon} label="Villa" name="villaType" value={formData.villaType} onChange={handleChange} compact={true} />
                </div>
                <div className="flex-1 min-w-0">
                    <FormField icon={Users} label="People" type="text" name="people" maxLength="2" value={formData.people} onChange={handleChange} compact={true} />
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

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-4 w-full lg:w-auto lg:px-8 bg-[#C98A1E] text-white py-3 lg:py-2.5 rounded-full font-medium text-sm shadow-md hover:bg-[#b57a18] transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : (
                <>
                  <Check size={18} /> Book Now
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}