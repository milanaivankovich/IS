import React, { useState, useEffect } from "react";
import axios from "axios";

import "leaflet/dist/leaflet.css";
import "./Dogadjaji.css";
import MenuBar from "../components/MenuBar.js";
import Footer from "../components/Footer.js";
import SponsoredEventCard from "../components/SponsoredEventCard";
import ActivityCard from "../components/ActivityCard";
import ActivityPanel from "../components/ActivityPanel.js";

const Dogadjaji = () => {
  const [activities, setActivities] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [loadingAdvertisements, setLoadingAdvertisements] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const filterFutureEvents = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetuje trenutni datum na ponoć

    return events.filter((event) => {
      const eventDate = new Date(event.date);
      console.log("Event Date:", eventDate); // Log za provere
      console.log("Today:", today); // Log za provere

      return eventDate >= today; // Proverava da li je datum budući ili današnji
    });
  };
  // Dohvaćanje reklama
  const [advertisementsNextPage, setAdvertisementsNextPage] = useState("");
  const fetchAdvertisements = async () => {
    setLoadingAdvertisements(true);
    try {
      const response = await axios.get("http://localhost:8000/api/advertisements/");
      if (response.data.error || response.data.length === 0 || response.data?.results.length === 0) {
        setAdvertisements([]);
      } else {
        //const futureAdvertisements = filterFutureEvents(response.data);
        //setAdvertisements(futureAdvertisements);
        setAdvertisements(response.data?.results);
        setAdvertisementsNextPage(response.data?.next)
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju oglasa:", error);
    } finally {
      setLoadingAdvertisements(false);
    }
  };
  const [activitiesNextPage, setActivitiesNextPage] = useState("");
  // Dohvaćanje aktivnosti
  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await axios.get("http://localhost:8000/api/activities/");
      if (response.data?.error || response.data.length === 0 || response.data?.results.length === 0) {
        setActivities([]);
      } else {
        //const futureActivities = filterFutureEvents(response.data);
        //setActivities(futureActivities);
        await setActivities(response.data?.results);
        await setActivitiesNextPage(response.data?.next);
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju aktivnosti:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
    fetchActivities();
  }, []);

  return (
    <div className="tereni-page-container">
      <header className="tereni-header">
        <MenuBar variant={["registered"]} search={true} />
      </header>

      <div className="Events-body">
        {/* Sekcija za reklame */}
        <div className="Events-bar">
          <div className="Event-bar-title">REKLAME</div>
          {loadingAdvertisements ? (
            <p>Učitavanje reklama...</p>
          ) : advertisements.length === 0 ? (
            <p>Nema reklama.</p>
          ) : (
            <div className="Scroll-bar">
              <ActivityPanel variant="advertisements" activityDataArray={advertisements} nextPage={advertisementsNextPage} />
              {/*advertisements.map((advertisement) => (
                  <SponsoredEventCard key={advertisement.id} event={advertisement} />
                ))*/}
            </div>
          )}
        </div>

        {/* Sekcija za aktivnosti */}
        <div className="Events-bar">
          <div className="Event-bar-title">AKTIVNOSTI</div>
          {loadingActivities && !activities ? (
            <p>Učitavanje aktivnosti...</p>
          ) : activities.length === 0 ? (
            <p>Nema aktivnosti.</p>
          ) : (
            <div className="Scroll-bar">
              <ActivityPanel variant="activities" activityDataArray={activities} nextPage={activitiesNextPage} />
              {/*activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))*/}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dogadjaji;
