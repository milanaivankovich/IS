import React, { useState } from 'react';
import axios from 'axios';
import './LogIn.css';
import logo from '../images/logo.png';
import kosarkas from '../images/kosarkas.jpeg';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/login/client/', formData); // Endpoint za login
      console.log('Login successful:', response.data);

     
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      
      window.location.href = "/"; 
    } catch (error) {
      console.error('Login failed:', error);
      setError('Neispravno korisničko ime ili lozinka. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetMessage(''); // Clear previous messages
    setError(''); // Clear error messages
  
    if (!resetEmail) {
      setError('Unesite email adresu.');
      return;
    }
  
    try {
      // Call the backend API with the email
      const response = await axios.post('http://localhost:8000/api/request-password-reset/', {
        email: resetEmail, // Backend expects `email`
      });
  
      // Display success message from backend
      setResetMessage('Link za resetovanje lozinke je poslan na vašu email adresu.');
    } catch (error) {
      console.error('Password reset failed:', error);
  
      // Handle specific errors from backend
      if (error.response?.status === 400) {
        setResetMessage('Korisnik sa ovom email adresom ne postoji.');
      } else {
        setResetMessage('Došlo je do greške. Pokušajte ponovo.');
      }
    }
  };
  
  

  return (
    <div className="login-container">
      <div className="login-left">
        <a href="/">
          <img src={logo} alt="Oće neko na basket?" className="login-logo" />
        </a>
        <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-welcome">DOBRODOŠLI!</h2>
        <p  className="tekst-za-unos">Molimo unesite podatke za prijavu</p>

          <div className="form-group">
            <label htmlFor="username">Korisničko ime</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Korisničko ime"
                className="login-input"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
          </div>
          <div className="form-group">
            <label htmlFor="password">Lozinka</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Lozinka"
              className="login-input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="remember-me-container">
            <div className="checkbox-group">
              <input type="checkbox" id="remember-me" />
              <label htmlFor="remember-me">Zapamti me</label>
            </div>
            <a href="#" onClick={() => setIsResetModalOpen(true)}>Zaboravili ste lozinku?</a>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Prijava...' : 'Prijavi se'}
          </button>
          <button type="button" className="login-btn google">Prijavi se sa Google</button>
          <button type="button" className="login-btn facebook">Prijavi se sa Facebook</button>
          <div className="register-link">
            Nemate nalog? <a href="/registerRekreativac">Registrujte se!</a>
          </div>
        </form>
      </div>

      {isResetModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Resetujte lozinku</h3>
          <p>Unesite Vaš email da bismo vam poslali link za resetovanje lozinke.</p>
          <input
            type="text"
            placeholder="Email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="modal-input"
          />
          <button onClick={handleResetPassword} className="modal-btn">
            Pošalji link
          </button>
          {resetMessage && <p className="reset-message">{resetMessage}</p>}
          <button onClick={() => setIsResetModalOpen(false)} className="modal-close-btn">
            Zatvori
          </button>
        </div>
      </div>
    )}

      <div className="image-container">
        <img src={kosarkas} alt="Opis slike" />
      </div>
    </div>
  );
};

export default Login;
