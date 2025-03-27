import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../variables.js";
import { Card, ListGroup, Spinner, Row, Col } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; // Dodaj chart library

const StatisticsPanelUser = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get(`${API}/api/sport-statistics/`);
                setStats(response.data);
                setError(null);
            } catch (error) {
                console.error("Greška pri dobavljanju statistike:", error);
                setError("Došlo je do greške pri učitavanju statistike");
            } finally {
                setLoading(false);
            }
        };
        fetchStatistics();
    }, []);

    // Formatiranje podataka za chart
    const prepareChartData = () => {
        if (!stats?.activities_per_month) return [];
        return stats.activities_per_month.map(item => ({
            month: new Date(item.month).toLocaleString('default', { month: 'long' }),
            count: item.count
        }));
    };

    if (loading) {
        return <div className="text-center mt-4"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-4">{error}</div>;
    }

    if (!stats) {
        return <div className="alert alert-info mt-4">Nema dostupnih podataka o statistici</div>;
    }

    return (
        <div className="statistics-panel p-4">
            <Row className="g-4">
                {/* Najpopularniji sport */}
                <Col md={6}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <i className="fas fa-trophy me-2"></i> Najpopularniji sport
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>{stats.popular_sport?.sport__name || 'N/A'}</strong>
                                <span className="float-end badge bg-primary">
                                    {stats.popular_sport?.total} aktivnosti
                                </span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>

                {/* Sport sa najviše učesnika */}
                <Col md={6}>
                    <Card>
                        <Card.Header className="bg-success text-white">
                            <i className="fas fa-users me-2"></i> Najviše učesnika
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>{stats.sport_with_most_participants?.sport__name || 'N/A'}</strong>
                                <span className="float-end badge bg-success">
                                    {stats.sport_with_most_participants?.total_participants} učesnika
                                </span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>

                {/* Prosječan broj učesnika */}
                <Col md={6}>
                    <Card>
                        <Card.Header className="bg-info text-white">
                            <i className="fas fa-chart-bar me-2"></i> Prosječan broj učesnika
                        </Card.Header>
                        <ListGroup variant="flush">
                            {stats.avg_participants_per_sport?.map((sport, index) => (
                                <ListGroup.Item key={index}>
                                    <strong>{sport.sport__name}</strong>
                                    <span className="float-end">
                                        {sport.avg_participants?.toFixed(1) || 0}
                                    </span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                {/* Aktivnosti po mjesecima - Chart */}
                <Col md={6}>
                    <Card>
                        <Card.Header className="bg-warning text-dark">
                            <i className="fas fa-calendar-alt me-2"></i> Aktivnosti po mjesecima
                        </Card.Header>
                        <Card.Body>
                            <BarChart width={500} height={300} data={prepareChartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#ffc107" name="Broj aktivnosti" />
                            </BarChart>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Lista svih sportova sa brojem aktivnosti */}
                <Col md={12}>
                    <Card>
                        <Card.Header className="bg-secondary text-white">
                            <i className="fas fa-list-ol me-2"></i> Sve statistike po sportovima
                        </Card.Header>
                        <ListGroup variant="flush">
                            {stats.activities_per_sport?.map((sport, index) => (
                                <ListGroup.Item key={index}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <strong>{sport.sport__name}</strong>
                                            <span className="ms-3 text-muted">
                                                {sport.total_activities} aktivnosti
                                            </span>
                                        </span>
                                        <span className="badge bg-primary rounded-pill">
                                            Prosječno {stats.avg_participants_per_sport[index]?.avg_participants?.toFixed(1)} učesnika
                                        </span>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StatisticsPanelUser;