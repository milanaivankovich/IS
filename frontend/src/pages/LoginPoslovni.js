import React from 'react';
import './LogIn.css'; 
import logo from '../images/logo.png';
import kosarkas from '../images/kosarkas.jpeg';

const LoginPoslovni = () => {
  return (
    <div className="login-container">
      <div className="login-left">
      <a href="/">
        <img src={logo} alt="Oće neko na basket?" className="login-logo" />
      </a>
        <h2 className="login-welcome">DOBRODOŠLI!</h2>
        <p>Molimo unesite podatke za prijavu</p>
        <form>
          <label htmlFor="email">Email</label>
          <input type="text" placeholder="Email" className="login-input" />
          <label htmlFor="password">Lozinka</label>
          <input type="password" placeholder="Lozinka" className="login-input" />
          <div class="remember-me-container">
            <div class="checkbox-group">
            <input type="checkbox" id="remember-me" />
            <label for="remember-me">Zapamti me</label>
            </div>
            <a href="#">Zaboravili ste lozinku?</a>
          </div>
          <button className="login-btn">Prijavi se</button>
          <div class="register-link">
                Nemate nalog? <a href="/registerPoslovni">Registrujte se!</a>
          </div>
        </form>
      </div>
      <div class="image-container">
        <img src={kosarkas} alt="Opis slike" />
      </div>
    </div>
  );
};

export default LoginPoslovni;
