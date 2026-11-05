import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function ProtectedRoute({ children }) {
  const auth = getAuth();
  
  // If Firebase already knows there is a user, skip the checking phase
  const [isAuthChecking, setIsAuthChecking] = useState(!auth.currentUser);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    // This still runs to catch actual logouts or initial page loads
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] text-sm text-neutral-500 font-poppins">
        Loading Dashboard Data...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}