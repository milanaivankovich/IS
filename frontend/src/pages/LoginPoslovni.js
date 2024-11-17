import React from 'react';
import './LogIn.css'; 
import logo from '../images/logo.png';


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
          <div className="login-options">
            <label>
              <input type="checkbox" />
              Zapamti me
            </label>
            <a href="/">Zaboravili ste lozinku?</a>
          </div>
          <button className="login-btn">Prijavi se</button>
          <p>Nemate nalog? <a href="/">Registrujte se!</a></p>
        </form>
      </div>
      <div className="login-right">
       
      </div>
    </div>
  );
};

export default LoginPoslovni;
