import React, { useEffect, useState } from "react";
import "./MenuBar.css";
import logo from "../images/logo.png";
import profileImage from "../images/user.svg";
import SearchComponent from "./Search.js";
import PropTypes from "prop-types";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "react-bootstrap";
import { getNewNotificationCount } from "../utils.js";

//variant ostavljeno zbog ostatka koda, ne sluzi nicemu
const MenuBar = ({ variant, search }) => {

  const [id, setID] = useState({
    "id": -1,
    "type": ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIDType = async () => {
      setLoading(true);
      await axios.get('http://localhost:8000/api/get-user-type-and-id/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((request) => {
          setID(request.data);
        })
        .catch((error) => {
          console.error("Menu bar unregistered: ", error);
        });
      setLoading(false);
    };
    fetchIDType();
  }, []);

  const [newNotifications, setNewNotifications] = useState("0");
  useEffect(() => {
    getNewNotificationCount(id.id, id.type).then((count) =>
      setNewNotifications(count));
  }, [id]);


  return (
    <nav id="menu-bar" className="menu-bar">
      <div className="menu-left">
        <img src={logo} className="logo-oce-neko-na-basket" />
        <ul className="menu-buttons-list">
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
      {loading ? <></> :
        (
          (id.id !== -1) && (
            <div className="menu-right">
              {search && <SearchComponent />}
              <div className="notification-signals-stack">
                <FontAwesomeIcon className="notification-icon" icon={faBell} onClick={() => (window.location.href = "/dashboard")}
                  shake={false} //staviti true ako ima novih notifikacija todo
                />
                {newNotifications !== 0 && <FontAwesomeIcon className="new-notification-signal-icon" icon={faCircle} />}
              </div>
              <a href="/userprofile">
                <img
                  src={profileImage}
                  alt="Circular Image"
                  className="user-image"
                />
              </a>
            </div>
          )
          ||
          (
            id.id === -1 && (
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
            )
          )
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
