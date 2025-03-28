import React from "react"
import ActivityCard from "../ActivityCard"
import { IoIosCloseCircle } from "react-icons/io";
import SponsoredEventCard from "../SponsoredEventCard";

//veliki prikaz za activity ili advertisement

const ShowNotificationActivity = ({ eventData, eventDataType, closeFunction }) => {

    return (
        <div className='dimmer'>
            {eventDataType === "activity" && <ActivityCard activity={eventData} />}
            {eventDataType === "advertisement" && <SponsoredEventCard event={eventData} />}
            <IoIosCloseCircle className="close-icon-notifications-show-event" onClick={closeFunction} />
        </div>)
}

export default ShowNotificationActivity;
