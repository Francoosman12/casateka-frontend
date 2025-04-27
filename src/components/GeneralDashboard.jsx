import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Card, Button, Spinner, Form } from "react-bootstrap";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import CashData from "./CashData";
import CashDollarData from "./CashDollarData";
import CashEuroData from "./CashEuroData";
import CardData from "./CardData";
import VirtualCardData from "./VirtualCardData";
import TransferData from "./TransferData";
import Totals from "./Totals";
import { exportToExcel } from "../utils/excelUtils";

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

    const start = new Date(startDate);
    const end = new Date(endDate);

    // ✅ Ajustamos `startDate` a las 00:00:00 para incluir toda la fecha inicial
    start.setHours(0, 0, 0, 0);

    // ✅ Ajustamos `endDate` a las 23:59:59 para incluir toda la fecha final
    end.setHours(23, 59, 59, 999);

    const filtered = data.filter((item) => {
      const itemDate = new Date(item.fechaPago);
      return itemDate >= start && itemDate <= end;
    });

    setFilteredData(filtered);
  };

  const handleExcelExport = () => {
    exportToExcel(filteredData);
  };

  const exportToPDF = async () => {
    const today = new Date().toISOString().split("T")[0];
    const buttons = buttonsRef.current;
    const form = formRef.current;

    // Ocultar botones y formulario temporalmente
    buttons.style.display = "none";
    form.style.display = "none";

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 🔹 Capturar "Totales" y centrarlo en la página
    const totalesElement = document.querySelector(".totales");
    const totalesCanvas = await html2canvas(totalesElement, {
      scale: 1.5,
      useCORS: true,
    });
    const totalesImgData = totalesCanvas.toDataURL("image/jpeg", 0.7);
    const totalesImgWidth = pageWidth * 1.0; // ✅ Ajustar el ancho de la imagen (80% del ancho de la página)
    const totalesImgHeight =
      (totalesCanvas.height * totalesImgWidth) / totalesCanvas.width;

    const xCenter = (pageWidth - totalesImgWidth) / 2; // ✅ Calcular posición X centrada
    const yCenter = (pageHeight - totalesImgHeight) / 2; // ✅ Calcular posición Y centrada

    pdf.addImage(
      totalesImgData,
      "JPEG",
      xCenter,
      yCenter,
      totalesImgWidth,
      totalesImgHeight
    );
    pdf.addPage(); // 🔹 Agregar nueva página después de "Totales"

    // 🔹 Capturar el resto de los componentes después de "Totales"
    const components = [
      { ref: ".cash-data", title: "Cash Data" },
      { ref: ".cash-dollar-data", title: "Cash Dollar Data" },
      { ref: ".cash-euro-data", title: "Cash Euro Data" },
      { ref: ".card-data", title: "Card Data" },
      { ref: ".virtual-card-data", title: "Virtual Card Data" },
      { ref: ".transfer-data", title: "Transfer Data" },
    ];

    let currentHeight = 10; // ✅ Reiniciamos la posición inicial para los demás componentes

    for (const component of components) {
      const element = document.querySelector(component.ref);

      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (currentHeight + imgHeight > pageHeight) {
        pdf.addPage();
        currentHeight = 10;
      }

      pdf.addImage(
        imgData,
        "JPEG",
        10,
        currentHeight,
        pageWidth - 20,
        imgHeight
      );
      currentHeight += imgHeight + 10;
    }

    // Restaurar visibilidad de botones y formulario
    buttons.style.display = "block";
    form.style.display = "block";

    pdf.save(`Dashboard_General_${today}.pdf`);
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
          <div className="text-center mt-4" ref={buttonsRef}>
            <Button variant="success" onClick={handleExcelExport}>
              Descargar como Excel
            </Button>{" "}
            <Button variant="danger" onClick={exportToPDF}>
              Descargar como PDF
            </Button>
          </div>
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
