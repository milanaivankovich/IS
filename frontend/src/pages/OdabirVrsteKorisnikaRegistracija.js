import React from "react";
import "./OdabirVrsteKorisnika.css";

function OdabirVrsteKorisnikaRegistracija() {
  // Funkcija za navigaciju
  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <div className="odabir-vrste-korisnika">
      {/* Dugme za izlaz */}
      <button className="exit-button" onClick={() => navigateTo("/")}>X</button>
      
      {/* Dugmad za izbor korisnika */}
      <div className="container">
        <button className="button" onClick={() => (window.location.href = "/registerRekreativac")}>Rekreativac</button>
        <button className="button" onClick={() =>  (window.location.href = "/registerPoslovni")}>Poslovni korisnik</button>
      </div>
    </div>
  );
}

export default OdabirVrsteKorisnikaRegistracija;
