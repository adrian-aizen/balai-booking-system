import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db } from '../../firebase';
import AdminCalendar from './AdminCalendar';
import AdminNavbar from '../ui/AdminNavbar';
import NotificationsModal from '../ui/NotificationModal';
import ManualBookingModal from '../ui/ManualBooking'; 
import balaiLogo from '../../assets/BalaiLogo.svg';
import PromoCreation from './PromoCreation';

const GOLD = "#B97216";
const GOLD_DEEP = "#C98A1E";

const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);
const CalendarIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  
  const [view, setView] = useState('home'); 
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/', { replace: true });
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      } else {
        setChecking(false);
        // Live Firebase Listener
        unsubscribeSnapshot = onSnapshot(collection(db, "bookings"), (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBookings(bookingsData);
          setLoading(false);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try { await signOut(getAuth()); } finally { navigate('/', { replace: true }); }
  };

  const formatYYYYMMDD = (date) => {
    const d = new Date(date);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (checking || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] text-sm text-neutral-500 font-poppins">Loading Dashboard Data...</div>;
  }

  // --- Filter Bookings by Status ---
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  // --- Home Dashboard Logic (Only looks at confirmed bookings) ---
  const today = new Date();
  const todayStr = formatYYYYMMDD(today);
  const currentMonthPrefix = todayStr.substring(0, 7); 

  const stats = {
    upcoming: confirmedBookings.filter(b => b.checkIn.startsWith(currentMonthPrefix)).length,
    confirmed: confirmedBookings.length,
    pending: pendingBookings.length
  };

  const currentBooking = confirmedBookings.find(b => b.checkIn <= todayStr && b.checkOut > todayStr);
  const isOccupied = !!currentBooking;
  const checkOutDate = currentBooking ? new Date(currentBooking.checkOut) : null;

  const liveActivities = confirmedBookings
    .filter(b => b.checkIn === todayStr || b.checkOut === todayStr)
    .map(b => ({
      id: b.id,
      initials: b.guestName ? b.guestName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??',
      name: b.guestName,
      type: b.checkIn === todayStr ? 'Check In' : 'Check Out',
      time: b.checkIn === todayStr ? '3:00 PM' : '12:00 NN',
      detail: `${b.people} pax - ${b.villaType === 'Main Villa' ? 'Main' : 'Mini'}`,
      avatar: b.checkIn === todayStr ? '#E9AE57' : '#F3D9AF',
      badge: b.status.charAt(0).toUpperCase() + b.status.slice(1),
    }));

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-poppins relative">
      
      {/* Modals */}
      <NotificationsModal 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        pendingBookings={pendingBookings} 
      />

      <ManualBookingModal 
        isOpen={isManualOpen} 
        onClose={() => setIsManualOpen(false)} 
      />

      {/* Sidebar */}
      <AdminNavbar currentView={view} setView={setView} />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-24 md:ml-64 transition-all duration-300 pb-10 animate-fade-in w-full">
        
        {view === 'calendar' ? (
          <div className="w-full flex justify-center">
            <AdminCalendar 
              bookings={confirmedBookings} 
              setView={setView} 
              onOpenNotif={() => setIsNotifOpen(true)}
              pendingCount={pendingBookings.length}
            />
          </div>
        ) : view === 'promos' ? (
          <div className="w-full flex justify-center">
            <PromoCreation
              onOpenNotif={() => setIsNotifOpen(true)}
              pendingCount={pendingBookings.length}
            />
          </div>
        ) : (
          /* RESPONSIVE DASHBOARD LAYOUT */
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-10 lg:pt-14">
            
            {/* Header & Greeting */}
            <header className="flex items-start justify-between">
              <img src={balaiLogo} alt="Balai 88 Logo" className="h-12 lg:h-14 w-auto object-contain" />
              <button 
                onClick={() => setIsNotifOpen(true)} 
                className="relative flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full text-white shadow-sm transition-transform active:scale-95" 
                style={{ backgroundColor: GOLD }}
              >
                <BellIcon />
                {stats.pending > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#F8F9FA] rounded-full shadow-sm animate-pulse"></span>}
              </button>
            </header>

            <h1 className="mt-6 lg:mt-8 font-['Poppins',serif] font-bold text-3xl lg:text-4xl leading-tight">
              Good day, <em style={{ color: GOLD }}>Admin.</em>
            </h1>

            {/* Grid Layout for Desktop vs Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 lg:mt-10">
              
              {/* Left Column (Status & Activities) */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
                
                {/* Status Card */}
                <section className="rounded-3xl p-6 lg:p-8 text-white shadow-md relative overflow-hidden" style={{ background: `linear-gradient(135deg, #D9952A 0%, ${GOLD_DEEP} 100%)` }}>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[11px] lg:text-xs text-white/90 font-medium uppercase tracking-widest">Today's Status</p>
                      <p className="mt-2 flex items-center gap-3 font-['Poppins',serif] font-semibold text-3xl lg:text-4xl tracking-wide">
                        <span className={`h-4 w-4 lg:h-5 lg:w-5 rounded-full shadow-inner ${isOccupied ? "bg-green-400" : "bg-white/50"}`} />
                        {isOccupied ? "Occupied" : "Available"}
                      </p>
                    </div>
                    {isOccupied && checkOutDate && (
                      <div className="rounded-2xl bg-white/20 border border-white/30 px-5 py-3 text-center leading-none backdrop-blur-md shadow-sm">
                        <p className="text-[9px] lg:text-[10px] uppercase tracking-wider mb-1 text-white/90">Check Out</p>
                        <p className="text-3xl lg:text-4xl font-bold">{checkOutDate.getDate()}</p>
                        <p className="mt-1 text-[10px] lg:text-xs tracking-wide font-medium">{monthNames[checkOutDate.getMonth()].substring(0, 3).toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                  {isOccupied && (
                    <div className="mt-10 lg:mt-12 relative z-10 border-t border-white/20 pt-4">
                      <p className="text-[11px] lg:text-xs text-white/90 uppercase tracking-widest font-medium">Current Guest • {currentBooking.villaType}</p>
                      <p className="mt-1 text-xl lg:text-2xl font-bold tracking-wide">{currentBooking.guestName}</p>
                    </div>
                  )}
                </section>

                {/* Live Activities */}
                <section>
                  <div className="flex items-end justify-between mb-5">
                    <div>
                      <p className="text-[10px] lg:text-xs text-neutral-400 uppercase tracking-widest font-bold mb-1">Live Updates</p>
                      <h2 className="font-['Poppins',serif] text-2xl lg:text-3xl" style={{ color: GOLD }}>Today's <span className="font-bold italic">Activities</span></h2>
                    </div>
                    <button onClick={() => setView('calendar')} className="text-xs lg:text-sm font-semibold text-neutral-500 underline underline-offset-4 hover:text-neutral-900 mb-1 transition-colors">
                      View Calendar
                    </button>
                  </div>

                  <ul className="space-y-4">
                    {liveActivities.length === 0 ? (
                       <li className="rounded-3xl bg-white p-8 shadow-sm border border-dashed border-gray-300 text-center text-sm text-gray-400 font-medium">
                         No check-ins or check-outs scheduled for today.
                       </li>
                    ) : (
                      liveActivities.map((a) => (
                        <li key={a.id} className="flex items-center gap-4 lg:gap-6 rounded-3xl bg-white p-5 lg:p-6 shadow-sm border border-gray-50 hover:border-gray-100 transition-colors">
                          <span className="flex h-14 w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-neutral-800 shadow-inner" style={{ backgroundColor: a.avatar }}>
                            {a.initials}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] lg:text-xs text-neutral-400 uppercase tracking-wider font-bold mb-1">{a.type} • {a.time}</p>
                            <p className="truncate text-base lg:text-lg font-bold text-gray-800">{a.name}</p>
                            <p className="text-xs lg:text-sm text-neutral-500 mt-0.5 font-medium">{a.detail}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-1.5 lg:px-4 lg:py-2 text-[10px] lg:text-xs font-bold uppercase tracking-wider shadow-sm ${a.badge === 'Confirmed' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-orange-200 text-orange-500 bg-orange-50'}`}>
                            {a.badge}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              </div>

              {/* Right Column (Stats & Shortcuts) */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
                
                {/* Stats */}
                <section className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                  <article className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                        <CalendarIcon className="h-6 w-6" />
                      </span>
                      <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>{stats.confirmed} Confirmed</span>
                    </div>
                    <p className="mt-6 text-6xl font-light tracking-tight" style={{ color: GOLD }}>{stats.upcoming}</p>
                    <p className="text-xs lg:text-sm text-neutral-400 mt-2 font-medium">Upcoming this month</p>
                  </article>

                  <article onClick={() => setIsNotifOpen(true)} className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-red-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <ClockIcon className="h-6 w-6" />
                      </span>
                      <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-red-500">Pending Bookings</span>
                    </div>
                    <p className="mt-6 text-6xl font-light tracking-tight text-red-500">{stats.pending}</p>
                    <p className="text-xs lg:text-sm text-neutral-400 mt-2 font-medium">Action Required</p>
                  </article>
                </section>

                {/* Shortcuts */}
                <section className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <p className="text-[10px] lg:text-xs text-neutral-400 uppercase tracking-widest font-bold mb-1">Tools</p>
                  <h2 className="font-['Poppins',serif] text-2xl lg:text-3xl" style={{ color: GOLD }}>Quick <span className="font-bold italic">Shortcuts</span></h2>
                  
                  <div className="mt-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsManualOpen(true)}
                      className="flex-1 rounded-2xl py-4 lg:py-5 text-sm lg:text-base font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 text-center" 
                      style={{ backgroundColor: GOLD }}
                    >
                      Manual Booking
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setView('calendar')}
                      className="flex h-14 w-full sm:w-14 lg:w-full xl:w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 shadow-sm transition-all hover:bg-orange-100 active:scale-95 border border-orange-200"
                    >
                      <CalendarIcon className="h-6 w-6" />
                    </button>
                  </div>
                </section>

              </div>
            </div>

            <div className="mt-16 text-center border-t border-gray-200 pt-8">
              <button type="button" onClick={handleLogout} className="text-xs uppercase tracking-widest font-bold text-neutral-400 hover:text-neutral-900 transition-colors">
                Log out securely
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;