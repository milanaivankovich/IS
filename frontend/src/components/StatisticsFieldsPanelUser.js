import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../variables.js";
import { motion } from "framer-motion";
import { Card, ListGroup, Spinner, Row, Col, Button } from "react-bootstrap";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";


const sports = [
  { id: 1, name: 'Košarka' },
  { id: 2, name: 'Fudbal' },
  { id: 3, name: 'Tenis' },
  { id: 4, name: 'Odbojka' }
];

const StatisticsFieldsPanelUser = () => {
  const [selectedSport, setSelectedSport] = useState(1);
  const [fieldIds, setFieldIds] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/top-fields-by-sport/')
      .then(response => {
        const data = response.data;
        setFieldIds(data[selectedSport] || []);
      })
      .catch(error => {
        console.error('Greška pri dohvaćanju podataka:', error);
      });
  }, [selectedSport]);

  return (
    <motion.div className="statistics-panel p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      
      <Row className="mb-3 text-center">
        <Col>
          {sports.map(sport => (
            <Button
              key={sport.id}
              variant={selectedSport === sport.id ? "orange" : "outline-orange"}
              onClick={() => setSelectedSport(sport.id)}
              className="me-2"
            >
              {sport.name}
            </Button>
          ))}
        </Col>
      </Row>

      <Row>
        <Col>
          <h4 className="mb-3">{sports.find(s => s.id === selectedSport).name}</h4>
          <h6 className="mb-3">Top 5 najpopularnijih terena</h6>
          {fieldIds.length > 0 ? (
            <ListGroup>
              {fieldIds.map(id => (
                <ListGroup.Item key={id}>Teren ID: {id}</ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>Nema dostupnih terena za izabrani sport.</p>
          )}
        </Col>
      </Row>

    </motion.div>
  );
};

export default StatisticsFieldsPanelUser;

