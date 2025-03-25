import React, { useEffect, useState } from "react";
import CreatorImg from "../images/user.svg";
import { Collapse, Fade, Toast } from "react-bootstrap";
import "./NotificationCard.css";
import API from "../variables";
import axios from "axios";
import ShowNotificationActivity from "./notifications/ShowNotificationActivity";
import ReactDOM from "react-dom";


const NotificationCard = ({ item_id, userImgLink, eventData, username, content, time, is_read }) => {
    //11 mins ago instead of time
    //todo mark all as read
    const date = new Date(time);
    const formatedTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const [show, setShow] = useState(true);
    const [isReadState, setIsReadState] = useState(is_read);

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
        if (!isReadState)
            try {
                const request = await axios.put(`${API}/api/notifications/mark-read/${item_id}/`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                })
                console.log(request);
                setIsReadState(true);
            }
            catch (error) {
                console.error("Error: ", error);
            }
    };

    //show event data window
    const Modal = ({ children }) => {
        return ReactDOM.createPortal(
            <div className="fixed-element">
                {children}
            </div>,
            document.body // Render outside of parent
        );
    };
    const [isVisible, setIsVisible] = useState(false);

    const toggleFloatingWindow = () => {
        setIsVisible(!isVisible);
    };


    return (<>
        <Collapse in={show} dimension="width" unmountOnExit timeout={400}>
            <Toast className={`toast-is-read-${isReadState}`}
                onClose={() => {
                    setShow(false);
                    deleteNotification();
                }
                }
                onClick={() => {
                    readNotification();
                    toggleFloatingWindow();
                }}
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
        {isVisible && eventData &&
            <Modal>
                <ShowNotificationActivity eventData={eventData} closeFunction={toggleFloatingWindow} />
            </Modal>}
    </>
    );
};

export default NotificationCard;