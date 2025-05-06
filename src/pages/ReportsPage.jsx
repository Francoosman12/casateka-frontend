import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { exportToExcel } from "../utils/excelUtils";
import { generatePDFReport } from "../utils/pdfUtils";
import ReportTable from "../components/ReportTable";
import axios from "axios";

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
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/movements`
        );
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
    <Container>
      <h2 className="mt-4">Generación de Reportes</h2>
      <Form>
        <Form.Group>
          <Form.Label>Fecha de Inicio:</Form.Label>
          <Form.Control
            type="date"
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Fecha Final:</Form.Label>
          <Form.Control
            type="date"
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Formato del Reporte:</Form.Label>
          <Form.Select onChange={(e) => setReportType(e.target.value)}>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </Form.Select>
        </Form.Group>

        <Button
          className="mt-3"
          variant="secondary"
          onClick={handleFilterReport}
        >
          Filtrar Reporte
        </Button>

        <Button
          className="mt-3 ms-2"
          variant="primary"
          onClick={handleGenerateReport}
        >
          Generar Reporte
        </Button>
      </Form>

      {/* ✅ Usar `ReportTable.jsx` con datos filtrados */}
      <div className="report-container">
        <ReportTable data={filteredData} />
      </div>
    </Container>
  );
};

export default ReportsPage;
