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
  const [data, setData] = useState([]); // Datos reales
  const [filteredData, setFilteredData] = useState([]); // Datos filtrados
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(""); // Fecha inicial del filtro
  const [endDate, setEndDate] = useState(""); // Fecha final del filtro
  const [selectedMonth, setSelectedMonth] = useState(""); // Nuevo estado para el filtro por mes

  const buttonsRef = useRef(null);
  const formRef = useRef(null);

  // URL base desde la variable de entorno
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/movements`);
        setData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [backendUrl]);

  // Función para filtrar por rango de fechas y, opcionalmente, por mes
  const handleFilter = () => {
    // ✅ Si no hay fechas pero hay un mes seleccionado, filtrar solo por mes
    if (!startDate || !endDate) {
      if (selectedMonth === "") {
        alert("Por favor selecciona un rango de fechas o un mes.");
        return;
      }

      // ✅ Filtrar solo por mes
      const filtered = data.filter(
        (item) =>
          new Date(item.fechaPago).getMonth() === parseInt(selectedMonth)
      );

      if (filtered.length === 0) {
        alert("No hay movimientos en el mes seleccionado.");
        return;
      }

      setFilteredData(filtered);
      return;
    }

    // ✅ Convertimos a `YYYY-MM-DD` para asegurar comparación precisa
    const adjustedStartDate = new Date(startDate).toISOString().split("T")[0];

    // ✅ Ajustamos `endDate` para incluir todo el día
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);
    const finalEndDate = adjustedEndDate.toISOString().split("T")[0];

    // ✅ Filtramos los datos por rango de fechas
    let filtered = data.filter((item) => {
      const itemDate = new Date(item.fechaPago).toISOString().split("T")[0];
      return itemDate >= adjustedStartDate && itemDate <= finalEndDate;
    });

    // ✅ Si también se seleccionó un mes, aplicar el filtro adicional
    if (selectedMonth !== "") {
      filtered = filtered.filter(
        (item) =>
          new Date(item.fechaPago).getMonth() === parseInt(selectedMonth)
      );
    }

    if (filtered.length === 0) {
      alert("No hay movimientos en el rango de fechas y mes seleccionado.");
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
      {/* Filtros: Por fecha y por mes */}
      <Card className="mb-4 shadow-sm border-0 w-100">
        <Card.Body>
          <Card.Title className="text-center display-4 font-weight-bold">
            Dashboard General
          </Card.Title>
          <Card.Text className="text-center text-muted fs-5">
            Filtra por rango de fechas o selecciona un mes para personalizar los
            datos.
          </Card.Text>
          <Form
            ref={formRef}
            className="d-flex justify-content-center align-items-center gap-3 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            {/* Filtro por rango de fechas */}
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
            {/* Filtro por Mes */}
            <Form.Group className="mb-0">
              <Form.Label className="fw-bold">Mes:</Form.Label>
              <Form.Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-secondary"
              >
                <option value="">Todos</option>
                <option value="0">Enero</option>
                <option value="1">Febrero</option>
                <option value="2">Marzo</option>
                <option value="3">Abril</option>
                <option value="4">Mayo</option>
                <option value="5">Junio</option>
                <option value="6">Julio</option>
                <option value="7">Agosto</option>
                <option value="8">Septiembre</option>
                <option value="9">Octubre</option>
                <option value="10">Noviembre</option>
                <option value="11">Diciembre</option>
              </Form.Select>
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
