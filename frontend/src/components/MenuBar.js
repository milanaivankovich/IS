import React, { useEffect, useState } from "react";
import "./MenuBar.css";
import logo from "../images/logo.png";
import profileImage from "../images/user.svg";
import SearchComponent from "./Search.js";
import PropTypes from "prop-types";
import axios from "axios";


//variant ostavljeno zbog ostatka koda, ne sluzi nicemu
const MenuBar = ({ variant, search }) => {

  const [id, setID] = useState({
    "id": -1,
    "type": ''
  });

  useEffect(() => {
    const fetchIDType = async () => {
      await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          setID(request.data);
        })
        .catch((error) => {
          console.error("Menu bar unregistered: ", error);
        });
    };
    fetchIDType();
  }, []);

  return (
    <nav className="menu-bar">
      <div className="menu-left">
        <img src={logo} className="logo-oce-neko-na-basket" />
        <ul className="menu">
          <li className="menu-item">
            <a href="/pocetna">Početna</a>
          </li>
          <li className="menu-item">
            <a href="/tereni">Tereni</a>
          </li>
          <li className="menu-item">
            <a href="/dogadjaji">Događaji</a>
          </li>
        </ul>
      </div>
      {id.id !== -1 && (
        <div className="menu-right">
          {search && <SearchComponent />}
          <a href="/userprofile">
            <img
              src={profileImage}
              alt="Circular Image"
              className="user-image"
            />
          </a>
        </div>
      )}

      {id.id === -1 && (
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
