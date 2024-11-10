import "./App.css";
import React, { useState, useEffect } from "react";
import Pocetna from "./pages/Pocetna";
import LogIn from "./pages/LogIn"; // Import LogIn page
import Dogadjaji from "./pages/Dogadjaji";
import Tereni from "./pages/Tereni";
import EditUserProfile from "./pages/EditUserProfile";

function App() {
  const [currentPage, setCurrentPage] = useState("pocetna");

  // Set the page based on the URL path
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
    } else {
      setCurrentPage("pocetna");
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="Header">
          {currentPage === "pocetna" && <Pocetna />} {/* Show Pocetna page */}
          {currentPage === "login" && <LogIn />}
          {currentPage === "dogadjaji" && <Dogadjaji />} {/* Show LogIn page */}
          {currentPage === "tereni" && <Tereni />} {/* Show Tereni page */}
          {currentPage === "edituserprofile" && <EditUserProfile />}
        </div>
      </header>
    </div>
  );
}

export default App;
