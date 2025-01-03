import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6Zb6zPA7vvUelLkEwR_YTq3p5lijfCt0",
  authDomain: "ocenekonabasker.firebaseapp.com",
  projectId: "ocenekonabasker",
  storageBucket: "ocenekonabasker.firebasestorage.app",
  messagingSenderId: "855335229014",
  appId: "1:855335229014:web:e74a4a4a4fc3652d950df7",
  measurementId: "G-EZGKXMG6RG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
export { auth, googleProvider, facebookProvider, FacebookAuthProvider, signInWithPopup };