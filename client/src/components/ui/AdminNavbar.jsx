import { useState } from 'react';
import { LayoutDashboard, CalendarDays, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import balaiLogo from '../../assets/BalaiLogo.svg';

export default function AdminNavbar({ currentView, setView }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'promos', label: 'Promos', icon: Tag },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 z-50 flex flex-col ${
        isExpanded ? 'w-64' : 'w-24'
      }`}
    >
      {/* Header & Toggle */}
      <div className={`pt-8 pb-6 px-6 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} border-b border-gray-50`}>
        {isExpanded && (
          <img src={balaiLogo} alt="Balai 88 Logo" className="h-10 w-auto object-contain" />
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#C98A1E] hover:bg-orange-50 transition-colors shrink-0"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-8 px-4 flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all w-full
                ${isActive 
                  ? 'bg-[#C98A1E]/10 text-[#C98A1E]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }
                ${isExpanded ? 'justify-start' : 'justify-center'}
              `}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#C98A1E]' : ''} />
              {isExpanded && (
                <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}