import React, { useState, useEffect, useRef } from "react";
import "./Search.css";
import Icon from "../images/iconMagnifier.svg";

const SearchComponent = () => {
  const [query, setQuery] = useState(""); // Drži upit koji korisnik unosi
  const [results, setResults] = useState({ clients: [], business_profiles: [] }); // Drži rezultate pretrage
  const [isLoading, setIsLoading] = useState(false); // Indikator učitavanja rezultata
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Funkcija za slanje upita na backend
  const handleSearch = async (query) => {
    setIsLoading(true); // Postavljamo da je pretraga u toku
    try {
      const response = await fetch(`http://localhost:8000/api/search/users/?q=${query}`);
      const data = await response.json();

      setResults({
        clients: data.clients || [],
        business_profiles: data.business_profiles || [],
      });

      if (!data.clients.length && !data.business_profiles.length) {
        setShowResults(false);
      } else {
        setShowResults(true); 
      }

    } catch (error) {
     
    } finally {
      setIsLoading(false); // Pretraga je završena
    }
  };

  // Funkcija za preusmeravanje na profil
  const handleProfileRedirect = (id, type) => {
    try {

      if (type === "client") {
        window.location.href = `http://localhost:3000/userprofile/${id}/`;
      } else if (type === "business") {
        window.location.href = `http://localhost:3000/userprofile1/${id}/`;
      }

    } catch (error) {
      
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query) {
      handleSearch(query); // Pozivanje pretrage kad god se query menja
    } else {
      handleSearch(""); // Pokreće pretragu svih klijenata i poslovnih subjekata kad je upit prazan
    }
  }, [query]);

  
  useEffect(() => {
    handleSearch("");
  }, []);

  return (
    <div>
      <form className="searchContainer" role="search" ref={searchRef}>
        <div className="searchContent">
          <img src={Icon} alt="Search icon" className="searchIcon" />
          <input
            type="search"
            id="searchInput"
            className="searchInput"
            placeholder="Pretraga..."
            aria-label="Pretraga terena i korisnika"
            value={query}
            onFocus={() => setShowResults(true)} 
            onChange={(e) => setQuery(e.target.value)} 
          />
        </div>
      </form>

      {/* Prikazivanje rezultata pretrage */}
      {isLoading}

      {( // Samo prikazuje rezultate ako je showResults true
        <div className="searchResults">
          {/* Prikazivanje klijenata */}
          {results.clients.length > 0 && (
            <div className="clientsResults">
              <h3>Klijenti:</h3>
              <ul>
                {results.clients.map((client) => (
                  <li
                    key={client.username}
                    onClick={() => handleProfileRedirect(client.id, "client")}
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
              <h3>Poslovni profili:</h3>
              <ul>
                {results.business_profiles.map((business) => (
                  <li
                    key={business.nameSportOrganization}
                    onClick={() => handleProfileRedirect(business.id, "business")}
                  >
                    {business.nameSportOrganization}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Ako nema rezultata za pretragu */}
      {results.clients.length === 0 && results.business_profiles.length === 0 && query && (
        <div className="searchResults">
          <h3>Nema rezultata za pretragu.</h3>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
