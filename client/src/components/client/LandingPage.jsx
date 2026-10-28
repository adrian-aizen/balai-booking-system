import { useState } from 'react';
import balaiBg from "../../assets/balaibg.jpg";
import BookingForm from './BookingForm'; // Import the new form

const LandingPage = () => {
  // State to track if the booking form should be visible
  const [showForm, setShowForm] = useState(false);

  return (
    <div 
      className="relative h-screen w-full bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${balaiBg})` }} 
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex flex-col h-full px-6 py-10 overflow-y-auto">
        
        <header className="flex justify-between items-center text-white w-full">
          <div className="text-xl font-light tracking-wide">Balai88</div>
          <a href="#about" className="text-sm font-light underline underline-offset-4 hover:text-gray-200 transition">
            About Us
          </a>
        </header>

        <main className="flex-1 flex flex-col justify-center mt-12 max-w-lg relative">
          
          <h1 className="text-white text-5xl font-serif leading-tight">
            Your private <br />
            retreat for <br />
            <span className="italic font-serif">rest and <br /> relaxation.</span>
          </h1>

          <hr className="w-full max-w-70 border-white my-6 border-t-2" />

          <p className="text-white text-sm font-semibold tracking-widest uppercase leading-relaxed">
            A tranquil and secluded villa <br />
            where you can truly unwind.
          </p>

          {/* Conditional Rendering: Show Button OR Form */}
          {!showForm ? (
            <button 
              onClick={() => setShowForm(true)} 
              className="mt-8 bg-[#E6BA7A] text-white px-8 py-3 rounded-full font-medium text-lg w-fit shadow-lg hover:bg-[#d4a96b] transition-colors"
            >
              Book Now
            </button>
          ) : (
            // The Form Component
            <div className="mt-8">
               <BookingForm onClose={() => setShowForm(false)} />
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
};

export default LandingPage;