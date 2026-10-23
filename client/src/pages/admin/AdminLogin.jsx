import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

const handleLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // Send this token to your backend for verification
    const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Welcome Admin!");
  } catch (error) {
    console.error("Login failed:", error.message);
  }
};