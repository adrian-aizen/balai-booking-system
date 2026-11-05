import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { User, Lock, X, Eye, EyeOff } from 'lucide-react'; 
import '../../firebase'; 

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const auth = getAuth();

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      onClose(); 
      navigate('/admin-dashboard'); 
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* Modal Card */}
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl animate-fade-in-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8 mt-2">
          <p className="text-sm text-gray-500 mb-2">Balai88</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome <span className="text-[#D4B07A] italic font-serif font-normal">Back</span>
          </h1>
          <p className="text-xs text-gray-500">Sign in to manage your account or resort.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 ml-1">Email</label>
            <div className="flex items-center bg-[#EFEFEF] rounded-xl px-4 py-3">
              <User size={16} className="text-[#D4B07A] shrink-0 mr-3" />
              <div className="w-px h-5 bg-gray-300 mr-3"></div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. admin@balai88.com"
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
              
              {/* Dynamic type based on showPassword state */}
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-transparent flex-1 outline-none text-sm text-gray-800 font-medium w-full min-w-0"
              />
              
              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 shrink-0 text-gray-400 hover:text-[#D4B07A] transition-colors focus:outline-none"
                tabIndex="-1" // Prevents the toggle from trapping keyboard navigation
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4B07A] hover:bg-[#c29c66] text-white text-sm font-medium py-3.5 rounded-full transition-colors mt-6 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;