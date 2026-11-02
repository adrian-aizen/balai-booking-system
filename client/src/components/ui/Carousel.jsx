import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({ children }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group w-full">
      {/* Left Arrow */}
      <button 
        onClick={() => scroll('left')} 
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-6 z-10 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-[#C98A1E] opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      
      {/* Scrollable Track */}
      <div 
        ref={scrollRef} 
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {children}
      </div>

      {/* Right Arrow */}
      <button 
        onClick={() => scroll('right')} 
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-6 z-10 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-[#C98A1E] opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}