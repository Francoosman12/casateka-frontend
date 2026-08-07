import React, { useEffect, useMemo, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import apiClient from "../api/client";
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
  const [selectedMonth, setSelectedMonth] = useState(""); // Filtro por mes
  const [selectedYear, setSelectedYear] = useState(""); // Filtro por año

  const buttonsRef = useRef(null);
  const formRef = useRef(null);

  // Años presentes en los datos reales, más recientes primero
  const availableYears = useMemo(() => {
    const years = new Set(
      data
        .map((item) => item.fechaPago && new Date(item.fechaPago).getFullYear())
        .filter((year) => !Number.isNaN(year))
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/api/movements");
        setData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtra combinando, si están presentes, rango de fechas + año + mes
  const handleFilter = () => {
    if (!startDate && !endDate && selectedYear === "" && selectedMonth === "") {
      alert("Por favor selecciona un rango de fechas, un año o un mes.");
      return;
    }

    let filtered = data;

    if (startDate && endDate) {
      // ✅ Convertimos a `YYYY-MM-DD` para asegurar comparación precisa
      const adjustedStartDate = new Date(startDate).toISOString().split("T")[0];

      // ✅ Ajustamos `endDate` para incluir todo el día
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      const finalEndDate = adjustedEndDate.toISOString().split("T")[0];

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.fechaPago).toISOString().split("T")[0];
        return itemDate >= adjustedStartDate && itemDate <= finalEndDate;
      });
    }

    if (selectedYear !== "") {
      filtered = filtered.filter(
        (item) => new Date(item.fechaPago).getFullYear() === parseInt(selectedYear)
      );
    }

    if (selectedMonth !== "") {
      filtered = filtered.filter(
        (item) => new Date(item.fechaPago).getMonth() === parseInt(selectedMonth)
      );
    }

    if (filtered.length === 0) {
      alert("No hay movimientos para los filtros seleccionados.");
      return;
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSelectedYear("");
    setSelectedMonth("");
    setFilteredData(data);
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
            Filtra por rango de fechas, o combina año y mes para personalizar
            los datos.
          </Card.Text>
          <Form ref={formRef} className="mx-auto" style={{ maxWidth: "900px" }}>
            <Row className="g-3 justify-content-center align-items-end">
              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Desde</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-secondary"
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Hasta</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-secondary"
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Año</Form.Label>
                  <Form.Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border-secondary"
                  >
                    <option value="">Todos</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Mes</Form.Label>
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
              </Col>
              <Col xs={12} md={4} className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleFilter}
                  className="fw-bold flex-fill"
                >
                  Filtrar
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleReset}
                  className="flex-fill"
                >
                  Ver todo
                </Button>
              </Col>
            </Row>
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
