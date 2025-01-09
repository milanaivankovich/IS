import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, googleProvider, FacebookAuthProvider, facebookProvider, signInWithPopup } from "../components/Firebase.js"; 
import './LogIn.css';
import logo from '../images/logo.png';
//import { FaEye, FaEyeSlash } from "react-icons/fa";


const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false); 
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // const [showPassword, setShowPassword] = useState(false);
  
  //   const togglePasswordVisibility = () => {
  //     setShowPassword(!showPassword);
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  //const [isPasswordFieldFocused, setIsPasswordFieldFocused] = useState(false);

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/login/client/', formData);
      console.log('Login successful:', response.data);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Ako je checkbox oznaÄen, saÄuvaj korisniÄko ime u localStorage
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', formData.username);
      } else {
        localStorage.removeItem('rememberedUsername'); // Ukloni ako nije oznaÄen
      }

      window.location.href = "/";
    } catch (error) {
      console.error('Login failed:', error);
      setError('Neispravno korisniÄko ime ili lozinka. PokuÅ¡ajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  // Prilikom uÄitavanja stranice, provjeriti da li postoji saÄuvano korisniÄko ime
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setFormData((prev) => ({ ...prev, username: savedUsername }));
      setRememberMe(true); // Automatski oznaÄiti checkbox ako je korisniÄko ime saÄuvano
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google Login Successful:', user);

      // Optional: Send user info to backend
      const id_token = await user.getIdToken();
      const response = await axios.post('http://localhost:8000/api/social-login/', {
        id_token,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      // Store the back-end token in localStorage
      const { token } = response.data; // Extract the token returned from the back-end
      localStorage.setItem('token', token); 

    

      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = "/";
    } catch (error) {
      console.error('Google Login Failed:', error);
      setError('Neuspjela prijava putem Google-a. PokuÅ¡ajte ponovo.');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // Authenticate with Facebook
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      console.log('Facebook Login Successful:', user);
  
      // Get the Firebase ID token
      const id_token = await user.getIdToken();

      // Extract the Facebook access token from the result
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const facebookAccessToken = credential.accessToken;
      console.log("Facebook Access Token:", facebookAccessToken);
  
      // Use the Facebook Graph API to fetch the user's email
      const graphUrl = `https://graph.facebook.com/v11.0/me?fields=email,picture&access_token=${facebookAccessToken}`;
      const facebookResponse = await axios.get(graphUrl);
  
      // Extract the email from the Graph API response
      const email = facebookResponse.data.email;
      console.log("Facebook Email:", email);

      const photo = facebookResponse.data.picture;
  
      // Send user info and id_token to the back-end
      const response = await axios.post('http://localhost:8000/api/social-login/', {
        id_token,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: photo,
      });
  
      // Store the back-end token in localStorage
      const { token } = response.data; // Extract the token returned from the back-end
      localStorage.setItem('token', token);
  
      // Optionally store user data for UI purposes
      localStorage.setItem('user', JSON.stringify(user));
  
      // Redirect the user to the home page or another appropriate location
      window.location.href = "/";
    } catch (error) {
      console.error('Facebook Login Failed:', error);
      setError('Neuspjela prijava putem Facebook-a. PokuÅ¡ajte ponovo.');
    }
  };

  const handleResetPassword = async () => {
    setResetMessage('');
    setError('');

    if (!resetEmail) {
      setError('Unesite email adresu.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/request-password-reset/', {
        email: resetEmail,
      });
      setResetMessage('Link za resetovanje lozinke je poslan na vaÅ¡u email adresu.');
    } catch (error) {
      console.error('Password reset failed:', error);
      setResetMessage('DoÅ¡lo je do greÅ¡ke. PokuÅ¡ajte ponovo.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <a href="/">
          <img src={logo} alt="OÄ‡e neko na basket?" className="login-logo" />
        </a>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-welcome">DOBRODOÅ LI!</h2>
          <p className="tekst-za-unos">Molimo unesite podatke za prijavu</p>

          <div className="form-group">
            <label htmlFor="username">KorisniÄko ime</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="KorisniÄko ime"
              className="login-input"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
          <label htmlFor="password">Lozinka</label>
          <input
            type="password"
            name="password"
            placeholder="Lozinka"
            className="login-input"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          </div>

        
          <div className="checkbox-group">
          <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe} 
              onChange={handleRememberMeChange} 
            />
            <label htmlFor="remember-me">Zapamti me</label>
          </div>
          <a className="forget-label" href="#" onClick={() => setIsResetModalOpen(true)}>
            Zaboravili ste lozinku?
          </a>
          
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Prijava...' : 'Prijavi se'}
          </button>
          <button type="button" className="login-btn google" onClick={handleGoogleLogin}>
            Prijavi se sa Google
          </button>
          <button type="button" className="login-btn facebook" onClick={handleFacebookLogin}>
            Prijavi se sa Facebook
          </button>
          <div className="register-link">
            Nemate nalog? <a href="/registerRekreativac">Registrujte se!</a>
          </div>
        </form>
      </div>

      {isResetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Resetujte lozinku</h3>
            <p>Unesite VaÅ¡ email da bismo vam poslali link za resetovanje lozinke.</p>
            <input
              type="text"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="modal-input"
            />
            <button onClick={handleResetPassword} className="modal-btn">
              PoÅ¡alji link
            </button>
            {resetMessage && <p className="reset-message">{resetMessage}</p>}
            <button onClick={() => setIsResetModalOpen(false)} className="modal-close-btn">
              Zatvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;