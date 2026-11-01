import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/client/LandingPage';
import BookingForm from './components/client/BookingForm'; 
import AdminDashboard from './components/admin/AdminDashboard';
 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingForm />} />
        {/* The /admin route has been removed */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
 
export default App;