import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import MovementForm from "../components/MovementForm";

const Dashboard = () => {
  return (
    <Container className="vh-100 mt-5">
      <Row>
        <MovementForm />
      </Row>
    </Container>
  );
};

export default Dashboard;
