import React, { useEffect, useState } from "react";
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import 'bootstrap/dist/css/bootstrap.min.css';
import MenuBar from "../components/MenuBar";
import NotificationPanel from "../components/NotificationPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faMessage } from "@fortawesome/free-regular-svg-icons";
import { faBell, faRing, faClock } from "@fortawesome/free-regular-svg-icons";
import { fetchIdAndTypeOfUser } from "../utils.js";
import { Badge, Stack } from "react-bootstrap";
import axios from "axios";
import API from "../variables.js";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import StatisticsPanelUser from "../components/StatisticsPanelUser";
import Chat from "../components/Chat"; // Import Chat component
import ChatContainer from "../components/ChatContainer.js";

const Dashboard = () => {

    const [userIdType, setUserIdType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const is_registered = async () => {
            setLoading(true);
            try {
                await fetchIdAndTypeOfUser()
                    .then((userType) => {
                        if (userType) {
                            setUserIdType(userType);
                            getNotificationCount(userType?.id, userType?.type)
                        }
                    });
            } catch (error) {
                console.error(error + "Error");
                alert("Došlo je do greške.");
            }
            setLoading(false);
        };
        is_registered();
    }, []);

    // Number of unread messages and notifications
    const [messagesCount, setMessagesCount] = useState(1);
    const [notificationCount, setNotificationCount] = useState(0);

    const getNotificationCount = async (user_id, user_type) => {
        try {
            const request = await axios.get(`${API}/api/notifications/unread-count/${user_type}/${user_id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setNotificationCount(request.data?.unread_count);
        }
        catch (error) {
            console.error("Error: ", error);
        }
    };

    return (
        <div className="dashboard-body">
            <MenuBar search={true} id="dashboard-menu" />
            {loading ? <div className='loading-line'></div>
                :
                <Tab.Container fill={true} className="tab-container" id="left-tabs-example" defaultActiveKey="first">
                    <Row>
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="first">
                                        <Stack direction="horizontal" gap={2}>
                                            Poruke
                                            {messagesCount !== 0 &&
                                                <Badge bg="secondary" pill>{messagesCount}</Badge>
                                            }
                                            <FontAwesomeIcon className="notification-icon" icon={faMessage} />
                                        </Stack>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="second">
                                        <Stack direction="horizontal" gap={2}>
                                            Notifikacije
                                            {notificationCount !== 0 &&
                                                <Badge bg="secondary" pill>{notificationCount}</Badge>
                                            }
                                            <FontAwesomeIcon className="notification-icon" icon={faBell} />
                                        </Stack>
                                    </Nav.Link>
                                </Nav.Item>

                                <Nav.Item>
                                    <Nav.Link eventKey="third">
                                        <Stack direction="horizontal" gap={2}>
                                            Statistika
                                            <FontAwesomeIcon className="notification-icon" icon={faChartBar} />
                                        </Stack>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content className="tab-content-all">
                                <Tab.Pane eventKey="first">
                                    
                                    <ChatContainer token={userIdType?.id} />
                                </Tab.Pane>
                                <Tab.Pane eventKey="second">
                                    <NotificationPanel userId={userIdType?.id} userType={userIdType?.type}></NotificationPanel>
                                </Tab.Pane>
                                <Tab.Pane eventKey="third">
                                    <StatisticsPanelUser />
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>}
        </div >
    );
}

export default Dashboard;
