import NotificationCard from "./NotificationCard";
import API from "../variables.js"
import { useEffect, useState } from "react";
import axios from "axios";
import { Spinner, ToastContainer } from "react-bootstrap";
import userImg from "../images/user.svg";
import { useInView } from "react-intersection-observer";
import "./notifications/NotificationPanel.css";
import ActivityCard from "./ActivityCard.js";
import { useNotifCountContext } from "./notifications/NotificationCountContext";

const NotificationPanel = ({ userId, userType }) => {

    const [nextPage, setNextPage] = useState(null);
    //dohvacanje 10 notifikacija
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const { notifCount, setNotifCount } = useNotifCountContext();
    const fetchAll = async () => {
        setLoadingNotifications(true);
        await axios.get(`${API}/api/notifications/pagination/${userType}/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
        )
            .then((response) => {
                setNotifications(response.data?.results)
                setNextPage(response.data?.next ? response.data.next : null);
            })
            .catch((error) =>
                console.error(error, "Greska pri dohvacanju notifikacija"))
            .finally(() =>
                setLoadingNotifications(false));
    };
    useEffect(() => {
        fetchAll();
    }, []);

    //inView paginacija
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const fetchNextPage = async () => {
        setIsFetchingNextPage(true);
        await axios.get(`${nextPage}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then((response) => {
                setNotifications((prev) => Array.isArray(prev) ? [...prev, ...response.data.results] : response.data.results);
                setNextPage(response.data?.next ? response.data.next : null);
            })
            .catch((error) =>
                console.error("Greska pri dohvacanju notifikacija"))
            .finally(() =>
                setIsFetchingNextPage(false));
    };

    const { ref } = useInView({
        threshold: 1,
        onChange: (inView) => {
            if (inView && nextPage) fetchNextPage();
        }
    });

    //mark all as read
    const markAllAsRead = async () => {
        await axios.put(`${API}/api/notifications/mark-all-read/${userType}/${userId}/`, null, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
        )
            .then((response) => {
                fetchAll();
                setNotifCount(0);
            })
            .catch((error) =>
                console.error(error + "Greska pri mark all as read"));
    };

    return (
        <div className="notification-panel-body">
            <div className="Event-bar-title">NOTIFIKACIJE</div>
            <button className="mark-all-as-read-button" onClick={markAllAsRead}>Označi sve kao pročitano</button>
            {loadingNotifications ? (
                <Spinner className='spinner-border' animation="border" />
            ) : notifications?.length === 0 ? (
                <p>Nema notifikacija.</p>
            ) : (
                <div>
                    <ToastContainer className="toast-container">

                        {notifications?.map((notif, index) => (
                            <NotificationCard key={index}
                                item_id={notif?.id}
                                userImgLink={notif?.sender_client?.profile_picture ? `${API}${notif?.sender_client?.profile_picture}` :
                                    notif?.sender_subject?.profile_picture ? `${API}${notif?.sender_subject?.profile_picture}` :
                                        userImg}
                                eventData={notif.hasOwnProperty("activity") ? notif?.activity : notif?.advertisement}
                                eventDataType={notif.hasOwnProperty("activity") ? "activity" : "advertisement"}
                                username={notif?.sender_client?.username ? notif?.sender_client?.username : notif?.sender_subject?.name}
                                content={notif?.content} time={notif?.created_at}
                                is_read={notif?.is_read}
                            />))
                        }
                        <div ref={ref} style={{ height: "40px" }}>
                            {isFetchingNextPage && <Spinner className='spinner-border' animation="border" />}
                        </div>
                    </ToastContainer>
                </div>
            )}

        </div>);
}

export default NotificationPanel;