import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/client/LandingPage';
import BookingForm from './components/client/BookingForm'; 
import AdminDashboard from './components/admin/AdminDashboard';
import PromoCreation from './components/admin/PromoCreation';
import AdminCalendar from './components/admin/AdminCalendar';

// 1. Import the ProtectedRoute wrapper
import ProtectedRoute from './components/admin/ProtectedRoute'; // Adjust path if needed
// 2. Import your Login component

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingForm />} />
      
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin-calendar" 
          element={
            <ProtectedRoute>
              <AdminCalendar />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin-promotions" 
          element={
            <ProtectedRoute>
              <PromoCreation />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;