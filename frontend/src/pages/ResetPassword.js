import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ResetPassword.css";

function ResetPassword() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasSpecialChar: false,
    hasNumber: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFieldFocused, setIsPasswordFieldFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));

    if (id === "password" || id === "confirmPassword") {
      validatePassword(value);
    }
  };

  const validatePassword = (password = formData.password) => {
    const criteria = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasSpecialChar: /[\W_]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
    setPasswordCriteria(criteria);

    return (
      criteria.minLength &&
      criteria.hasUpperCase &&
      criteria.hasLowerCase &&
      criteria.hasSpecialChar &&
      criteria.hasNumber &&
      password === formData.confirmPassword
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validatePassword()) {
      setErrorMessage(
        "Lozinka mora zadovoljiti sve kriterijume i podudara se sa potvrdom."
      );
      return;
    }

    alert("Lozinka je uspješno resetovana!");
  };

  return (
    <div className="resetpassword-body ">
    <div className="reset-password-container">
      <form className="reset-password-form" onSubmit={handleSubmit}>
        <h2>Unesite podatke</h2>

        <label htmlFor="username">Korisničko ime:</label>
        <div className="username-container">
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Unesite korisničko ime"
          required
        />
        </div>
        <label htmlFor="password">Lozinka:</label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Lozinka123$"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => setIsPasswordFieldFocused(true)}
            onBlur={() => setIsPasswordFieldFocused(false)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {isPasswordFieldFocused && (
          <div className="password-criteria-box">
            <h4>Kriterijumi za lozinku:</h4>
            <ul className="password-criteria">
              <li className={passwordCriteria.minLength ? "valid" : "invalid"}>
                Minimalno 8 karaktera
              </li>
              <li
                className={passwordCriteria.hasUpperCase ? "valid" : "invalid"}
              >
                Bar jedno veliko slovo
              </li>
              <li
                className={passwordCriteria.hasLowerCase ? "valid" : "invalid"}
              >
                Bar jedno malo slovo
              </li>
              <li
                className={passwordCriteria.hasSpecialChar ? "valid" : "invalid"}
              >
                Bar jedan specijalni znak
              </li>
              <li className={passwordCriteria.hasNumber ? "valid" : "invalid"}>
                Bar jedan broj
              </li>
            </ul>
          </div>
        )}

        <label htmlFor="confirmPassword">Potvrda lozinke:</label>
        <div className="password-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            placeholder="Ponovite lozinku"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="rstbutton">Resetuj lozinku</button>
      </form>
    </div>
    </div>
  );
}

export default ResetPassword;
