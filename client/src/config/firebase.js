// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWx3zcYl3iKhs6zkxD0gFIIK20gomDhPg",
  authDomain: "balai-booking-system.firebaseapp.com",
  projectId: "balai-booking-system",
  storageBucket: "balai-booking-system.firebasestorage.app",
  messagingSenderId: "335414543565",
  appId: "1:335414543565:web:00c93a70a13c4d63d6d584",
  measurementId: "G-HJXC5W1W66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);