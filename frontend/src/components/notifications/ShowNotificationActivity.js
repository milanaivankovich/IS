import React from "react"
import ActivityCard from "../ActivityCard"
import { IoIosCloseCircle } from "react-icons/io";

const ShowNotificationActivity = ({ eventData, closeFunction }) => {

    return (
        <div className='dimmer'>
            <ActivityCard activity={eventData} />
            <IoIosCloseCircle className="close-icon-notifications-show-event" onClick={closeFunction} />
        </div>)
}

export default ShowNotificationActivity;
