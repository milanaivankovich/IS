import React, { useEffect, useState } from "react";
import CreatorImg from "../images/user.svg";
import { Toast } from "react-bootstrap";
import "./NotificationCard.css";
import API from "../variables";


const NotificationCard = ({ userImgLink, userId, username, content, time, is_read }) => {
    //11 mins ago instead of time
    //linkovi ka profilu todo
    const date = new Date(time);
    const formatedTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return (
        <Toast>
            <Toast.Header>
                <img src={userImgLink} className="rounded me-2" id="notification-img" alt="" />
                <strong className="me-auto">
                    <a className="link-to-profile" href={`/userprofile/${username}`}>
                        @{username}
                    </a></strong>
                <small>{formatedTime}</small>
            </Toast.Header>
            <Toast.Body>{content}</Toast.Body>
        </Toast>
    );
};

export default NotificationCard;