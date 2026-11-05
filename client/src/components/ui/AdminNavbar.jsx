import React from 'react';
import { LayoutGrid, CalendarDays, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
 
// isNavOpen / setIsNavOpen   -> the slide-in drawer on phones and tablets
// isCollapsed / setIsCollapsed -> icons-only vs. icons + labels on laptops and up
const AdminNavbar = ({
  currentView,
  setView,
  isNavOpen,
  setIsNavOpen,
  isCollapsed = true,
  setIsCollapsed,
}) => {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'promos', label: 'Promos', icon: Tag },
  ];
 
  return (
    <>
      {/* Collapsed State Tab (Mobile Only) */}
      {!isNavOpen && (
        <button
          onClick={() => setIsNavOpen?.(true)}
          aria-label="Open menu"
          className="fixed top-1/2 left-0 -translate-y-1/2 z-40 lg:hidden bg-white shadow-[4px_0_15px_rgba(0,0,0,0.08)] rounded-r-2xl py-3 px-1.5 border border-l-0 border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={24} className="text-[#C98A1E] stroke-[2.5px]" />
        </button>
      )}
 
      {/* Mobile Backdrop Overlay */}
      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsNavOpen?.(false)}
        />
      )}
 
      {/* The Sidebar */}
      <nav
        className={`fixed z-50 bg-white shadow-[4px_0_20px_rgba(0,0,0,0.02)]
        top-0 left-0 h-screen w-24 ${isCollapsed ? 'lg:w-24' : 'lg:w-64'} flex flex-col justify-start items-center gap-6 py-8 border-r border-gray-100 transition-all duration-300
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
 
        {/* Collapse Arrow (Mobile) */}
        <div className="flex lg:hidden w-full justify-center mb-6">
          <button
            onClick={() => setIsNavOpen?.(false)}
            aria-label="Close menu"
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
          >
            <ChevronLeft size={18} className="text-gray-400 stroke-[2.5px]" />
          </button>
        </div>
 
        {/* Expand / collapse arrow (Desktop) */}
        <div className={`hidden lg:flex w-full mb-6 ${isCollapsed ? 'justify-center' : 'justify-end px-5'}`}>
          <button
            type="button"
            onClick={() => setIsCollapsed?.(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={18} className="text-gray-400 stroke-[2.5px]" />
            ) : (
              <ChevronLeft size={18} className="text-gray-400 stroke-[2.5px]" />
            )}
          </button>
        </div>
 
        <div className={`flex flex-col gap-4 items-center ${isCollapsed ? '' : 'lg:w-full lg:items-stretch lg:px-4'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
 
            return (
              <button
                key={item.id}
                aria-label={item.label}
                title={item.label}
                onClick={() => {
                  setView(item.id);
                  setIsNavOpen?.(false); // Auto-closes the drawer after selection on mobile
                }}
                className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                  isCollapsed ? '' : 'lg:w-full lg:justify-start lg:gap-4 lg:px-4'
                } ${isActive ? 'bg-[#FDF3E1] scale-105' : 'bg-transparent hover:bg-gray-50'}`}
              >
                <Icon
                  size={24}
                  className={`shrink-0 transition-colors duration-300 ${
                    isActive ? 'text-[#C98A1E] stroke-[2.5px]' : 'text-gray-400 stroke-[2px] hover:text-gray-600'
                  }`}
                />
                {!isCollapsed && (
                  <span className={`hidden lg:inline text-sm font-semibold ${isActive ? 'text-[#C98A1E]' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
 
export default AdminNavbar;