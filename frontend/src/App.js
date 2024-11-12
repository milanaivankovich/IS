import "./App.css";
import React, { useState, useEffect } from "react";
import Pocetna from "./pages/Pocetna";
import LogIn from "./pages/LogIn";
import Dogadjaji from "./pages/Dogadjaji";
import Tereni from "./pages/Tereni";
import EditUserProfile from "./pages/EditUserProfile";
import OdabirVrsteKorisnika from "./pages/OdabirVrsteKorisnika";
import LoginPoslovni from "./pages/LoginPoslovni";
import OdabirVrsteKorisnikaRegistracija from "./pages/OdabirVrsteKorisnikaRegistracija";

function App() {
  const [currentPage, setCurrentPage] = useState("pocetna");

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/login") {
      setCurrentPage("login");
    } else if (path === "/dogadjaji") {
      setCurrentPage("dogadjaji");
    } else if (path === "/tereni") {
      setCurrentPage("tereni");
    } else if (path === "/userprofile") {
      setCurrentPage("edituserprofile");
    } else if (path === "/usertype") {
      setCurrentPage("usertype");
    } else if (path === "/usertype1") {
      setCurrentPage("usertype1");
    } else if (path === "/login1") {
      setCurrentPage("login1");
    } else {
      setCurrentPage("pocetna");
    }
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <div className="Header">
          {currentPage === "pocetna" && <Pocetna />}
          {currentPage === "login" && <LogIn />}
          {currentPage === "login1" && <LoginPoslovni />}
          {currentPage === "dogadjaji" && <Dogadjaji />}
          {currentPage === "tereni" && <Tereni />}
          {currentPage === "edituserprofile" && <EditUserProfile />}
          {currentPage === "usertype" && <OdabirVrsteKorisnika />}
          {currentPage === "usertype1" && <OdabirVrsteKorisnikaRegistracija />}
        </div>
      </header>
    </div>
  );
}

export default App;
