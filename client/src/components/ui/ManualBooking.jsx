import { useState } from 'react';
import { X, User, Mail, Phone, Home as HomeIcon, Users, CalendarDays } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// 1. FormField is now OUTSIDE the main component so it doesn't get recreated on every keystroke
const FormField = ({ icon: Icon, label, type, name, value, onChange, placeholder, min, max, required = true }) => (
  <div className="flex-1 min-w-0">
    <label className="block text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-1 ml-1">{label}</label>
    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
      <Icon size={14} className="text-[#C98A1E] shrink-0 mr-2" />
      <input 
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} 
        min={min} max={max} required={required}
        className="bg-transparent flex-1 outline-none text-xs text-gray-800 font-medium w-full min-w-0" 
      />
    </div>
  </div>
);

export default function ManualBookingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    villaType: 'Main Villa',
    people: '',
    checkIn: '',
    checkOut: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    setFormData(prev => {
      let updatedValue = value;
      let updatedPeople = prev.people;
      
      if (name === "people") {
        updatedValue = value.replace(/\D/g, ''); 
        const maxPax = prev.villaType === 'Main Villa' ? 25 : 10;
        if (Number(updatedValue) > maxPax) updatedValue = maxPax; 
      }

      if (name === "villaType") {
        const newMaxPax = value === 'Main Villa' ? 25 : 10;
        if (Number(prev.people) > newMaxPax) updatedPeople = newMaxPax;
      }

      return {
        ...prev,
        [name]: updatedValue,
        ...(name === "villaType" && { people: updatedPeople })
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "bookings"), {
        ...formData,
        status: 'confirmed', 
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ guestName: '', email: '', phone: '', villaType: 'Main Villa', people: '', checkIn: '', checkOut: '' });
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error adding manual booking: ", error);
      alert("Failed to save booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md relative shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-fade-in-up">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-[#C98A1E] transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-[#C98A1E] mb-1">Manual Booking</h2>
        <p className="text-xs text-gray-500 mb-6">Create a confirmed reservation instantly.</p>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-sm font-bold text-emerald-800 mb-1">Booking Confirmed!</h3>
            <p className="text-xs text-emerald-600">The calendar has been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 2. Added onChange={handleChange} to every FormField so the cursor stays focused */}
            <FormField icon={User} label="Guest Name" type="text" name="guestName" value={formData.guestName} onChange={handleChange} placeholder="Full Name" />
            
            <div className="flex gap-3">
              <FormField icon={Phone} label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="09XX XXX XXXX" />
              <FormField icon={Mail} label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jcruz@gmail.com" required={false} />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-1 ml-1">Villa Type</label>
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
                  <HomeIcon size={14} className="text-[#C98A1E] shrink-0 mr-2" />
                  <select name="villaType" value={formData.villaType} onChange={handleChange} className="bg-transparent flex-1 outline-none text-xs text-gray-800 font-medium w-full min-w-0 appearance-none cursor-pointer">
                    <option value="Main Villa">Main Villa</option>
                    <option value="Mini Villa">Mini Villa</option>
                  </select>
                </div>
              </div>
              <FormField icon={Users} label="Pax" type="number" name="people" value={formData.people} onChange={handleChange} placeholder="Count" min="1" max={formData.villaType === 'Main Villa' ? "25" : "10"} />
            </div>

            <div className="flex gap-3">
              <FormField icon={CalendarDays} label="Check In" type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
              <FormField icon={CalendarDays} label="Check Out" type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} min={formData.checkIn || new Date().toISOString().split('T')[0]} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#C98A1E] hover:bg-[#b57a18] text-white text-sm font-bold py-3.5 rounded-full transition-all mt-6 disabled:opacity-70 shadow-md">
              {loading ? "Saving Booking..." : "Confirm Booking"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}