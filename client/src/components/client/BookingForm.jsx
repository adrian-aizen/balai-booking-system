import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, CalendarDays, Home as HomeIcon, Users, Check, X, TreePine, LogIn } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import MoltenMetal from '../ui/MoltenMetal'; 

const FormField = ({ icon: Icon, label, type = "text", name, value, onChange, placeholder, min, max, compact, maxLength, pattern, title }) => (
  <div className={`flex items-center bg-[#EFEFEF] rounded-xl py-2.5 mb-3 ${compact ? 'px-2' : 'px-3'}`}>
    <div className={`flex items-center text-gray-400 shrink-0 ${compact ? 'w-auto' : 'w-20'}`}>
      <Icon size={14} className={`text-[#D4B07A] shrink-0 ${compact ? 'mr-1' : 'mr-1.5'}`} />
      <span className="text-[11px] font-medium whitespace-nowrap">{label}</span>
    </div>
    <div className={`w-px h-5 bg-gray-300 ${compact ? 'ml-1.5 mr-2' : 'mx-2'} shrink-0`}></div>
    <input 
      type={type} 
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max} /* <-- Added max prop here */
      maxLength={maxLength}
      pattern={pattern}
      title={title}
      required
      className="bg-transparent flex-1 outline-none text-xs text-gray-800 font-medium w-full min-w-0" 
    />
  </div>
);

const SelectField = ({ icon: Icon, label, name, value, onChange, compact }) => (
  <div className={`flex items-center bg-[#EFEFEF] rounded-xl py-2.5 mb-3 ${compact ? 'px-2' : 'px-3'}`}>
    {/* CHANGED: Used w-auto on compact to free up maximum space */}
    <div className={`flex items-center text-gray-400 shrink-0 ${compact ? 'w-auto' : 'w-20'}`}>
      <Icon size={14} className={`text-[#D4B07A] shrink-0 ${compact ? 'mr-1' : 'mr-1.5'}`} />
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

export default function BookingForm() {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    checkIn: '',
    checkOut: '',
    villaType: 'Main Villa',
    people: 1
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === "number") {
      value = value.replace(/\D/g, ''); 
    }

    setFormData(prevData => {
      let updatedValue = value;
      
      // Prevent manually typing a number higher than the max allowed
      if (name === "people") {
        const maxPax = prevData.villaType === 'Main Villa' ? 25 : 10;
        if (Number(value) > maxPax) {
          updatedValue = maxPax; 
        }
      }

      // Automatically reduce pax if switching to Mini Villa with > 10 people
      let updatedPeople = prevData.people;
      if (name === "villaType") {
        const newMaxPax = value === 'Main Villa' ? 25 : 10;
        if (Number(prevData.people) > newMaxPax) {
          updatedPeople = newMaxPax;
        }
      }

      return {
        ...prevData,
        [name]: updatedValue,
        ...(name === "villaType" && { people: updatedPeople }) // Applies the auto-reduction if needed
      };
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        guestName: formData.name,
        email: formData.email,
        phone: formData.number,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        villaType: formData.villaType,
        people: Number(formData.people),
        status: "pending",
        totalPrice: 0,
        createdAt: new Date()
      });
      alert("Booking successfully submitted! Reference ID: " + docRef.id);
      navigate('/'); // Redirect back to home after successful booking
    } catch {
      alert("An error occurred while booking. Please try again.");
    }
  };

  // Helper for drawer navigation
  const handleNav = (path) => {
    setIsNavOpen(false);
    navigate(path);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-poppins flex flex-col items-center pt-24 pb-12 px-6">

      {/* --- REACTBITS BACKGROUND LAYER --- */}
      <div className="fixed inset-0 -z-10 bg-[#b97216]">
        <MoltenMetal
          colors={["#b97216","#ffffff"]}
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

      {/* --- NAVIGATION DRAWER & BLUR OVERLAY --- */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} bg-black/30 backdrop-blur-xl border-r border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]`}>
        <div className="p-6 flex flex-col h-full">
          <button onClick={() => setIsNavOpen(false)} className="self-end text-white/70 hover:text-white mb-8 transition-colors">
            <X size={24} />
          </button>
          <nav className="flex flex-col gap-6 text-gray-400">
            <button onClick={() => handleNav('/')} className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold">
              <HomeIcon size={20} /> <span className="text-sm">Home</span>
            </button>
            <button onClick={() => handleNav('/#about')} className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold">
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

      {/* Hamburger Menu Button */}
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

      {/* --- PAGE CONTENT --- */}
      <div className="w-full max-w-sm relative z-10 flex flex-col">
        
        {/* Hero Text */}
        <div className="mb-8 drop-shadow-md">
          <h1 className="text-4xl text-white font-light leading-tight mb-4">
            Your private <br/> retreat for <br/> 
            <span className="font-serif italic font-bold">rest and <br/> relaxation.</span>
          </h1>
          <div className="w-16 h-px bg-white mb-4"></div>
          <p className="text-white text-xs font-medium tracking-wide">
            A TRANQUIL AND SECLUDED VILLA <br/> WHERE YOU CAN TRULY UNWIND.
          </p>
        </div>

        {/* Booking Form Card */}
          <div  className="bg-white/95 backdrop-blur-md w-full rounded-4xl p-5 shadow-2xl relative animate-fade-in-up">          
          <button 
            onClick={() => navigate('/')} 
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
                    <SelectField icon={HomeIcon} label="Villa" name="villaType" value={formData.villaType} onChange={handleChange} compact={true} />
                </div>
                <div className="flex-1 min-w-0">
                    <FormField icon={Users} label="People" type="number" name="people" min="1" 
                      max={formData.villaType === 'Main Villa' ? "25" : "10"} value={formData.people} onChange={handleChange} compact={true} />
                </div>
            </div>

            <button 
              type="submit" 
              className="mt-2 w-[150px] bg-[#D4B07A] text-white py-2.5 rounded-full font-medium text-sm shadow-md hover:bg-[#c29f68] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Check size={18} />
              Book Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}