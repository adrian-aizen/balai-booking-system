import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home as HomeIcon, TreePine, CalendarDays, LogIn, Leaf, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Carousel from '../ui/Carousel';
import bgImage from '../../assets/balaibg.jpg';
import LoginModal from '../ui/LoginModal';

export default function LandingPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // <-- ADDED: State for the modal
  const heroRef = useRef(null);
  const navigate = useNavigate();
  
  // Scroll-Expand Effect Logic
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollToSection = (id) => {
    setIsNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Hardcoded Image Arrays
  const mainVillaImages = [
    { id: 1, src: '/main/Main1.jpg', alt: 'Main Villa 1' },
    { id: 2, src: '/main/Main2.jpg', alt: 'Main Villa 2' },
    { id: 3, src: '/main/Main3.jpg', alt: 'Main Villa 3' },
    { id: 4, src: '/main/Main4.jpg', alt: 'Main Villa 4' },
    { id: 5, src: '/main/Main5.jpg', alt: 'Main Villa 5' },
    { id: 6, src: '/main/Main6.jpg', alt: 'Main Villa 6' },
    { id: 7, src: '/main/Main7.jpg', alt: 'Main Villa 7' },
    { id: 8, src: '/main/Main8.jpg', alt: 'Main Villa 8' },
    { id: 9, src: '/main/Main9.jpg', alt: 'Main Villa 9' },
    { id: 10, src: '/main/Main10.jpg', alt: 'Main Villa 10' },
    { id: 11, src: '/main/Main11.jpg', alt: 'Main Villa 11' },
    { id: 12, src: '/main/Main12.jpg', alt: 'Main Villa 12' },
    { id: 13, src: '/main/Main13.jpg', alt: 'Main Villa 13' },
    { id: 14, src: '/main/Main14.jpg', alt: 'Main Villa 14' },
    { id: 15, src: '/main/Main15.jpg', alt: 'Main Villa 15' },
    { id: 16, src: '/main/Main16.jpg', alt: 'Main Villa 16' },
    { id: 17, src: '/main/Main17.jpg', alt: 'Main Villa 17' },
    { id: 18, src: '/main/Main18.jpg', alt: 'Main Villa 18' },
    { id: 19, src: '/main/Main19.jpg', alt: 'Main Villa 19' },
    { id: 20, src: '/main/Main20.jpg', alt: 'Main Villa 20' },
    { id: 21, src: '/main/Main21.jpg', alt: 'Main Villa 21' }
  ];

  const miniVillaImages = [
    { id: 1, src: '/mini/Mini1.jpg', alt: 'Mini Villa 1' },
    { id: 2, src: '/mini/Mini2.jpg', alt: 'Mini Villa 2' },
    { id: 3, src: '/mini/Mini3.jpg', alt: 'Mini Villa 3' },
    { id: 4, src: '/mini/Mini4.jpg', alt: 'Mini Villa 4' },
    { id: 5, src: '/mini/Mini5.jpg', alt: 'Mini Villa 5' },
    { id: 6, src: '/mini/Mini6.jpg', alt: 'Mini Villa 6' },
    { id: 7, src: '/mini/Mini7.jpg', alt: 'Mini Villa 7' },
    { id: 8, src: '/mini/Mini8.jpg', alt: 'Mini Villa 8' },
    { id: 9, src: '/mini/Mini9.jpg', alt: 'Mini Villa 9' },
    { id: 10, src: '/mini/Mini10.jpg', alt: 'Mini Villa 10' },
    { id: 11, src: '/mini/Mini11.jpg', alt: 'Mini Villa 11' },
    { id: 12, src: '/mini/Mini12.jpg', alt: 'Mini Villa 12' },
    { id: 13, src: '/mini/Mini13.jpg', alt: 'Mini Villa 13' },
    { id: 14, src: '/mini/Mini14.jpg', alt: 'Mini Villa 14' }
  ];

  return (
    <div className="relative w-full bg-[#F3F4F6] min-h-screen overflow-x-hidden font-poppins">
      
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
            <button onClick={() => scrollToSection('home')} className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold">
              <HomeIcon size={20} /> <span className="text-sm">Home</span>
            </button>
            <button onClick={() => scrollToSection('about')} className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold">
              <TreePine size={20} /> <span className="text-sm">About Us</span>
            </button>
            <button onClick={() => scrollToSection('booking')} className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold">
              <CalendarDays size={20} /> <span className="text-sm">Book Now</span>
            </button>
            {/* CHANGED: Opens the modal and closes the drawer */}
            <button 
              onClick={() => {
                setIsNavOpen(false);
                setIsLoginOpen(true);
              }} 
              className="flex items-center gap-3 hover:text-white transition-colors focus:text-white focus:font-semibold mt-4"
            >
              <LogIn size={20} /> <span className="text-sm">Sign In</span>
            </button>
          </nav>
        </div>
      </div>

      {/* ADDED: Login Modal Instance */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />

      {/* --- 1. HERO SECTION --- */}
      <section id="home" ref={heroRef} className="relative h-screen w-full overflow-hidden flex flex-col justify-center px-8">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ scale: backgroundScale }}
        >
          <img 
            src={bgImage} 
            alt="Balai 88 Pool" 
            className="w-full h-full object-cover brightness-75"
          />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#F3F4F6] via-[#F3F4F6]/70 to-transparent z-0 pointer-events-none"></div>

        <button 
          onClick={() => setIsNavOpen(true)}
          className="fixed top-6 left-6 z-40 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-black/40 transition-all"
        >
          <Menu size={24} />
        </button>

        <motion.div className="relative z-10" style={{ opacity: textOpacity }}>
          <h1 className="text-4xl text-white font-light leading-tight mb-4 drop-shadow-md">
            Your private <br/> retreat for <br/> 
            <span className="font-serif italic font-bold">rest and <br/> relaxation.</span>
          </h1>
          <div className="w-16 h-px bg-white mb-4 drop-shadow-md"></div>
          <p className="text-white text-xs font-medium tracking-wide mb-8 drop-shadow-md">
            A TRANQUIL AND SECLUDED VILLA <br/> WHERE YOU CAN TRULY UNWIND.
          </p>
          <button onClick={() => navigate('/booking')} className="bg-[#D4B07A] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c29f68] transition-colors shadow-lg">
            Book Your Stay →
          </button>
        </motion.div>
      </section>

      {/* --- 2. ABOUT US SECTION --- */}
        <section id="about" className="px-6 pt-16 pb-8 bg-[#F3F4F6]">        <h2 className="text-4xl text-gray-900 font-light mb-4">
          Discover True <br/> <span className="font-serif italic font-bold">Tranquility.</span>
        </h2>
        <p className="text-sm text-gray-600 mb-8">
          Rest, relax, and recharge in our peaceful hideaway.
        </p>

       {/* Main Villa Carousel */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 pl-2 border-l-2 border-[#D4B07A]">Main Villa</h3>
          <div className="w-full relative">
             <Carousel>
               {mainVillaImages.map((img) => (
                 <div key={img.id} className="w-28 h-36 shrink-0 rounded-2xl overflow-hidden shadow-md">
                   <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                 </div>
               ))}
             </Carousel>
          </div>
        </div>

        {/* Mini Villa Carousel */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 pl-2 border-l-2 border-[#D4B07A]">Mini Villa</h3>
          <div className="w-full relative">
             <Carousel>
               {miniVillaImages.map((img) => (
                 <div key={img.id} className="w-28 h-36 shrink-0 rounded-2xl overflow-hidden shadow-md">
                   <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                 </div>
               ))}
             </Carousel>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-8 leading-relaxed">
          Step away from the noise and step into serenity. Balai 88 is thoughtfully designed for those seeking a peaceful escape, offering complete seclusion in a beautiful, tranquil setting.
        </p>
      </section>

      {/* --- 3. FINAL/BOOKING SECTION --- */}
        <section id="booking" className="px-6 pt-4 pb-16 bg-[#F3F4F6]">        <p className="text-xs text-gray-500 font-medium mb-4">
          Find the ideal spot for your relaxation.
        </p>
        <h2 className="text-2xl text-gray-900 font-medium leading-snug mb-8">
          Designed for absolute peace and connection. Experience a secluded villa retreat where every detail inspires rest and relaxation.
        </h2>

        {/* Bullet Points with Updated Icons */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#D4B07A]/40 flex items-center justify-center shrink-0">
               <HomeIcon size={18} className="text-[#967444]" />
            </div>
            <span className="text-gray-800 font-medium">Exclusive Villa Access</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#D4B07A]/60 flex items-center justify-center shrink-0">
               <Leaf size={18} className="text-[#967444]" />
            </div>
            <span className="text-gray-800 font-medium">Tranquil Environment</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-[#D4B07A]/80 flex items-center justify-center shrink-0">
               <Sparkles size={18} className="text-[#967444]" />
             </div>
            <span className="text-gray-800 font-medium">Curated Relaxation</span>
          </div>
        </div>

        <div className="w-full h-64 bg-white rounded-2xl shadow-sm mb-8 overflow-hidden">
          <img src={bgImage} alt="Overall Balai 88" className="w-full h-full object-cover" />        </div>

        <button onClick={() => navigate('/booking')} className="bg-[#D4B07A] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#c29f68] transition-colors shadow-lg">
          Book Your Stay →
        </button>
      </section>

    </div>
  );
}