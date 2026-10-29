import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import '../../firebase';
import balaiLogo from '../../assets/BalaiLogo.svg';
 
const GOLD = "#B97216";
const GOLD_DEEP = "#C98A1E";
const ALERT = "#D9442B";
 
const villaStatus = {
  status: "Occupied", // "Occupied" | "Vacant" 
  checkOut: "2026-12-21", 
  guest: "Felipe Pati", // Kunware lang muna HAHAHAHA
};
 
const stats = { upcoming: 5, confirmed: 2, pending: 2 };
 
const activities = [
  { id: 1, initials: "MS", name: "Maria Santos", type: "Check Out", time: "12:00 PM", detail: "3 pax", avatar: "#F3D9AF" },
  { id: 2, initials: "JC", name: "Juan Cruz", type: "Check In", time: "3:00 PM", detail: "5 pax", avatar: "#E9AE57", badge: "Confirmed" },
];
 
// --- Small inline icons ---
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
 
  // Login check: if nobody is signed in, go back to the login page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (!user) {
        navigate('/admin', { replace: true });
      } else {
        setChecking(false);
      }
    });
    return unsubscribe;
  }, [navigate]);
 
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } finally {
      navigate('/admin', { replace: true });
    }
  };
 
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 text-sm text-neutral-500">
        Loading...
      </div>
    );
  }
 
  const checkOut = new Date(villaStatus.checkOut);
  const day = checkOut.getDate();
  const month = checkOut.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const occupied = villaStatus.status === "Occupied";
 
  return (
    <div className="min-h-screen bg-neutral-100 font-poppins text-neutral-900">
      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-6">
 
        {/* Top bar */}
        <header className="flex items-start justify-between">
          <img src={balaiLogo} alt="Balai 88 Logo" className="h-10 w-auto object-contain" />
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm"
            style={{ backgroundColor: GOLD }}
          >
            <BellIcon />
          </button>
        </header>
 
        {/* Greeting */}
        <h1 className="mt-4 font-['Poppins',serif] font-bold text-2xl leading-tight">
          Good day, <em style={{ color: GOLD }}>Admin.</em>
        </h1>
 
        {/* Villa status */}
        <section
          className="mt-5 rounded-3xl p-5 text-white shadow-md"
          style={{ background: `linear-gradient(135deg, #D9952A 0%, ${GOLD_DEEP} 100%)` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] text-white/80">Today's Status</p>
              <p className="mt-1 flex items-center gap-2 font-['Poppins',serif] font-semibold text-3xl">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${occupied ? "bg-green-400" : "bg-white/70"}`}
                  aria-hidden="true"
                />
                {villaStatus.status}
              </p>
            </div>
 
            {occupied && (
              <div className="rounded-xl bg-white/25 px-3 py-2 text-center leading-none backdrop-blur-sm">
                <p className="text-2xl font-medium">{day}</p>
                <p className="mt-1 text-[10px] tracking-wide">{month}</p>
              </div>
            )}
          </div>
 
          {occupied && (
            <div className="mt-6">
              <p className="text-[11px] text-white/80">Check Out • Unknown</p>
              <p className="mt-0.5 text-sm font-medium">{villaStatus.guest}</p>
            </div>
          )}
        </section>
 
        {/* Stats */}
        <section className="mt-4 grid grid-cols-2 gap-4">
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                <CalendarIcon className="h-4 w-4" />
              </span>
              <span className="text-[11px]" style={{ color: GOLD }}>{stats.confirmed} Confirmed</span>
            </div>
            <p className="mt-3 text-4xl font-light" style={{ color: GOLD }}>{stats.upcoming}</p>
            <p className="text-[11px] text-neutral-500">Upcoming this month</p>
          </article>
 
          <article className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100" style={{ color: ALERT }}>
                <ClockIcon />
              </span>
              <span className="text-[11px]" style={{ color: ALERT }}>Pending Bookings</span>
            </div>
            <p className="mt-3 text-4xl font-light" style={{ color: ALERT }}>{stats.pending}</p>
            <p className="text-[11px] text-neutral-500">Pending Confirmations</p>
          </article>
        </section>
 
        {/* Quick shortcuts */}
        <section className="mt-6">
          <p className="text-[10px] text-neutral-400">Shortcuts</p>
          <h2 className="font-['Poppins',serif] text-xl" style={{ color: GOLD }}>Quick <span className="font-bold italic">Shortcuts</span></h2>
 
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="flex-1 rounded-full py-3 text-base font-medium text-white shadow-sm transition-colors hover:brightness-95"
              style={{ backgroundColor: GOLD }}
            >
              Manual Booking
            </button>
            <button
              type="button"
              aria-label="Open calendar"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-300"
            >
              <CalendarIcon />
            </button>
          </div>
        </section>
 
        {/* Recent activities */}
        <section className="mt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-neutral-400">Live Updates</p>
              <h2 className="font-['Poppins',serif] text-xl" style={{ color: GOLD }}>Recent <span className="font-bold italic">Activities</span></h2>
            </div>
            <button type="button" className="text-[10px] text-neutral-500 underline underline-offset-2 hover:text-neutral-900">
              View All
            </button>
          </div>
 
          <ul className="mt-3 space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-medium text-neutral-800"
                  style={{ backgroundColor: a.avatar }}
                >
                  {a.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-neutral-500">{a.type} • {a.time}</p>
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-[10px] text-neutral-400">{a.detail}</p>
                </div>
                {a.badge && (
                  <span className="rounded-md border border-green-500 px-2 py-0.5 text-[10px] text-green-600">
                    {a.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
 
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs uppercase tracking-widest text-neutral-400 hover:text-neutral-900"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default AdminDashboard;