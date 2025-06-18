import React, { useEffect, useState } from "react";
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import MenuBar from "../components/MenuBar";
import NotificationPanel from "../components/NotificationPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faMessage } from "@fortawesome/free-regular-svg-icons";
import { faBell, faRing, faClock } from "@fortawesome/free-regular-svg-icons";
import { fetchIdAndTypeOfUser } from "../utils.js";
import { Badge, Stack } from "react-bootstrap";
import axios from "axios";
import API from "../variables.js";
import { faChartBar, faCogs } from "@fortawesome/free-solid-svg-icons";
import StatisticsPanelUser from "../components/StatisticsPanelUser";
import StatisticsFieldsPanelUser from "../components/StatisticsFieldsPanelUser";
import Chat from "../components/Chat";
import ChatContainer from "../components/ChatContainer.js";
import ChatRooms from "../components/ChatRoom.js";
import ChatRoom from "../components/ChatRoom.js";
import Preferences from "../components/notifications/Preferences.js";
import { useNotifCountContext } from "../components/notifications/NotificationCountContext.js";
import ChatPage from "./ChatPage";


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
                            getNotifCount(userType?.id, userType?.type)
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
    //const [notifCount, setNotifCount] = useState(0);
    const { notifCount, setNotifCount } = useNotifCountContext();

    const getNotifCount = async (user_id, user_type) => {
        try {
            const request = await axios.get(`${API}/api/notifications/unread-count/${user_type}/${user_id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setNotifCount(request.data?.unread_count);
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
                                            {notifCount !== 0 &&
                                                <Badge bg="secondary" pill>{notifCount}</Badge>
                                            }
                                            <FontAwesomeIcon className="notification-icon" icon={faBell} />
                                        </Stack>
                                    </Nav.Link>
                                </Nav.Item>

                                <Nav.Item>
                                    <Nav.Link eventKey="third">
                                        <Stack direction="horizontal" gap={2}>
                                            Statistike sportova
                                            <FontAwesomeIcon className="notification-icon" icon={faChartBar} />
                                        </Stack>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="fourth">
                                        <Stack direction="horizontal" gap={2}>
                                            Statistike terena
                                            <FontAwesomeIcon className="notification-icon" icon={faChartBar} />
                                        </Stack>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="fifth">
                                        <Stack direction="horizontal" gap={2}>
                                            Podešavanja
                                            <FontAwesomeIcon className="notification-icon" icon={faCogs} />
                                        </Stack>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content className="tab-content-all">
                                <Tab.Pane eventKey="first">
                                    <ChatPage />;
                                </Tab.Pane>

                                <Tab.Pane eventKey="second">
                                    <NotificationPanel userId={userIdType?.id} userType={userIdType?.type}></NotificationPanel>
                                </Tab.Pane>
                                <Tab.Pane eventKey="third">
                                    <StatisticsPanelUser />
                                </Tab.Pane>
                                <Tab.Pane eventKey="fourth">
                                    <StatisticsFieldsPanelUser />
                                </Tab.Pane>
                                <Tab.Pane eventKey="fifth">
                                    <Preferences userId={userIdType?.id} userType={userIdType?.type} />
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>}
        </div >
    );
}

export default Dashboard;
