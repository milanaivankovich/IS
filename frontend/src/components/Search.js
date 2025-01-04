import React, { useState, useEffect } from "react";
import "./Search.css";
import Icon from "../images/iconMagnifier.svg";

const SearchComponent = () => {
  const [query, setQuery] = useState(""); // Drži upit koji korisnik unosi
  const [results, setResults] = useState({ clients: [], business_profiles: [] }); // Drži rezultate pretrage
  const [isLoading, setIsLoading] = useState(false); // Indikator učitavanja rezultata

  // Funkcija za slanje upita na backend
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query) return; // Ako upit nije unet, ne šaljemo zahtev

    setIsLoading(true); // Postavljamo da je pretraga u toku
    try {
      const response = await fetch(`http://localhost:8000/api/search/users/?q=${query}`);
      const data = await response.json();

      setResults({
        clients: data.clients || [],
        business_profiles: data.business_profiles || [],
      });
    } catch (error) {
      console.error("Greška prilikom pretrage:", error);
    } finally {
      setIsLoading(false); // Pretraga je završena
    }
  };

  // Funkcija za preusmeravanje na profil korisnika koristeći window.location
  const handleProfileRedirect = (pk, type) => {
    if (type === "client") {
      window.location.href = `/api/client/${pk}/`; // Preusmeravanje na profil korisnika
    } else if (type === "business-subject") {
      window.location.href = `/api/business-subject/${pk}/`; // Preusmeravanje na profil poslovnog subjekta
    }
  };

  return (
    <div>
      <form className="searchComponent" role="search" onSubmit={handleSearch}>
        <div className="searchComponent">
          <img src={Icon} alt="Search icon" className="searchIcon" />
          <input
            type="search"
            id="searchInput"
            className="searchInput"
            placeholder="Pretraga..."
            aria-label="Pretraga terena i korisnika"
            value={query}
            onChange={(e) => setQuery(e.target.value)} // Održava stanje unosa
          />
        </div>
      </form>

      {/* Prikazivanje rezultata pretrage */}
      {isLoading && <p>Pretraga u toku...</p>}

      {results.clients.length > 0 || results.business_profiles.length > 0 ? (
        <div className="searchResults">
          <h3>Rezultati pretrage:</h3>

          {/* Prikazivanje klijenata */}
          {results.clients.length > 0 && (
            <div className="clientsResults">
              <h4>Klijenti:</h4>
              <ul>
                {results.clients.map((client) => (
                  <li
                    key={client.username}
                    onClick={() => handleProfileRedirect(client.username, "client")}
                  >
                    {client.first_name} {client.last_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prikazivanje poslovnih profila */}
          {results.business_profiles.length > 0 && (
            <div className="businessResults">
              <h4>Poslovni profili:</h4>
              <ul>
                {results.business_profiles.map((business) => (
                  <li
                    key={business.nameSportOrganization}
                    onClick={() => handleProfileRedirect(business.nameSportOrganization, "business")}
                  >
                    {business.nameSportOrganization}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : query && !isLoading ? (
        <p>Nema rezultata za pretragu.</p>
      ) : null}
    </div>
  );
};

export default SearchComponent;
