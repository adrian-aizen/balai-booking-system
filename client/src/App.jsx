import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/client/LandingPage';
import AdminLogin from './components/admin/AdminLogin'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/admin" element={<AdminLogin />} />
        
      </Routes>
    </Router>
  );
}

export default App;