import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home as HomeIcon, TreePine, CalendarDays, LogIn, Leaf, Sparkles, ArrowUpRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Carousel from '../ui/Carousel';
import bgImage from '../../assets/balaibg.jpg';
import LoginModal from '../ui/LoginModal';

export default function LandingPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 
  
  const [activeSection, setActiveSection] = useState('home');
  
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'booking'];
      let current = 'home';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { top } = element.getBoundingClientRect();
          if (top <= window.innerHeight / 2) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsNavOpen(false);
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // UPDATED: Standardized colors so mobile uses the same dark theme as desktop
  const getNavLinkClass = (section) => {
    const isActive = activeSection === section;
    return `flex items-center gap-3 p-3 lg:p-0 rounded-xl lg:rounded-none transition-colors ${
      isActive 
        ? 'text-white font-semibold' 
        : 'text-gray-400 hover:text-white'
    }`;
  };

  const mainVillaImages = [
    { id: 1, src: '/main/Main1.jpg', alt: 'Main Villa 1' },
    { id: 2, src: '/main/Main2.jpg', alt: 'Main Villa 2' },
    { id: 3, src: '/main/Main3.jpg', alt: 'Main Villa 3' },
    { id: 4, src: '/main/Main4.jpg', alt: 'Main Villa 4' },
    { id: 5, src: '/main/Main5.jpg', alt: 'Main Villa 5' },
    { id: 6, src: '/main/Main6.jpg', alt: 'Main Villa 6' },
    { id: 7, src: '/main/Main7.jpg', alt: 'Main Villa 7' },
    { id: 8, src: '/main/Main8.jpg', alt: 'Main Villa 2' },
    { id: 9, src: '/main/Main9.jpg', alt: 'Main Villa 3' },
    { id: 10, src: '/main/Main10.jpg', alt: 'Main Villa 4' },
    { id: 11, src: '/main/Main11.jpg', alt: 'Main Villa 5' },
    { id: 12, src: '/main/Main12.jpg', alt: 'Main Villa 6' },
    { id: 13, src: '/main/Main13.jpg', alt: 'Main Villa 7' },
    { id: 14, src: '/main/Main14.jpg', alt: 'Main Villa 6' },
    { id: 15, src: '/main/Main15.jpg', alt: 'Main Villa 7' },
    { id: 16, src: '/main/Main16.jpg', alt: 'Main Villa 2' },
    { id: 17, src: '/main/Main17.jpg', alt: 'Main Villa 3' },
    { id: 18, src: '/main/Main18.jpg', alt: 'Main Villa 4' },
    { id: 19, src: '/main/Main19.jpg', alt: 'Main Villa 5' },
    { id: 20, src: '/main/Main20.jpg', alt: 'Main Villa 6' },
    { id: 21, src: '/main/Main21.jpg', alt: 'Main Villa 7' },
  ];

  const miniVillaImages = [
    { id: 1, src: '/mini/Mini1.jpg', alt: 'Mini Villa 1' },
    { id: 2, src: '/mini/Mini2.jpg', alt: 'Mini Villa 2' },
    { id: 3, src: '/mini/Mini3.jpg', alt: 'Mini Villa 3' },
    { id: 4, src: '/mini/Mini4.jpg', alt: 'Mini Villa 4' },
    { id: 5, src: '/mini/Mini5.jpg', alt: 'Mini Villa 5' },
    { id: 6, src: '/mini/Mini6.jpg', alt: 'Mini Villa 1' },
    { id: 7, src: '/mini/Mini7.jpg', alt: 'Mini Villa 2' },
    { id: 8, src: '/mini/Mini8.jpg', alt: 'Mini Villa 3' },
    { id: 9, src: '/mini/Mini9.jpg', alt: 'Mini Villa 4' },
    { id: 10, src: '/mini/Mini10.jpg', alt: 'Mini Villa 5' },
    { id: 11, src: '/mini/Mini11.jpg', alt: 'Mini Villa 1' },
    { id: 12, src: '/mini/Mini12.jpg', alt: 'Mini Villa 2' },
    { id: 13, src: '/mini/Mini13.jpg', alt: 'Mini Villa 3' },
    { id: 14, src: '/mini/Mini14.jpg', alt: 'Mini Villa 5' },
  ];

  return (
    <div className="relative w-full bg-[#F8F9FA] min-h-screen overflow-x-hidden font-poppins">
      
      {/* --- STICKY BURGER MENU --- */}
      <button 
        onClick={() => setIsNavOpen(true)}
        className="fixed top-6 left-6 lg:top-8 lg:left-10 z-[45] p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-black/40 transition-all"
      >
        <Menu size={24} />
      </button>

      {/* --- FULL-SCREEN IMAGE MODAL --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 lg:p-12 animate-fade-in cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)} 
            className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white/70 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full screen view" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-fade-in-up cursor-default" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* --- NAVIGATION DRAWER BACKGROUND OVERLAY --- */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      {/* UPDATED: Removed bg-white so mobile uses the sleek dark glassmorphism */}
      <div className={`fixed top-0 left-0 h-full w-64 z-[60] transform transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} bg-black/30 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-end items-center mb-8">
            <button onClick={() => setIsNavOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-4 lg:gap-6 text-gray-400 font-normal">
            <button onClick={() => scrollToSection('home')} className={getNavLinkClass('home')}>
              <HomeIcon size={20} /> <span className="text-sm">Home</span>
            </button>
            <button onClick={() => scrollToSection('about')} className={getNavLinkClass('about')}>
              <TreePine size={20} /> <span className="text-sm">About Us</span>
            </button>
            <button onClick={() => navigate('/booking')} className={getNavLinkClass('booking')}>
              <CalendarDays size={20} /> <span className="text-sm">Book Now</span>
            </button>
            
            <div className="lg:hidden w-full h-px bg-white/10 my-2"></div>
            
            <button 
              onClick={() => { setIsNavOpen(false); setIsLoginOpen(true); }} 
              className="flex items-center gap-3 p-3 lg:p-0 rounded-xl lg:rounded-none hover:text-white transition-colors lg:mt-4 text-gray-400"
            >
              <LogIn size={20} /> <span className="text-sm">Admin Access</span>
            </button>
          </nav>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* --- 1. HERO SECTION --- */}
      <section id="home" ref={heroRef} className="relative h-screen w-full flex flex-col justify-center lg:justify-between overflow-hidden lg:px-16 xl:px-24">
        
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ scale: backgroundScale }}
        >
          <img 
            src={bgImage} 
            alt="Balai 88 Pool" 
            className="w-full h-full object-cover lg:brightness-95"
          />
          <div className="absolute inset-0 bg-black/30 lg:bg-gradient-to-b lg:from-black/40 lg:via-transparent lg:to-black/50"></div>
        </motion.div>
        
        <div className="absolute inset-x-0 bottom-0 h-[40%] lg:h-[35%] bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/90 to-transparent z-0 pointer-events-none"></div>

        <motion.div className="relative z-10 px-8 lg:px-0 flex flex-col lg:flex-row lg:justify-between lg:items-end w-full h-full pb-16 lg:pb-20 pt-20 lg:pt-0" style={{ opacity: textOpacity }}>
          
          <div className="max-w-2xl flex flex-col justify-center h-full w-full lg:pb-12">

            <h1 className="text-[2.75rem] lg:text-[4rem] text-white font-light leading-[1.05] mb-2 lg:mb-6 drop-shadow-md mt-auto lg:mt-0">
              Your private <br/>
              retreat for <br/>
              <span className="font-serif italic font-bold text-white">rest and <br className="lg:hidden"/> relaxation.</span>
            </h1>

            <div className="w-[85%] h-px bg-white mb-2 drop-shadow-md lg:hidden"></div>

            <p className="text-white text-[10px] lg:text-base max-w-md font-medium tracking-wide lg:tracking-normal mb-6 lg:mb-0 drop-shadow-md uppercase lg:normal-case lg:leading-relaxed">
              A tranquil and secluded villa <br className="hidden lg:block"/> where you can truly unwind.
            </p>

            <div className="flex lg:hidden items-center gap-3 mb-auto">
              <button 
                onClick={() => navigate('/booking')} 
                className="bg-[#C98A1E] text-white px-6 py-2.5 rounded-full text-[13px] font-medium hover:bg-[#b57a18] transition-colors shadow-lg flex items-center gap-2"
              >
                Book Your Stay
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0 mb-2">
            <button 
              onClick={() => navigate('/booking')} 
              className="bg-[#C98A1E] text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-[#b57a18] transition-colors shadow-lg shadow-[#C98A1E]/20 mt-8"
            >
              Book Your Stay
            </button>
          </div>
        </motion.div>
      </section>

      {/* --- 2. ABOUT US SECTION --- */}
      <section id="about" className="px-6 lg:px-16 pt-16 lg:pt-24 pb-8 lg:pb-16 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="lg:w-1/3">
            <h2 className="text-4xl lg:text-5xl text-gray-900 font-light mb-4 lg:mb-6 leading-tight">
              Discover True <br/> <span className="font-serif italic font-bold text-[#C98A1E]">Tranquility.</span>
            </h2>
            <p className="text-sm lg:text-base text-gray-600 mb-8 lg:leading-relaxed">
              Step away from the noise and step into serenity. Balai 88 is thoughtfully designed for those seeking a peaceful escape, offering complete seclusion in a beautiful, tranquil setting.
            </p>
          </div>

          <div className="lg:w-2/3 flex flex-col gap-12">
            <div>
              <h3 className="text-sm lg:text-base font-bold uppercase tracking-widest text-gray-800 mb-6 pl-4 border-l-2 border-[#C98A1E]">Main Villa</h3>
              <Carousel>
                {mainVillaImages.map((img) => (
                  <div 
                    key={img.id} 
                    onClick={() => setSelectedImage(img.src)} 
                    className="w-40 h-52 lg:w-48 lg:h-64 shrink-0 rounded-[2rem] overflow-hidden shadow-sm transition-transform hover:scale-[1.02] cursor-zoom-in snap-center"
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </Carousel>
            </div>

            <div>
              <h3 className="text-sm lg:text-base font-bold uppercase tracking-widest text-gray-800 mb-6 pl-4 border-l-2 border-[#C98A1E]">Mini Villa</h3>
              <Carousel>
                {miniVillaImages.map((img) => (
                  <div 
                    key={img.id} 
                    onClick={() => setSelectedImage(img.src)} 
                    className="w-40 h-52 lg:w-48 lg:h-64 shrink-0 rounded-[2rem] overflow-hidden shadow-sm transition-transform hover:scale-[1.02] cursor-zoom-in snap-center"
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. FINAL/BOOKING SECTION --- */}
      <section id="booking" className="px-6 lg:px-16 pt-8 lg:pt-16 pb-16 lg:pb-24 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="lg:w-1/2">
            <p className="text-xs lg:text-sm text-[#C98A1E] font-bold tracking-widest uppercase mb-4">
              Find the ideal spot
            </p>
            <h2 className="text-3xl lg:text-4xl text-gray-900 font-medium leading-snug mb-8 lg:mb-12">
              Experience a secluded villa retreat where every detail inspires rest.
            </h2>

            <div className="flex flex-col gap-4 lg:gap-6 mb-8 lg:mb-10">
              <div className="flex items-center gap-5 bg-white p-4 lg:p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-[#C98A1E]/10 flex items-center justify-center shrink-0">
                   <HomeIcon size={20} className="text-[#C98A1E]" />
                </div>
                <span className="text-gray-800 font-bold lg:text-lg">Exclusive Villa Access</span>
              </div>
              <div className="flex items-center gap-5 bg-white p-4 lg:p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-[#C98A1E]/10 flex items-center justify-center shrink-0">
                   <Leaf size={20} className="text-[#C98A1E]" />
                </div>
                <span className="text-gray-800 font-bold lg:text-lg">Tranquil Environment</span>
              </div>
              <div className="flex items-center gap-5 bg-white p-4 lg:p-5 rounded-2xl shadow-sm border border-gray-100">
                 <div className="w-12 h-12 rounded-xl bg-[#C98A1E]/10 flex items-center justify-center shrink-0">
                   <Sparkles size={20} className="text-[#C98A1E]" />
                 </div>
                <span className="text-gray-800 font-bold lg:text-lg">Curated Relaxation</span>
              </div>
            </div>
            
            <button onClick={() => navigate('/booking')} className="hidden lg:block bg-[#C98A1E] text-white px-10 py-4 rounded-full text-base font-bold hover:bg-[#b57a18] transition-colors shadow-lg shadow-[#C98A1E]/20 mt-8">
              Book Your Stay
            </button>
          </div>

          <div className="w-full lg:w-1/2 h-[300px] lg:h-[600px] bg-white rounded-[2rem] lg:rounded-[3rem] shadow-xl overflow-hidden relative group">
            <img src={bgImage} alt="Overall Balai 88" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          </div>

          <button onClick={() => navigate('/booking')} className="lg:hidden w-full bg-[#C98A1E] text-white px-6 py-4 rounded-full text-sm font-bold shadow-lg flex items-center justify-center gap-2">
            Book Your Stay
          </button>
          
        </div>
      </section>
    </div>
  );
}