import React from "react";
import "./MenuBar.css";
import logo from "../images/logo.png";
import profileImage from "../images/user.svg";
import SearchComponent from "./Search.js";
import PropTypes from "prop-types";

const MenuBar = ({ variant, search }) => {
  return (
    <nav className="menu-bar">
      <div className="menu-left">
        <img src={logo} className="logo" />
        <ul className="menu">
          <li className="menu-item">
            <a href="pocetna">Početna</a>
          </li>
          <li className="menu-item">
            <a href="tereni">Tereni</a>
          </li>
          <li className="menu-item">
            <a href="dogadjaji">Događaji</a>
          </li>
        </ul>
      </div>
      {variant.includes("registered") && (
        <div className="menu-right">
          {search && <SearchComponent />}
          <a href="userprofile">
            <img
              src={profileImage}
              alt="Circular Image"
              className="user-image"
            />
          </a>
        </div>
      )}

      {variant.includes("unregistered") && (
        <div className="menu-right">
          <button
            className="login-button"
            onClick={() => (window.location.href = "/usertype")}
          >
            Prijava
          </button>
          <button
            className="register-button"
            onClick={() => (window.location.href = "/usertype1")}
          >
            Registracija
          </button>
        </div>
      )}
    </nav>
  );
};

export function MenuBarVariants(variant, search) {
  return <MenuBar variant={variant} search={search} />;
}

MenuBar.propTypes = {
  variant: PropTypes.arrayOf(PropTypes.oneOf(["registered", "unregistered"])),
  search: PropTypes.bool,
};

MenuBar.defaultProps = {
  variant: "unregistered",
  search: false,
};

export default MenuBar;
