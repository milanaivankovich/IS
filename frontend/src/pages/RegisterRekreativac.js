import React, { useState } from "react";
import axios from "axios";
import "./RegisterRekreativac.css";
import logo from "../images/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Cropper from "react-easy-crop";
import getCroppedImg from "../components/ImageCrop";
import { auth, googleProvider, facebookProvider, signInWithPopup } from "../components/Firebase.js"; 

function RegisterRekreativac() {

  const [imagePreview, setImagePreview] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);

  const [imageSrc, setImageSrc] = useState(null); 
  const [finalImage, setFinalImage] = useState(null); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 50, height: 50 });
  const [zoom, setZoom] = useState(1);
  

  const removeImage = () => {
    setImageSrc(null);
    setSelectedImage(null);
    setFinalImage(null);
    setCropping(false);
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCrop(croppedAreaPixels);
  };

  
  const handleCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, crop); 
      const croppedUrl = URL.createObjectURL(croppedBlob); 
      setFinalImage(croppedUrl); 
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: croppedBlob, 
      }));
      setCropping(false); 
    } catch (error) {
      console.error("Greška pri izrezivanju slike:", error);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    image: null,
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasSpecialChar: false,
    hasNumber: false,
  });

  

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPasswordFieldFocused, setIsPasswordFieldFocused] = useState(false); 

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const nextStep = () => {
    if (isStepValid()) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Molimo popunite sva polja prije nastavka.");
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.first_name && formData.last_name && formData.username;
      case 1:
        return validatePassword();
      case 2:
          return true; // Slika je opciona
      case 3:
          return formData.email.includes("@");
      default:
        return false;
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

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (id === "password") {
      validatePassword(value);
    }
  };

  const handleSocialSignIn = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Korisnik:", result.user);
      alert("Prijava uspješna!");
    } catch (error) {
      console.error("Greška prilikom prijave:", error);
      alert("Došlo je do greške. Molimo pokušajte ponovo.");
    }
  };

  const submitForm = async () => {
    if (isStepValid()) {
      setIsSubmitting(true);
      try {
        const response = await axios.post(
          "http://localhost:8000/api/client/",
          formData
        );
        console.log(response.data);
        alert("Registracija uspješna! Verifikujte email.");
        setFormData({
          first_name: "",
          last_name: "",
          username: "",
          password: "",
          confirmPassword: "",
          email: "",
          image: null,
        });
        setCurrentStep(0);
      } catch (error) {
        console.error("Greška prilikom registracije:", error);
        alert("Došlo je do greške prilikom registracije. Molimo pokušajte ponovo.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="register-container">
      <a href="/" className="logo-container">
        <img src={logo} alt="Oće neko na basket?" className="basket-logo" />
      </a>

      <div id="form-container">
        <h1 className="welcome-title">Dobrodošli!</h1>
        {currentStep === 0 && (
          <div className="form-step active">
            <p className="tekst-za-unos">Molimo unesite podatke</p>
            <label htmlFor="firstName">Ime:</label>
            <input
              type="text"
              id="first_name"
              placeholder="Marko"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="lastName">Prezime:</label>
            <input
              type="text"
              id="last_name"
              placeholder="Marković"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="username">Korisničko ime:</label>
            <input
              type="text"
              id="username"
              placeholder="markom"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            <button className="continue-button" onClick={nextStep}>
              Nastavi
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="form-step">
            <p className="tekst-za-unos">Molimo unesite i potvrdite lozinku</p>
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
              required />
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
                  <li
                    className={passwordCriteria.hasNumber ? "valid" : "invalid"}
                  >
                    Bar jedan broj
                  </li>
                </ul>
              </div>
            )}
            <label htmlFor="confirmPassword">Potvrdite lozinku:</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Lozinka123$"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            <button className="continue-button" onClick={nextStep}>
              Nastavi
            </button>
          </div>
        )}
        {currentStep === 2 && (
        <div className="form-step">
          <div>
          {!cropping ? (
            <>
            <p className="tekst-za-unos">Molimo postavite sliku</p>
            <label htmlFor="profileImage">Dodaj sliku:</label>
            <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedImage(file);
                setImageSrc(URL.createObjectURL(file)); 
                setCropping(true); 
              }
              }}
              />
            {finalImage && (
            <div className="image-preview-container">
              <img src={finalImage} alt="Preview" className="preview-image" />
              <button
                type="button"
                className="remove-button"
                onClick={removeImage}
              >
                Ukloni sliku
              </button>
            </div>
            )}
          </>
        ) : (
        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} 
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="crop-buttons">
            <button
              type="button"
              onClick={handleCrop}
              className="save-button"
            >
              Sačuvaj izrezanu sliku
            </button>
            <button
              type="button"
              onClick={() => setCropping(false)}
              className="cancel-button"
            >
              Otkaži
            </button>
          </div>
        </div>
          )}
        </div>
        <button className="continue-button" onClick={nextStep}>
              Nastavi
            </button>
        </div>
        )}
        {currentStep === 3 && (
          <div className="form-step">
            <p className="tekst-za-unos">Molimo unesite svoju email adresu za verifikaciju</p>
            <label htmlFor="email">Email adresa:</label>
            <input
              type="email"
              id="email"
              placeholder="markomarkovic@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <button className="continue-button" onClick={submitForm} disabled={isSubmitting}>
              {isSubmitting ? "Slanje..." : "Završi registraciju"}
            </button>
          </div>
        )}

        <div className="social-buttons">
          <button
            className="social-button google-button"
            onClick={() => handleSocialSignIn(googleProvider)}
          >
            Registrujte se putem Google-a
          </button>
          <button
            className="social-button facebook-button"
            onClick={() => handleSocialSignIn(facebookProvider)}
          >
            Registrujte se putem Facebook-a
          </button>
        </div>

        <div className="login-prompt">
          <p>
            Imate nalog?{" "}
            <a href="/login" className="login-link">
              Prijavite se!
            </a>
          </p>
        </div>
      </div>

      <div className="progress-bar">
        <div className="steps">
          {["Unesite podatke", "Unesite lozinku", "Postavite sliku","Verifikujte email"].map(
            (label, index) => (
              <div
                className={`step ${currentStep >= index ? "active" : ""}`}
                key={index}
                onClick={() => goToStep(index)}
              >
                <div className="step-circle">{index + 1}</div>
                <p>{label}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterRekreativac;
