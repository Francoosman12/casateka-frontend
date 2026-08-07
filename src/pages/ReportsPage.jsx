import React, { useState, useEffect } from "react";
import { Container, Form, Button, Card, Row, Col } from "react-bootstrap";
import { exportToExcel } from "../utils/excelUtils";
import { generatePDFReport } from "../utils/pdfUtils";
import ReportTable from "../components/ReportTable";
import apiClient from "../api/client";

const ReportsPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("pdf");
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // ✅ Estado separado para los datos filtrados

  // 🔹 Obtener datos reales al cargar la página
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await apiClient.get("/api/movements");
        setReportData(response.data); // ✅ Guardamos todos los movimientos
      } catch (error) {
        console.error("🚨 Error al obtener los movimientos:", error.message);
      }
    };

    fetchMovements();
  }, []);

  const handleFilterReport = () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona un rango de fechas válido.");
      return;
    }

    // ✅ Convertir fechas a formato `YYYY-MM-DD` para comparación precisa
    const adjustedStartDate = new Date(startDate).toISOString().split("T")[0];
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999); // 🔹 Asegurar que incluya el día completo
    const finalEndDate = adjustedEndDate.toISOString().split("T")[0];

    // 🔹 Filtrar datos asegurando que la fecha final se incluya correctamente
    const filtered = reportData.filter((mov) => {
      const itemDate = new Date(mov.fechaPago).toISOString().split("T")[0]; // 🔹 Comparar sin horas
      return itemDate >= adjustedStartDate && itemDate <= finalEndDate;
    });

    if (filtered.length === 0) {
      alert("No hay movimientos en el rango de fechas seleccionado.");
      return;
    }

    setFilteredData(filtered); // ✅ Guardamos los datos filtrados
  };

  const handleGenerateReport = () => {
    if (filteredData.length === 0) {
      alert("Primero filtra los datos antes de generar el reporte.");
      return;
    }

    if (!startDate || !endDate) {
      alert("Por favor selecciona un rango de fechas válido.");
      return;
    }

    if (reportType === "excel") {
      exportToExcel(filteredData);
    } else {
      generatePDFReport(filteredData, startDate, endDate); // ✅ Pasar las fechas correctamente
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-1">Generación de Reportes</h2>
      <p className="text-muted mb-4">
        Elegí un rango de fechas y exportá el detalle en PDF o Excel.
      </p>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form>
            <Row className="g-3 align-items-end">
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Fecha de Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">Fecha Final</Form.Label>
                  <Form.Control
                    type="date"
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Formato del Reporte
                  </Form.Label>
                  <Form.Select onChange={(e) => setReportType(e.target.value)}>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 d-flex gap-2">
              <Button variant="secondary" onClick={handleFilterReport}>
                Filtrar Reporte
              </Button>
              <Button variant="primary" onClick={handleGenerateReport}>
                Generar Reporte
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <div className="report-container">
        <ReportTable data={filteredData} />
      </div>
    </Container>
  );
};

export default ReportsPage;
