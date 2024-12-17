import React, { useState } from 'react';
import axios from 'axios';
import './LogIn.css';
import logo from '../images/logo.png';
import kosarkas from '../images/kosarkas.jpeg';

const LoginPoslovni = () => {
  const [formData, setFormData] = useState({
    email: '',
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
      console.log('Šaljem podatke za prijavu:', formData);

      const response = await axios.post('http://localhost:8000/api/login/business-subject/', formData);
      console.log('Login successful:', response.data);

      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

     
      window.location.href = '/dashboard'; 
    } catch (error) {
      console.error('Greška pri prijavi:', error.response?.data || error.message);
      setError('Neispravan email ili lozinka. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetMessage('');
    try { /*endpoint nije dobar */
      await axios.post('http://localhost:8000/api/password-reset/', { email: resetEmail });
      setResetMessage('Link za resetovanje lozinke je poslan na vašu email adresu.');
    } catch (error) {
      console.error('Password reset failed:', error);
      setResetMessage('Došlo je do greške. Provjerite email i pokušajte ponovo.');
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
        <p>Molimo unesite podatke za prijavu</p>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            placeholder="Email"
            className="login-input"
            value={formData.email}
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
          <div className="register-link">
            Nemate nalog? <a href="/registerPoslovni">Registrujte se!</a>
          </div>
        </form>
      </div>
      {isResetModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Resetujte lozinku</h3>
          <p>Unesite vašu email adresu da bismo vam poslali link za resetovanje lozinke.</p>
          <input
            type="text"
            placeholder="adresa@gmail.com"
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

export default LoginPoslovni;
