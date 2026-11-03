import { useEffect, useState } from 'react';
import { Percent, Bell as LucideBell } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { getActivePromo } from '../../utils/promos';
 
export default function AdminCalendar({ bookings, onOpenNotif, pendingCount }) {
  const [selectedVilla, setSelectedVilla] = useState('Main Villa');
  const [isFullMonthView, setIsFullMonthView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth] = useState(new Date()); 
  const [promos, setPromos] = useState([]);
 
  // Live list of promos from Firestore (collection name must match PromoCreation)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      setPromos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);
 
  // --- Date Math Helpers ---
  const formatYYYYMMDD = (date) => {
    const d = new Date(date);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };
 
  const isSameDay = (date1, date2) => formatYYYYMMDD(date1) === formatYYYYMMDD(date2);
 
  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };
 
  const getMonthDays = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    for (let i = 0; i < date.getDay(); i++) days.push(null);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
 
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
 
  // --- Live Data Calculations ---
  const selectedDateStr = formatYYYYMMDD(selectedDate);
  const activePromo = getActivePromo(promos, selectedDateStr, selectedVilla);
  const todaysSchedule = bookings.filter(b => b.villaType === selectedVilla && (b.checkIn === selectedDateStr || b.checkOut === selectedDateStr));
  
  const hasActivity = (date) => {
    if (!date) return false;
    const dateStr = formatYYYYMMDD(date);
    return bookings.some(b => b.villaType === selectedVilla && (b.checkIn === dateStr || b.checkOut === dateStr));
  };
 
  const weekDays = getWeekDays(selectedDate);
  const monthDays = getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());
 
  return (
    <div className="w-full bg-[#F8F9FA] font-poppins pb-20 animate-fade-in">
      {/* Responsive Container */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-10 lg:pt-14">
        
        {/* Header with Notification Bell */}
        <header className="flex items-center justify-end mb-4 lg:mb-8">
          <button 
            onClick={onOpenNotif} 
            className="relative w-10 h-10 lg:w-12 lg:h-12 bg-[#C98A1E] rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95"
          >
            <LucideBell className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
            {pendingCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 lg:w-3.5 lg:h-3.5 bg-red-500 border-2 border-[#F8F9FA] rounded-full shadow-sm animate-pulse"></span>}
          </button>
        </header>
 
        {/* Title & Villa Toggles (Side by Side on Desktop) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 lg:mb-10 gap-6">
          <div>
            <h2 className="text-[10px] lg:text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Balai 88</h2>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#C98A1E]">Calendar</h1>
          </div>
          
          <div className="flex bg-white rounded-full p-1 shadow-sm w-full lg:w-[400px]">
            {['Main Villa', 'Mini Villa'].map(villa => (
              <button
                key={villa}
                onClick={() => setSelectedVilla(villa)}
                className={`flex-1 py-2.5 lg:py-3 rounded-full text-xs lg:text-sm font-bold transition-all ${
                  selectedVilla === villa ? 'bg-[#C98A1E] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {villa}
              </button>
            ))}
          </div>
        </div>
 
        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Calendar Card */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm h-full">
              <div className="flex justify-between items-center mb-6 lg:mb-8">
                <div>
                  <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">{isFullMonthView ? 'Full Month' : 'This Week'}</p>
                  <h3 className="text-xl lg:text-2xl font-bold text-[#C98A1E]">
                    {monthNames[isFullMonthView ? currentMonth.getMonth() : selectedDate.getMonth()]} {isFullMonthView ? currentMonth.getFullYear() : selectedDate.getFullYear()}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsFullMonthView(!isFullMonthView)}
                  className="px-4 py-2 lg:py-2.5 rounded-full border border-[#C98A1E] text-[#C98A1E] text-[9px] lg:text-[10px] font-bold uppercase tracking-wider bg-[#C98A1E]/10 hover:bg-[#C98A1E] hover:text-white transition-colors"
                >
                  {isFullMonthView ? 'Collapse' : 'View Full'}
                </button>
              </div>
 
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[9px] lg:text-xs font-bold text-gray-400 uppercase">{day}</div>
                ))}
              </div>
 
              {!isFullMonthView ? (
                <div className="grid grid-cols-7 gap-1 lg:gap-2 relative">
                  {weekDays.map((date, i) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const hasDot = hasActivity(date);
                    return (
                      <button 
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center py-3 lg:py-5 rounded-2xl lg:rounded-3xl transition-all ${isSelected ? 'bg-[#C98A1E] text-white shadow-md scale-105' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className="text-lg lg:text-2xl font-bold">{date.getDate()}</span>
                        <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full mt-1.5 lg:mt-2 ${isSelected ? 'bg-white' : hasDot ? 'bg-emerald-500' : 'bg-transparent'}`}></span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 border-t border-l border-gray-100">
                  {monthDays.map((date, i) => {
                    const isSelected = date && isSameDay(date, selectedDate);
                    const hasDot = date && hasActivity(date);
                    return (
                      <button 
                        key={i}
                        onClick={() => date && setSelectedDate(date)}
                        disabled={!date}
                        className={`h-16 lg:h-24 border-b border-r border-gray-100 flex flex-col items-center pt-2 lg:pt-4 relative ${!date ? 'bg-gray-50' : 'hover:bg-gray-50'} ${isSelected ? 'bg-orange-50' : ''}`}
                      >
                        {date && (
                          <>
                            <span className={`text-xs lg:text-sm font-bold ${isSelected ? 'w-7 h-7 lg:w-9 lg:h-9 bg-[#C98A1E] text-white rounded-full flex items-center justify-center shadow-sm' : 'text-gray-700'}`}>
                              {date.getDate()}
                            </span>
                            {hasDot && <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500 mt-1.5 absolute bottom-2 lg:bottom-4"></span>}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
 
          {/* Right Column: Daily Schedule */}
          <div className="lg:col-span-5 xl:col-span-4">
            <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Daily Schedule</p>
            <h3 className="text-lg lg:text-xl font-medium text-gray-400 mb-4 lg:mb-6">
              <span className="font-bold text-[#C98A1E]">{dayNames[selectedDate.getDay()]}</span> {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
            </h3>
 
            <div className="space-y-4">
              {activePromo && (
                <div className="bg-[#FDF3E1] border border-[#F5E1C8] rounded-3xl p-5 lg:p-6 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#F5D8A9] flex items-center justify-center shrink-0 shadow-inner">
                    <Percent size={20} className="text-[#967444]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 lg:mb-1">Active Promo</p>
                    <p className="truncate text-sm lg:text-base font-bold text-gray-900">{activePromo.title}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border border-emerald-200 shadow-sm">
                    {activePromo.discountType === 'percentage'
                      ? `${activePromo.discountValue}% OFF`
                      : `₱${activePromo.discountValue} OFF`}
                  </span>
                </div>
              )}
 
              {todaysSchedule.length === 0 ? (
                <p className="text-xs lg:text-sm text-gray-400 text-center py-10 lg:py-12 border-2 border-dashed border-gray-300 rounded-3xl font-medium bg-white/50">No check-ins or check-outs today.</p>
              ) : (
                todaysSchedule.map((booking) => {
                  const isCheckIn = booking.checkIn === selectedDateStr;
                  const initials = booking.guestName ? booking.guestName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                  
                  return (
                    <div key={booking.id} className="bg-white rounded-3xl p-5 lg:p-6 flex items-center shadow-sm border border-gray-50 hover:border-orange-100 transition-colors">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#C98A1E] flex items-center justify-center mr-4 shrink-0 text-white font-bold text-sm lg:text-base shadow-inner">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 lg:mb-1">
                          {isCheckIn ? 'Check In • 3:00 PM' : 'Check Out • 12:00 NN'}
                        </p>
                        <p className="text-sm lg:text-base font-bold text-gray-900 mb-0.5 lg:mb-1">{booking.guestName}</p>
                        <p className="text-[10px] lg:text-xs text-neutral-500 font-medium">{booking.people} Pax</p>
                      </div>
                      <span className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                        isCheckIn ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-transparent text-gray-800 border-gray-200'
                      }`}>
                        {isCheckIn ? 'Confirmed' : 'Departing'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}