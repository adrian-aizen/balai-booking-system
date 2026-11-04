import React from 'react';
import { LayoutGrid, CalendarDays, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminNavbar = ({ currentView, setView, isNavOpen, setIsNavOpen }) => {
  const navItems = [
    { id: 'home', icon: LayoutGrid },
    { id: 'calendar', icon: CalendarDays },
    { id: 'promos', icon: Tag },
  ];

  return (
    <>
      {/* Collapsed State Tab (Mobile Only) */}
      {!isNavOpen && (
        <button 
          onClick={() => setIsNavOpen(true)}
          className="fixed top-1/2 left-0 -translate-y-1/2 z-40 lg:hidden bg-white shadow-[4px_0_15px_rgba(0,0,0,0.08)] rounded-r-2xl py-3 px-1.5 border border-l-0 border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={24} className="text-[#C98A1E] stroke-[2.5px]" />
        </button>
      )}

      {/* Mobile Backdrop Overlay */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      {/* The Sidebar */}
      <nav className={`fixed z-50 bg-white shadow-[4px_0_20px_rgba(0,0,0,0.02)]
        top-0 left-0 h-screen w-24 flex flex-col justify-start items-center gap-6 py-8 border-r border-gray-100 transition-transform duration-300
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        
        {/* Collapse Arrow (Mobile) */}
        <div className="flex lg:hidden w-full justify-center mb-6">
          <button 
            onClick={() => setIsNavOpen(false)}
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
          >
            <ChevronLeft size={18} className="text-gray-400 stroke-[2.5px]" />
          </button>
        </div>

        {/* Decorative Top Arrow (Desktop) */}
        <div className="hidden lg:flex w-full justify-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
            <ChevronRight size={18} className="text-gray-400 stroke-[2.5px]" />
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsNavOpen(false); // Auto-closes sidebar after selection on mobile
                }}
                className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-[#FDF3E1] scale-105' : 'bg-transparent hover:bg-gray-50'
                }`}
              >
                <Icon 
                  size={24} 
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-[#C98A1E] stroke-[2.5px]' : 'text-gray-400 stroke-[2px] hover:text-gray-600'
                  }`} 
                />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;