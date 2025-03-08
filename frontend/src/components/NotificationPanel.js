import NotificationCard from "./NotificationCard";
import API from "../variables.js"
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer } from "react-bootstrap";
import userImg from "../images/user.svg";

const NotificationPanel = ({ userId }) => {

    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const fetchAll = async () => {
        setLoadingNotifications(true);
        await axios.get(`${API}/api/notifications/${userId}`) //token todo
            .then((response) =>
                setNotifications(response.data))
            .catch((error) =>
                console.error("Greska pri dohvacanju notifikacija"))
            .finally(() =>
                setLoadingNotifications(false));
    };
    useEffect(() => {
        fetchAll();
    }, []);

    return (
        <>
            <div className="Event-bar-title">NOTIFIKACIJE</div>
            {loadingNotifications ? (
                <p>Učitavanje...</p>
            ) : notifications.length === 0 ? (
                <p>Nema notifikacija.</p>
            ) : (
                <ToastContainer className="position-static">

                    {notifications.map((notif) => (
                        <NotificationCard key={notif.id}
                            userImgLink={notif.sender.profile_picture ? `${API}${notif.sender.prfile_picture}` : userImg}
                            userId={userId}
                            username={notif.sender.username}
                            content={notif.content} time={notif.created_at}
                            is_read={notif.is_read} />))
                    }

                </ToastContainer>
            )}

        </>);
}

export default NotificationPanel;