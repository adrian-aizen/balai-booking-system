import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Carousel({ children }) {
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Calculates how far the carousel can scroll based on the number of images
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [children]);

  return (
    <div ref={carouselRef} className="cursor-grab overflow-hidden w-full h-full rounded-2xl">
      <motion.div 
        drag="x" 
        dragConstraints={{ right: 0, left: -width }}
        whileTap={{ cursor: "grabbing" }}
        className="flex flex-nowrap gap-4 w-max"
      >
        {children}
      </motion.div>
    </div>
  );
}