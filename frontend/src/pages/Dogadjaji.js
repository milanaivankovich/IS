import React from "react";
import "./Dogadjaji.css";
import MenuBar from "../components/MenuBar.js";
import EventCard from "../components/EventCard.js";
import SponsoredEventCard from "../components/SponsoredEventCard.js";
import Footer from "../components/Footer.js";

const Dogadjaji = () => {
  return (
    <body>
      <header className="dogadjaji-header">
        <MenuBar variant={["registered"]} search={true} />
      </header>
      <div className="Events-body">
        <div className="Events-bar">
          <div className="Event-bar-title">DOGAĐAJI</div>
          <div className="Event-bar-subtitle">Šta ima novo u gradu?</div>
          <div className="Scroll-bar">
            <div className="Event-cards">
            <EventCard key='example' title='title' description='description' />
                
            </div>
          </div>
        </div>
        <div className="Events-bar">
          <div className="Event-bar-title">SPONZORISANO</div>
          <div className="Event-bar-subtitle">Sponzorisani događaji</div>
          <div className="Scroll-bar">
            <div className="Event-cards">
            <EventCard key='example' title='title' description='description' />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </body>
  );
};

export default Dogadjaji;
