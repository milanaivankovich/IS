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

const Dashboard = () => {

    const [userIdType, setUserIdType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const is_registered = async () => {
            setLoading(true);
            try {
                await fetchIdAndTypeOfUser()
                    .then((userType) => {
                        if (!userType || userType.type === "BusinessSubject") {
                            alert("Niste ulogovani kao rekreativac!");
                            window.location.replace('/pocetna');
                        }
                        setUserIdType(userType);
                        getNotificationCount(userType.id)
                    });
            } catch (error) {
                console.error("Error");
                alert("Došlo je do greške.");
            }
            setLoading(false);
        };
        is_registered();
    }, []);

    //broj neprocitanih poruka todo
    const [messagesCount, setMessagesCount] = useState(1);
    //broj neprocitanih notifikacija
    const [notificationCount, setNotificationCount] = useState(0); //todo get zahtjev
    const getNotificationCount = async (user_id) => {
        try {
            const request = await axios.get(`${API}/api/notifications/unread-count/${user_id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setNotificationCount(request.data?.unread_count);
            console.log(request);
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
                                            {messagesCount !== 0 && //todo staviti broj novih poruka
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
                                        Uskoro
                                        <FontAwesomeIcon className="notification-icon" icon={faClock} />
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content className="tab-content-all">
                                <Tab.Pane eventKey="first">
                                    Chat
                                </Tab.Pane>
                                <Tab.Pane eventKey="second">
                                    <NotificationPanel userId={userIdType?.id}></NotificationPanel>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>}
        </div >);
}
export default Dashboard;