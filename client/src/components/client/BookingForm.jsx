import { useState } from 'react';
import { User, Mail, Phone, CalendarDays, BedDouble, Users, Check, X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const FormField = ({ icon: Icon, label, type = "text", name, value, onChange, placeholder, min, compact, maxLength }) => (
  <div className={`flex items-center bg-[#EFEFEF] rounded-xl py-3 mb-3 ${compact ? 'px-3' : 'px-4'}`}>
    <div className={`flex items-center text-gray-400 shrink-0 ${compact ? 'w-18' : 'w-28'}`}>
      <Icon size={16} className="mr-2 text-[#D4B07A]" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <div className={`w-px h-5 bg-gray-300 ${compact ? 'mx-2' : 'mx-3'}`}></div>
    <input 
      type={type} 
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      maxLength={maxLength} // <-- Add this here
      required
      className="bg-transparent flex-1 outline-none text-sm text-gray-800 font-medium w-full min-w-0" 
    />
  </div>
);

// 2. Main Booking Form Component
const BookingForm = ({ onClose }) => {
  // Initialize state for all form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    people: 1
  });

  // Handle changes dynamically for all inputs
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Force the number field to strictly accept only digits
    if (name === "number") {
      value = value.replace(/\D/g, ''); // Removes all non-numeric characters
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Secure submit handler (No console logs)
  const handleSubmit = async (e) => {
  e.preventDefault(); 
  
  try {
    // 1. Add the document to the "bookings" collection
    const docRef = await addDoc(collection(db, "bookings"), {
      ...formData,
      status: "pending",
      createdAt: new Date()
    });
    
    alert("Booking successfully submitted! Reference ID: " + docRef.id);
    onClose(); 
  } catch {
    alert("An error occurred while booking. Please try again.");
    }
    };

  return (
    <div className="bg-white/95 backdrop-blur-md w-full max-w-sm rounded-4xl p-6 shadow-2xl relative animate-fade-in-up mt-8">
      {/* Close Modal Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
      >
        <X size={20} />
      </button>

      <h2 className="text-xl font-bold text-black mb-6">
        How long do you <span className="italic text-[#D4B07A]">plan to stay?</span>
      </h2>

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <FormField icon={User} label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Juan Cruz" />
        <FormField icon={Mail} label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. jcruz@gmail.com" />
        <FormField icon={Phone} label="Number" type="tel" name="number" value={formData.number} onChange={handleChange} placeholder="e.g. 09123456789" maxLength="11" pattern="[0-9]{11}" title="Please enter an 11-digit mobile number"/>        
        {/* Date Selectors */}
        <FormField icon={CalendarDays} label="Check In" type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} />
        <FormField icon={CalendarDays} label="Check Out" type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} />
        
        <div className="flex gap-2">
            <div className="flex-1 min-w-0">
                <FormField icon={BedDouble} label="Rooms" type="number" name="rooms" min="1" value={formData.rooms} onChange={handleChange} compact={true} />
            </div>
            <div className="flex-1 min-w-0">
                <FormField icon={Users} label="People" type="number" name="people" min="1" value={formData.people} onChange={handleChange} compact={true} />
            </div>
            </div>

        {/* Submit Button */}
        <button type="submit" className="mt-2 w-1/2 bg-[#E6BA7A] text-white px-6 py-3 rounded-full font-medium text-sm shadow-md hover:bg-[#d4a96b] transition-colors flex items-center justify-center gap-2">
          <Check size={18} />
          Book Now
        </button>
      </form>
    </div>
  );
};

export default BookingForm;