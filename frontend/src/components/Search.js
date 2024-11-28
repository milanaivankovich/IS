import React from "react";

import "./Search.css";
import Icon from "../images/iconMagnifier.svg";

const SearchComponent = () => {
  return (
    <form className="searchContainer" role="search">
      {/*   <label htmlFor="searchInput" className={styles["visually-hidden"]}>
        Search for templates and UI kits
      </label>  */}

      <div className="searchContent">
        <img src={Icon} alt="" className="searchIcon" />

        <input
          type="search"
          id="searchInput"
          className="searchInput"
          placeholder="Pretraga..."
          aria-label="Pretraga terena i korisnika"
        />
      </div>
    </form>
  );
};

export default SearchComponent;
