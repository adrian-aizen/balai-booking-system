import { useState } from 'react';
import { X, Check, XCircle, Mail, Phone } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function NotificationModal({ isOpen, onClose, pendingBookings }) {
  const [processing, setProcessing] = useState(null);

  if (!isOpen) return null;

  const handleUpdate = async (id, newStatus) => {
    setProcessing(id);
    try {
      await updateDoc(doc(db, "bookings", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md relative shadow-2xl flex flex-col max-h-[80vh] animate-fade-in-up">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-[#C98A1E] transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-[#C98A1E] mb-1">Booking Requests</h2>
        <p className="text-xs text-gray-500 mb-6">{pendingBookings.length} waiting for approval</p>

        <div className="overflow-y-auto flex-1 space-y-4 pr-2">
          {pendingBookings.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">You're all caught up!</p>
          ) : (
            pendingBookings.map(booking => (
              <div key={booking.id} className="bg-gray-50 rounded-3xl p-5 border border-gray-100 shadow-sm">
                
                {/* Guest Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{booking.guestName || 'Guest'}</p>
                    <p className="text-[10px] font-bold text-[#C98A1E] uppercase tracking-wider">{booking.villaType}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold bg-white border border-gray-100 px-2.5 py-1 rounded-md shadow-sm">{booking.people} Pax</span>
                </div>
                
                {/* Contact Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <Mail size={16} className="text-[#C98A1E] shrink-0" />
                    <span className="text-xs text-gray-600 font-medium truncate">{booking.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <Phone size={16} className="text-[#C98A1E] shrink-0" />
                    {/* Checking both 'phone' and 'number' depending on what your form uses */}
                    <span className="text-xs text-gray-600 font-medium">{booking.phone || booking.number || 'No contact provided'}</span>
                  </div>
                </div>
                
                {/* Dates */}
                <div className="flex gap-4 text-xs text-gray-700 mb-5 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex-1">
                    <span className="block text-[9px] text-gray-400 uppercase font-bold mb-0.5">Check In</span>
                    <span className="font-semibold">{booking.checkIn}</span>
                  </div>
                  <div className="w-px bg-gray-100"></div>
                  <div className="flex-1 pl-2">
                    <span className="block text-[9px] text-gray-400 uppercase font-bold mb-0.5">Check Out</span>
                    <span className="font-semibold">{booking.checkOut}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleUpdate(booking.id, 'confirmed')}
                    disabled={processing === booking.id}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button 
                    onClick={() => handleUpdate(booking.id, 'declined')}
                    disabled={processing === booking.id}
                    className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-500 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <XCircle size={16} /> Decline
                  </button>
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}