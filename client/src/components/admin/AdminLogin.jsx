import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { User, Lock } from 'lucide-react'; 
import '../../firebase';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Firebase Auth uses email, so we pass the 'email' state even if the UI says 'Username'
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/admin-dashboard'); // Redirect to your dashboard route
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background wrapper (replace the background image URL with your actual asset)
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center font-poppins relative" 
         style={{ backgroundImage: "url('/src/assets/balaibg.jpg')" }}>
      
      {/* Dark overlay for the background */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl mx-4">
        
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">Balai88</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin <span className="text-[#D4B07A] italic font-serif font-normal">Access</span>
          </h1>
          <p className="text-xs text-gray-500">Welcome back. Sign in to manage your resort.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Username / Email Field */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 ml-1">Username</label>
            <div className="flex items-center bg-[#EFEFEF] rounded-xl px-4 py-3">
              <User size={16} className="text-[#D4B07A] shrink-0 mr-3" />
              <div className="w-px h-5 bg-gray-300 mr-3"></div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Admin Email"
                required
                className="bg-transparent flex-1 outline-none text-sm text-gray-800 font-medium w-full min-w-0"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 ml-1">Password</label>
            <div className="flex items-center bg-[#EFEFEF] rounded-xl px-4 py-3">
              <Lock size={16} className="text-[#D4B07A] shrink-0 mr-3" />
              <div className="w-px h-5 bg-gray-300 mr-3"></div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-transparent flex-1 outline-none text-sm text-gray-800 font-medium w-full min-w-0"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-32 bg-[#D4B07A] hover:bg-[#c29c66] text-white text-sm font-semibold py-3 rounded-full transition-colors mt-6 disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;