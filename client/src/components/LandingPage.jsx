import balaiBg from '../assets/balaibg.jpg'; 

const LandingPage = () => {
  return (
    <div 
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${balaiBg})` }} 
    >
      {/* Dark gradient overlay to ensure text readability against the bright sky */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content wrapper with z-10 to sit above the overlay */}
      <div className="relative z-10 flex flex-col h-full px-6 py-10">
        
        {/* Top Navigation */}
        <header className="flex justify-between items-center text-white w-full">
          <div className="text-xl font-light tracking-wide">Balai88</div>
          <a href="#about" className="text-sm font-light underline underline-offset-4 hover:text-gray-200 transition">
            About Us
          </a>
        </header>

        {/* Main Hero Content */}
        <main className="flex-1 flex flex-col justify-center mt-12 max-w-lg">
          {/* Main Headline */}
          <h1 className="text-white text-5xl font-serif leading-tight">
            Your private <br />
            retreat for <br />
            <span className="italic font-serif">rest and <br /> relaxation.</span>
          </h1>

          {/* White Divider Line */}
          <hr className="w-full max-w-[280px] border-white my-6 border-t-2" />

          {/* Subheadline */}
          <p className="text-white text-sm font-semibold tracking-widest uppercase leading-relaxed">
            A tranquil and secluded villa <br />
            where you can truly unwind.
          </p>

          {/* Call to Action Button */}
          <button className="mt-8 bg-[#E6BA7A] text-white px-8 py-3 rounded-full font-medium text-lg w-fit shadow-lg hover:bg-[#d4a96b] transition-colors">
            Book Now
          </button>
        </main>
        
      </div>
    </div>
  );
};

export default LandingPage;