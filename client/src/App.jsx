import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/client/LandingPage';
import BookingForm from './components/client/BookingForm'; 
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
 
export default App;