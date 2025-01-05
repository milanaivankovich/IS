import "./Pocetna.css";
import React from "react";
import MenuBar from "../components/MenuBar.js";
import Search from "../components/Search.js";
import Footer from "../components/Footer.js";
import SearchFields from "../components/SearchFields.js";

function Pocetna() {
  return (
    <div className="pocetna">
      <header className="pocetna-header">
        <MenuBar variant={["unregistered"]} search={false} />
      </header>
      <div className="pocetna-body">
        <div className="search">
          <SearchFields />
        </div>
        <div className="footer">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Pocetna;
