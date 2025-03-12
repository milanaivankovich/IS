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

const Dashboard = () => {

    const [userIdType, setUserIdType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const is_registered = async () => {
            setLoading(true);
            try {
                await fetchIdAndTypeOfUser()
                    .then((userType) => {
                        if (!userType || userType === "BusinessSubject") {
                            alert("Niste ulogovani kao rekreativac!");
                            window.location.replace('/pocetna');
                        }
                        setUserIdType(userType);
                    });
            } catch (error) {
                console.error("Error");
                alert("Došlo je do greške.");
            }
            setLoading(false);
        };
        is_registered();
    }, []);

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
                                        Poruke
                                        <FontAwesomeIcon className="notification-icon" icon={faMessage} />
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="second">
                                        Notifikacije
                                        <FontAwesomeIcon className="notification-icon" icon={faBell} />
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