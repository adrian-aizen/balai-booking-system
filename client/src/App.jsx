import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/client/LandingPage';
import BookingForm from './components/client/BookingForm'; 
import AdminDashboard from './components/admin/AdminDashboard';
import PromoCreation from './components/admin/PromoCreation';
 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-promotions" element={<PromoCreation />} />
      </Routes>
    </Router>
  );
}
 
export default App;