import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, Spinner, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import '../components/StatisticsPanelUser.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const sports = [
  { id: 1, name: 'Košarka' },
  { id: 2, name: 'Fudbal' },
  { id: 3, name: 'Tenis' },
  { id: 4, name: 'Odbojka' }
];

const StatisticsFieldsPanelUser = () => {
  const [selectedSport, setSelectedSport] = useState(1);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartFields, setChartFields] = useState({}); 

  useEffect(() => {
    setLoading(true);

    axios.get('http://127.0.0.1:8000/api/top-fields-by-sport/')
      .then(response => {
        const idsBySport = response.data;

        Promise.all(
          sports.map(sport => {
            const ids = idsBySport[sport.id] || [];
            return Promise.all(
              ids.map(id =>
                axios.get(`http://127.0.0.1:8000/api/field/id/${id}/`).then(res => res.data)
              )
            ).then(fieldDetails => ({ sportId: sport.id, fields: fieldDetails }));
          })
        ).then(results => {
          const newChartFields = {};
          results.forEach(({ sportId, fields }) => {
            newChartFields[sportId] = fields;
          });
          setChartFields(newChartFields);
          setFields(newChartFields[selectedSport] || []);
          setLoading(false);
        });
      })
      .catch(error => {
        console.error("Greška pri dohvaćanju podataka:", error);
        setLoading(false);
      });
  }, [selectedSport]);


  const generatePieData = (fields) => {
    const locationCounts = {};
  
    fields.forEach(field => {
      const loc = field.location;
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
  
    const labels = Object.keys(locationCounts);
    const data = Object.values(locationCounts);
  
    const orangeColors = [
      '#FFD9B3', '#FFCC80', '#FFB74D', '#FF9E00', '#FFB84D',
      '#FF9800', '#FF6F00', '#FF7F32', '#FF9A33', '#FF7F50',
    ];
  
    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: orangeColors.slice(0, labels.length), 
        }
      ]
    };
  };  
  

  return (
    <motion.div className="statistics-panel p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <Row className="mb-3 text-start">
        <Col>
          {sports.map(sport => (
            <Button
              key={sport.id}
              variant={selectedSport === sport.id ? "orange" : "outline-orange"}
              onClick={() => {
                setSelectedSport(sport.id);
                setShowChart(false);
                setFields(chartFields[sport.id] || []);
              }}
              className="me-2"
            >
              {sport.name}
            </Button>
          ))}
          <Button
            variant={showChart ? "orange" : "outline-orange"}
            onClick={() => setShowChart(!showChart)}
            className="me-2"
          >
            Grafici
          </Button>
        </Col>
      </Row>

      {showChart ? (
        <>
        <h6 className="text-start mb-3">Grafički prikaz terena po sportovima</h6>
        <br />
        <Row className="mt-4">
          {sports.map(sport => (
            <Col key={sport.id} md={6} lg={3} className="mb-4 text-center">
              <h6>{sport.name}</h6>
              {chartFields[sport.id] && chartFields[sport.id].length > 0 ? (
                <Pie data={generatePieData(chartFields[sport.id])} />
              ) : (
                <p>Nema podataka</p>
              )}
            </Col>
          ))}
        </Row>
      </>
      ) : (
        <>
          <Row>
            <h4 className="text-start mb-3">
              {sports.find(s => s.id === selectedSport)?.name}
            </h4>
            <h6 className="text-start mb-3">Top 5 najpopularnijih terena</h6>
            {loading ? (
              <Col className="text-center"><Spinner animation="border" /></Col>
            ) : fields.length > 0 ? (
              fields.map(field => (
                <Col md={4} key={field.id} className="mb-4 d-flex">
                  <Card className="card-hover" style={{ width: "100%", height: "100%" }}>
                    <Card.Img variant="top" src={`http://127.0.0.1:8000${field.image}`} />
                    <Card.Body>
                      <Card.Title>{field.location}</Card.Title>
                      <Card.Text>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" /> {field.precise_location}<br />
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col><p>Nema dostupnih terena za izabrani sport.</p></Col>
            )}
          </Row>
        </>
      )}
    </motion.div>
  );
};

export default StatisticsFieldsPanelUser;