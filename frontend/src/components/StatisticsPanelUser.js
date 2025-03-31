import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../variables.js";
import { motion } from "framer-motion";
import { Card, ListGroup, Spinner, Row, Col, Button } from "react-bootstrap";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";

const monthNames = [
    "Januar", "Februar", "Mart", "April", "Maj", "Juni", 
    "Juli", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
];

const StatisticsPanelUser = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState("all"); // Dodato za biranje perioda

    const fetchStatistics = async (selectedPeriod) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/api/sport-statistics/?period=${selectedPeriod}`);
            setStats(response.data);
            setError(null);
        } catch (error) {
            console.error("Greška pri dobavljanju statistike:", error);
            setError("Došlo je do greške pri učitavanju statistike");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics(period);
    }, [period]);

    const prepareChartData = () => {
        if (!stats?.activities_per_month) return [];
        return stats.activities_per_month.map(item => ({
            month: monthNames[item.month - 1],  
            count: item.count
        }));
    };

    if (loading) {
        return <div className="text-center mt-4"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-4">{error}</div>;
    }

    return (
        <motion.div className="statistics-panel p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>

            {/* Dugmad za biranje vremenskog perioda */}
            <Row className="mb-3 text-center">
                <Col>
                    <Button variant="outline-orange" onClick={() => setPeriod("7d")} className="me-2">Posljednjih 7 dana</Button>
                    <Button variant="outline-orange" onClick={() => setPeriod("1m")} className="me-2">Posljednjih mjesec dana</Button>
                    <Button variant="outline-orange" onClick={() => setPeriod("6m")} className="me-2">Posljednjih 6 mjeseci</Button>
                    <Button variant="orange" onClick={() => setPeriod("all")}>Sve vrijeme</Button>
                </Col>
            </Row>

            <Row className="g-4">
                <Col md={6}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-orange text-orange">
                                <i className="fas fa-trophy me-2"></i> Najpopularniji sport
                            </Card.Header>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <strong>{stats.popular_sport?.sport__name || 'N/A'}</strong>
                                    <span className="float-end badge bg-orange">
                                        {stats.popular_sport?.total} aktivnosti
                                    </span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card>
                    </motion.div>
                </Col>

                <Col md={6}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-orange text-orange">
                                <i className="fas fa-users me-2"></i> Sport sa najviše učesnika
                            </Card.Header>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <strong>{stats.sport_with_most_participants?.sport__name || 'N/A'}</strong>
                                    <span className="float-end badge bg-orange">
                                        {stats.sport_with_most_participants?.total_participants} učesnika
                                    </span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            <Row className="g-4 mt-3">
                <Col md={6}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-orange text-white">
                                <i className="fas fa-chart-bar me-2"></i> Aktivnosti po mjesecima
                            </Card.Header>
                            <Card.Body>
                                <div style={{ height: 300 }}>
                                    <ResponsiveBar
                                        data={prepareChartData()}
                                        keys={["count"]}
                                        indexBy="month"
                                        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                                        padding={0.3}
                                        colors={{ scheme: "orange_red" }}
                                        animate={true}
                                        axisBottom={{ tickRotation: -45 }}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
                
                <Col md={6}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-orange text-white">
                                <i className="fas fa-chart-pie me-2"></i> Aktivnosti po sportovima
                            </Card.Header>
                            <Card.Body>
                                <div style={{ height: 300 }}>
                                    <ResponsivePie
                                        data={stats.activities_per_sport.map(item => ({
                                            id: item.sport__name,
                                            label: item.sport__name,
                                            value: item.total_activities
                                        }))}
                                        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                                        colors={{ scheme: "orange_red" }}
                                        animate={true}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default StatisticsPanelUser;
