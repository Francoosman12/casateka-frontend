import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Card, Button, Spinner, Form } from "react-bootstrap";
import axios from "axios";
import CashData from "./CashData";
import CashDollarData from "./CashDollarData";
import CashEuroData from "./CashEuroData";
import CardData from "./CardData";
import VirtualCardData from "./VirtualCardData";
import TransferData from "./TransferData";
import Totals from "./Totals";

const GeneralDashboard = () => {
  const [data, setData] = useState([]); // Estado para almacenar datos reales
  const [filteredData, setFilteredData] = useState([]); // Datos filtrados
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(""); // Fecha inicial del filtro
  const [endDate, setEndDate] = useState(""); // Fecha final del filtro
  const buttonsRef = useRef(null); // Ref para los botones que queremos ocultar
  const formRef = useRef(null); // Ref para ocultar el formulario

  // URL base desde la variable de entorno
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/movements`); // Utilizando la variable de entorno
        setData(response.data); // Asignar los datos al estado
        setFilteredData(response.data); // Inicialmente, los datos no están filtrados
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [backendUrl]);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona un rango de fechas válido.");
      return;
    }

    // ✅ Convertimos a `YYYY-MM-DD` para asegurar comparación precisa
    const adjustedStartDate = new Date(startDate).toISOString().split("T")[0];

    // ✅ Ajustamos `endDate` para incluir todo el día
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);
    const finalEndDate = adjustedEndDate.toISOString().split("T")[0];

    // ✅ Filtramos los datos usando el mismo método que en reportes
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.fechaPago).toISOString().split("T")[0]; // 🔹 Comparar sin horas
      return itemDate >= adjustedStartDate && itemDate <= finalEndDate;
    });

    if (filtered.length === 0) {
      alert("No hay movimientos en el rango de fechas seleccionado.");
      return;
    }

    setFilteredData(filtered);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando datos...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-5">
      {/* Filtros por Fecha */}
      <Card className="mb-4 shadow-sm border-0 w-100">
        <Card.Body>
          <Card.Title className="text-center display-4 font-weight-bold">
            Dashboard General
          </Card.Title>
          <Card.Text className="text-center text-muted fs-5">
            Filtra por rango de fechas para personalizar los datos.
          </Card.Text>
          <Form
            ref={formRef}
            className="d-flex justify-content-center align-items-center gap-3 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            <Form.Group className="mb-0">
              <Form.Label className="fw-bold">Desde:</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-secondary"
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label className="fw-bold">Hasta:</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-secondary"
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleFilter}
              className="px-3 py-1 fw-bold text-white"
              style={{ fontSize: "0.9rem" }}
            >
              Filtrar
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Totales Generales */}
      <Row className="my-4 w-100 totales">
        <Card className="border-0 w-100">
          <Card.Body>
            <Totals data={filteredData} />
          </Card.Body>
        </Card>
      </Row>

      {/* Otros componentes */}
      <Row className="my-4 w-100 cash-data">
        <Card className="border-0 w-100">
          <Card.Body>
            <CashData data={filteredData} />
          </Card.Body>
        </Card>
      </Row>
      <Row className="my-4 w-100 cash-dollar-data">
        <Card className="border-0 w-100">
          <Card.Body>
            <CashDollarData data={filteredData} />
          </Card.Body>
        </Card>
      </Row>
      <Row className="my-4 w-100 cash-euro-data">
        <Card className="border-0 w-100">
          <Card.Body>
            <CashEuroData data={filteredData} />
          </Card.Body>
        </Card>
      </Row>
      <Row className="my-4 w-100 card-data">
        <Card className="border-0 w-100">
          <Card.Body>
            <CardData data={filteredData} />
          </Card.Body>
        </Card>
      </Row>
      <Row className="my-4 w-100 virtual-card-data">
        <Card className="border-0 w-100">
          <Card.Body>
            <VirtualCardData data={filteredData} />
          </Card.Body>
        </Card>
      </Row>
      <Row className="my-4 w-100 transfer-data">
        <Card className="border-0 w-100">
          <Card.Body>
            <TransferData data={filteredData} />
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
};

export default GeneralDashboard;
