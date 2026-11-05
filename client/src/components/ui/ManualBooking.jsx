import { useState, useEffect } from 'react';
import { User, Mail, Phone, CalendarDays, Home as HomeIcon, Users, Check, X } from 'lucide-react';
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

const FormField = ({ icon: Icon, label, type = "text", name, value, onChange, placeholder, maxLength, pattern, title, compact, required = true }) => (
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
      onFocus={handleMobileFocus}
      className="bg-transparent flex-1 outline-none text-xs text-gray-800 font-medium w-full min-w-0 cursor-pointer"
    >
      <option value="Main Villa">Main</option>
      <option value="Mini Villa">Mini</option>
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
  villaType: 'Main Villa',
  people: 1
};

export default function ManualBookingModal({ isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  // FIX: Safe shutdown handler that prevents the "setState in useEffect" ESLint warning
  const handleCloseModal = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setFormData(initialFormState);
    }, 300); // Clears the form cleanly after the fade-out animation finishes
  };

  useEffect(() => {
    if (!isOpen) return; // Exit early safely without triggering state updates

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
  }, [formData.villaType, isOpen]);

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
      await addDoc(collection(db, "bookings"), {
        guestName: formData.name || "Guest",
        email: formData.email || "",
        phone: formData.number || "",
        checkIn: formatDateForDB(formData.checkIn),
        checkOut: formatDateForDB(formData.checkOut),
        villaType: formData.villaType || "Main Villa",
        people: Number(formData.people) || 1,
        status: "confirmed", 
        totalPrice: 0,
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      console.error("Booking Error:", error);
      // FIX: Alert now shows the EXACT reason Firebase rejected the submission
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
                    <div className="flex-1 min-w-0">
                        <SelectField icon={HomeIcon} label="Villa" name="villaType" value={formData.villaType} onChange={handleChange} compact={true} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <FormField icon={Users} label="Pax" type="text" name="people" maxLength="2" value={formData.people} onChange={handleChange} compact={true} />
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