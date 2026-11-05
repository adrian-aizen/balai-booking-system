import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Percent, Bell as LucideBell, ChevronLeft, ChevronRight, User, Mail, Phone, CalendarDays, X } from 'lucide-react';

export default function AdminCalendar({ bookings = [], onOpenNotif, pendingCount = 0 }) {
  const [selectedVilla, setSelectedVilla] = useState('Main Villa');
  const [isFullMonthView, setIsFullMonthView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [promos, setPromos] = useState([]);

  // Live list of promos from Firestore (collection name must match PromoCreation.jsx)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      setPromos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  const handlePrev = () => {
    if (isFullMonthView) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 7);
      setSelectedDate(newDate);
      setCurrentMonth(newDate); 
    }
  };

  const handleNext = () => {
    if (isFullMonthView) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 7);
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
    }
  };

  const formatYYYYMMDD = (date) => {
    const d = new Date(date);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };

  // SUPER SAFE DATE FORMATTER
  const formatMMDDYYYY = (dateVal) => {
    if (!dateVal) return 'N/A';
    // If it's a Firebase Timestamp, convert it. Otherwise, ensure it's a string.
    const dateStr = typeof dateVal.toDate === 'function' ? formatYYYYMMDD(dateVal.toDate()) : String(dateVal);
    if (!dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${m}/${d}/${y}`;
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

  const selectedDateStr = formatYYYYMMDD(selectedDate);
  
  // Safe filtering
  const todaysSchedule = bookings.filter(b => {
    const inStr = typeof b.checkIn?.toDate === 'function' ? formatYYYYMMDD(b.checkIn.toDate()) : String(b.checkIn || '');
    const outStr = typeof b.checkOut?.toDate === 'function' ? formatYYYYMMDD(b.checkOut.toDate()) : String(b.checkOut || '');
    return b.villaType === selectedVilla && (inStr === selectedDateStr || outStr === selectedDateStr);
  });
  
  // Promo dates are saved as YYYY-MM-DD text (or a Firestore Timestamp)
  const toDateStr = (v) => (typeof v?.toDate === 'function' ? formatYYYYMMDD(v.toDate()) : String(v || ''));

  // Every active promo that covers this day for the selected villa
  const promosOnDate = (dateStr) =>
    promos.filter((p) =>
      p.active !== false &&
      p.startDate && p.endDate &&
      toDateStr(p.startDate) <= dateStr &&
      dateStr <= toDateStr(p.endDate) &&
      (!p.villaType || p.villaType === 'all' || p.villaType === selectedVilla)
    );
  const selectedDayPromos = promosOnDate(selectedDateStr);

  const getDayActivities = (date) => {
    if (!date) return { hasCheckIn: false, hasCheckOut: false, hasPromo: false };
    const dateStr = formatYYYYMMDD(date);
    return {
      hasCheckIn: bookings.some(b => {
        const inStr = typeof b.checkIn?.toDate === 'function' ? formatYYYYMMDD(b.checkIn.toDate()) : String(b.checkIn || '');
        return b.villaType === selectedVilla && inStr === dateStr;
      }),
      hasCheckOut: bookings.some(b => {
        const outStr = typeof b.checkOut?.toDate === 'function' ? formatYYYYMMDD(b.checkOut.toDate()) : String(b.checkOut || '');
        return b.villaType === selectedVilla && outStr === dateStr;
      }),
      hasPromo: promosOnDate(dateStr).length > 0
    };
  };

  const weekDays = getWeekDays(selectedDate);
  const monthDays = getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <div className="w-full bg-[#F8F9FA] font-poppins pb-20 animate-fade-in">
      
      {/* UPDATED: Booking Details Modal Overlay (Scrollable for future Edit form) */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-none animate-fade-in"
          onClick={() => setSelectedBooking(null)}
        >
          {/* min-h-[100dvh] flex wrapper allows modal to stay centered but get pushed up by mobile keyboards */}
          <div className="flex min-h-[100dvh] items-center justify-center p-4 py-8">
            <div 
              className="bg-white rounded-[32px] p-6 lg:p-8 w-full max-w-sm shadow-2xl relative animate-fade-in-up"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="absolute top-6 right-6 text-[#C98A1E] hover:text-[#b57a18] transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
              
              <div className="text-center mb-8">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-medium">Reservation</p>
                <h2 className="text-2xl font-['Poppins',serif] text-gray-800">
                  Booking <span className="font-bold italic text-[#C98A1E]">Details</span>
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[9px] text-gray-400 font-medium mb-1 ml-2 tracking-wide uppercase">Name</p>
                  <div className="flex items-center bg-[#F4F4F4] rounded-xl py-3 px-4">
                    <User size={16} className="text-[#C98A1E] mr-3 shrink-0" />
                    <div className="w-px h-5 bg-gray-300 mr-3 shrink-0"></div>
                    <span className="text-sm font-semibold text-gray-800">{selectedBooking.guestName || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400 font-medium mb-1 ml-2 tracking-wide uppercase">Email</p>
                  <div className="flex items-center bg-[#F4F4F4] rounded-xl py-3 px-4">
                    <Mail size={16} className="text-[#C98A1E] mr-3 shrink-0" />
                    <div className="w-px h-5 bg-gray-300 mr-3 shrink-0"></div>
                    <span className="text-sm font-semibold text-gray-800 break-all">{selectedBooking.email || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] text-gray-400 font-medium mb-1 ml-2 tracking-wide uppercase">Number</p>
                  <div className="flex items-center bg-[#F4F4F4] rounded-xl py-3 px-4">
                    <Phone size={16} className="text-[#C98A1E] mr-3 shrink-0" />
                    <div className="w-px h-5 bg-gray-300 mr-3 shrink-0"></div>
                    <span className="text-sm font-semibold text-gray-800">{selectedBooking.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-400 font-medium mb-1 ml-2 tracking-wide uppercase">Check In</p>
                    <div className="flex items-center bg-[#F4F4F4] rounded-xl py-3 px-3">
                      <CalendarDays size={16} className="text-[#C98A1E] mr-2 shrink-0" />
                      <div className="w-px h-5 bg-gray-300 mr-2 shrink-0"></div>
                      <span className="text-[13px] font-semibold text-gray-800">{formatMMDDYYYY(selectedBooking.checkIn)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-400 font-medium mb-1 ml-2 tracking-wide uppercase">Check Out</p>
                    <div className="flex items-center bg-[#F4F4F4] rounded-xl py-3 px-3">
                      <CalendarDays size={16} className="text-[#C98A1E] mr-2 shrink-0" />
                      <div className="w-px h-5 bg-gray-300 mr-2 shrink-0"></div>
                      <span className="text-[13px] font-semibold text-gray-800">{formatMMDDYYYY(selectedBooking.checkOut)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-8 bg-[#C98A1E] text-white py-3.5 rounded-full text-sm font-bold shadow-md hover:bg-[#b57a18] transition-all hover:shadow-lg active:scale-95">
                Edit Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-10 lg:pt-14">
        
        <header className="flex items-center justify-end mb-4 lg:mb-8">
          <button 
            onClick={onOpenNotif} 
            className="relative w-10 h-10 lg:w-12 lg:h-12 bg-[#C98A1E] rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95"
          >
            <LucideBell className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
            {pendingCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 lg:w-3.5 lg:h-3.5 bg-red-500 border-2 border-[#F8F9FA] rounded-full shadow-sm animate-pulse"></span>}
          </button>
        </header>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm h-full flex flex-col">
              
              <div className="flex justify-between items-start lg:items-center mb-6 lg:mb-8">
                <div>
                  <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">{isFullMonthView ? 'Full Month' : 'This Week'}</p>
                  <h3 className="text-xl lg:text-2xl font-bold text-[#C98A1E] mt-1 min-w-[160px]">
                    {monthNames[isFullMonthView ? currentMonth.getMonth() : selectedDate.getMonth()]} {isFullMonthView ? currentMonth.getFullYear() : selectedDate.getFullYear()}
                  </h3>
                </div>

                <button 
                  onClick={() => {
                    setIsFullMonthView(!isFullMonthView);
                    if (!isFullMonthView) {
                      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
                    }
                  }}
                  className="px-4 py-2 lg:py-2.5 rounded-full border border-[#C98A1E] text-[#C98A1E] text-[9px] lg:text-[10px] font-bold uppercase tracking-wider bg-[#C98A1E]/10 hover:bg-[#C98A1E] hover:text-white transition-colors whitespace-nowrap mt-4 lg:mt-0"
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
                <div className="grid grid-cols-7 gap-1 lg:gap-2 relative mb-6 items-start">
                  {weekDays.map((date, i) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const activities = getDayActivities(date);
                    return (
                      <button 
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center self-start h-[66px] lg:h-[88px] py-3 lg:py-5 rounded-2xl lg:rounded-3xl transition-all ${isSelected ? 'bg-[#C98A1E] text-white shadow-md scale-105' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className="text-lg lg:text-2xl font-bold">{date.getDate()}</span>
                        <div className="flex gap-1 mt-1.5 lg:mt-2 h-2">
                          {activities.hasCheckIn && <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500`}></span>}
                          {activities.hasCheckOut && <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-red-500`}></span>}
                          {activities.hasPromo && <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-blue-500`}></span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 border-t border-l border-gray-100 mb-6">
                  {monthDays.map((date, i) => {
                    const isSelected = date && isSameDay(date, selectedDate);
                    const activities = getDayActivities(date);
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
                            <div className="flex gap-1 absolute bottom-2 lg:bottom-4 h-2">
                              {activities.hasCheckIn && <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500"></span>}
                              {activities.hasCheckOut && <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-red-500"></span>}
                              {activities.hasPromo && <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-blue-500"></span>}
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between items-center gap-3 mt-auto pt-5 border-t border-gray-100 w-full">
                
                <div className="flex gap-2">
                  <button onClick={handlePrev} className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors shadow-sm border border-gray-200">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={handleNext} className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors shadow-sm border border-gray-200">
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap justify-end gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-wider">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-wider">Departing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-wider">Promo</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Daily Schedule</p>
            <h3 className="text-lg lg:text-xl font-medium text-gray-400 mb-4 lg:mb-6">
              <span className="font-bold text-[#C98A1E]">{dayNames[selectedDate.getDay()]}</span> {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
            </h3>

            <div className="space-y-4">
              {selectedDayPromos.map((promo) => (
                <div key={promo.id} className="bg-[#FDF3E1] border border-[#F5E1C8] rounded-3xl p-5 lg:p-6 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#F5D8A9] flex items-center justify-center shrink-0 shadow-inner">
                    <Percent size={20} className="text-[#967444]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 lg:mb-1">Active Promo</p>
                    <p className="truncate text-sm lg:text-base font-bold text-gray-900">{promo.title}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border border-emerald-200 shadow-sm">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `₱${promo.discountValue} OFF`}
                  </span>
                </div>
              ))}

              {todaysSchedule.length === 0 ? (
                <p className="text-xs lg:text-sm text-gray-400 text-center py-10 lg:py-12 border-2 border-dashed border-gray-300 rounded-3xl font-medium bg-white/50">No check-ins or check-outs today.</p>
              ) : (
                todaysSchedule.map((booking) => {
                  const inStr = typeof booking.checkIn?.toDate === 'function' ? formatYYYYMMDD(booking.checkIn.toDate()) : String(booking.checkIn || '');
                  const isCheckIn = inStr === selectedDateStr;
                  const initials = booking.guestName ? String(booking.guestName).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                  
                  return (
                    <div 
                      key={booking.id} 
                      onClick={() => setSelectedBooking(booking)}
                      className="bg-white rounded-3xl p-5 lg:p-6 flex items-center shadow-sm border border-gray-50 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#C98A1E] flex items-center justify-center mr-4 shrink-0 text-white font-bold text-sm lg:text-base shadow-inner group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 lg:mb-1">
                          {isCheckIn ? 'Check In • 3:00 PM' : 'Check Out • 12:00 NN'}
                        </p>
                        <p className="text-sm lg:text-base font-bold text-gray-900 mb-0.5 lg:mb-1 group-hover:text-[#C98A1E] transition-colors">{booking.guestName || 'N/A'}</p>
                        <p className="text-[10px] lg:text-xs text-neutral-500 font-medium">{booking.people || 0} Pax</p>
                      </div>
                      
                      <span className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                        isCheckIn ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
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