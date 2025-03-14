import React, { useEffect, useState } from "react";
import CreatorImg from "../images/user.svg";
import { Collapse, Fade, Toast } from "react-bootstrap";
import "./NotificationCard.css";
import API from "../variables";
import axios from "axios";


const NotificationCard = ({ item_id, userImgLink, userId, username, content, time, is_read }) => {
    //11 mins ago instead of time
    //todo mark all as read
    const date = new Date(time);
    const formatedTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const [show, setShow] = useState(true);

    //brisanje notifikacije
    const deleteNotification = async () => {
        try {
            const request = await axios.put(`${API}/api/notifications/delete/${item_id}/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            console.log(request);
        }
        catch (error) {
            console.error("Error: ", error);
        }
    };
    //is_read set to true todo
    const readNotification = async () => {
        try {
            const request = await axios.put(`${API}/api/notifications/mark-read/${item_id}/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            console.log(request);
        }
        catch (error) {
            console.error("Error: ", error);
        }
    };

    return (
        <Collapse in={show} dimension="width" unmountOnExit timeout={400}>
            <Toast className={`toast-is-read-${is_read}`}
                onClose={() => {
                    setShow(false);
                    deleteNotification();
                }
                }
                onClick={() => readNotification()}
            >
                <Toast.Header
                //closeVariant='delete'
                >
                    <img src={userImgLink} className="rounded me-2" id="notification-img" alt="" />
                    <strong className="me-auto">
                        <a className="link-to-profile" href={`/userprofile/${username}`}>
                            @{username}
                        </a></strong>
                    <small>{formatedTime}</small>
                </Toast.Header>
                <Toast.Body>{content}</Toast.Body>
            </Toast>
        </Collapse>
    );
};

export default NotificationCard;