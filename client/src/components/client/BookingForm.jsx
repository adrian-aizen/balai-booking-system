import { useState } from 'react';
import { User, Mail, Phone, CalendarDays, Home, Users, Check, X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const FormField = ({ icon: Icon, label, type = "text", name, value, onChange, placeholder, min, compact, maxLength, pattern, title }) => (
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
      maxLength={maxLength}
      pattern={pattern}
      title={title}
      required
      className="bg-transparent flex-1 outline-none text-sm text-gray-800 font-medium w-full min-w-0" 
    />
  </div>
);

// New component specifically for the Dropdown to match FormField styling
const SelectField = ({ icon: Icon, label, name, value, onChange, compact }) => (
  <div className={`flex items-center bg-[#EFEFEF] rounded-xl py-3 mb-3 ${compact ? 'px-3' : 'px-4'}`}>
    <div className={`flex items-center text-gray-400 shrink-0 ${compact ? 'w-18' : 'w-28'}`}>
      <Icon size={16} className="mr-2 text-[#D4B07A]" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <div className={`w-px h-5 bg-gray-300 ${compact ? 'mx-2' : 'mx-3'}`}></div>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="bg-transparent flex-1 outline-none text-sm text-gray-800 font-medium w-full min-w-0 cursor-pointer"
    >
      <option value="Main Villa">Main</option>
      <option value="Mini Villa">Mini</option>
    </select>
  </div>
);

const BookingForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    checkIn: '',
    checkOut: '',
    villaType: 'Main Villa', // Replaces 'rooms' state
    people: 1
  });

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "number") {
      value = value.replace(/\D/g, ''); 
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault(); 
  
    try {
      // Explicitly map formData to match your new Firestore schema
      const docRef = await addDoc(collection(db, "bookings"), {
        guestName: formData.name,
        email: formData.email,
        phone: formData.number,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        villaType: formData.villaType,     // Sends "Main Villa" or "Mini Villa"
        people: Number(formData.people),   // Ensures this is saved as a number
        status: "pending",
        totalPrice: 0,                     // Placeholder for later calculation
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
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
      >
        <X size={20} />
      </button>

      <h2 className="text-xl font-bold text-black mb-6">
        How long do you <span className="italic text-[#D4B07A]">plan to stay?</span>
      </h2>

      <form onSubmit={handleSubmit}>
        <FormField icon={User} label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Juan Cruz" />
        <FormField icon={Mail} label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. jcruz@gmail.com" />
        <FormField icon={Phone} label="Number" type="tel" name="number" value={formData.number} onChange={handleChange} placeholder="e.g. 09123456789" maxLength="11" pattern="[0-9]{11}" title="Please enter an 11-digit mobile number"/>        
        
        <FormField icon={CalendarDays} label="Check In" type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} min={today} />
        <FormField icon={CalendarDays} label="Check Out" type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} min={formData.checkIn || today} />
        
        <div className="flex gap-2">
            <div className="flex-1 min-w-0">
                {/* Replaced FormField with the new SelectField using the Home icon */}
                <SelectField icon={Home} label="Villa" name="villaType" value={formData.villaType} onChange={handleChange} compact={true} />
            </div>
            <div className="flex-1 min-w-0">
                <FormField icon={Users} label="People" type="number" name="people" min="1" value={formData.people} onChange={handleChange} compact={true} />
            </div>
        </div>

        <button type="submit" className="mt-2 w-1/2 bg-[#E6BA7A] text-white px-6 py-3 rounded-full font-medium text-sm shadow-md hover:bg-[#d4a96b] transition-colors flex items-center justify-center gap-2">
          <Check size={18} />
          Book Now
        </button>
      </form>
    </div>
  );
};

export default BookingForm;