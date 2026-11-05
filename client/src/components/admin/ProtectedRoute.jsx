import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function ProtectedRoute({ children }) {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Use your custom loading UI while waiting for Firebase
  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] text-sm text-neutral-500 font-poppins">
        Loading Dashboard Data...
      </div>
    );
  }

  // Relocate unauthorized users
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Render the dashboard if logged in
  return children;
}