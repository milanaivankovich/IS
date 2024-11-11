import React from "react";
import "./OdabirVrsteKorisnika.css";

function OdabirVrsteKorisnika() {
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
        <button className="button" onClick={() => navigateTo("/login?user=rekreativac")}>Rekreativac</button>
        <button className="button" onClick={() => navigateTo("/login?user=poslovni")}>Poslovni korisnik</button>
      </div>
    </div>
  );
}

export default OdabirVrsteKorisnika;
