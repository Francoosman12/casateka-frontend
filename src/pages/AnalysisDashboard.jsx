import React, { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { Bar, Line } from "react-chartjs-2";
import apiClient from "../api/client";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

// Paleta de la referencia de data-viz (validada contra CVD): un color fijo
// por gráfico, nunca uno distinto por barra dentro de un mismo gráfico.
const COLOR = {
  blue: "#2a78d6",
  aqua: "#1baf7a",
  orange: "#eb6834",
  violet: "#4a3aa7",
  gridline: "#e1e0d9",
  axis: "#898781",
  ink: "#0b0b0b",
  inkSecondary: "#52514e",
  surface: "#fcfcfb",
};

const hexToRgba = (hex, alpha) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// El campo montoTotal se guarda como string y a veces trae separador de
// miles; se limpia igual que en el resto de la app (Cash/Card/TransferData).
const parseMonto = (raw) => Number(String(raw ?? "0").replace(/,/g, "")) || 0;

const formatCurrency = (value, maximumFractionDigits = 2) =>
  value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits,
  });

const gridOptions = {
  color: COLOR.gridline,
  drawTicks: false,
};

const tickOptions = {
  color: COLOR.axis,
  font: { size: 12 },
};

const currencyTooltip = {
  callbacks: {
    label: (ctx) => formatCurrency(ctx.parsed.y ?? ctx.parsed, 0),
  },
};

const StatTile = ({ label, value, accent }) => (
  <Col xs={12} sm={6} lg={3}>
    <Card className="h-100 shadow-sm border-0 stat-tile" style={{ borderTop: `3px solid ${accent}` }}>
      <Card.Body>
        <div className="text-uppercase small fw-semibold" style={{ color: COLOR.inkSecondary, letterSpacing: "0.04em" }}>
          {label}
        </div>
        <div className="mt-1" style={{ fontSize: "1.75rem", fontWeight: 700, color: COLOR.ink }}>
          {value}
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const ChartCard = ({ title, children, lg = 4 }) => (
  <Col xs={12} lg={lg}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <Card.Title as="h6" className="mb-3" style={{ color: COLOR.ink }}>
          {title}
        </Card.Title>
        <div style={{ height: "260px" }}>{children}</div>
      </Card.Body>
    </Card>
  </Col>
);

const AnalysisDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await apiClient.get("/api/movements");
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error al obtener los movimientos:", error.message);
      }
    };

    fetchMovements();
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona un rango de fechas válido.");
      return;
    }

    const filtered = data.filter((item) => {
      const itemDate = new Date(item.fechaPago).toISOString().split("T")[0];
      return itemDate >= startDate && itemDate <= endDate;
    });

    if (filtered.length === 0) {
      alert("No hay movimientos en el rango de fechas seleccionado.");
      return;
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setFilteredData(data);
  };

  const {
    totalIngresos,
    totalNoches,
    promedioPorNoche,
    mostUsedRoom,
    barChartData,
    otaChartData,
    roomChartData,
    lineChartData,
  } = useMemo(() => {
    const totalIngresos = filteredData.reduce(
      (sum, item) => sum + parseMonto(item.ingreso?.montoTotal),
      0
    );

    const totalNoches = filteredData.reduce(
      (sum, item) => sum + (item.noches || 0),
      0
    );

    const promedioPorNoche = totalNoches > 0 ? totalIngresos / totalNoches : 0;

    // Ingresos por tipo de pago (subtipo)
    const paymentTotals = filteredData.reduce((acc, item) => {
      const tipo = item.ingreso?.subtipo || "Desconocido";
      acc[tipo] = (acc[tipo] || 0) + parseMonto(item.ingreso?.montoTotal);
      return acc;
    }, {});

    // Ingresos por OTA
    const otaTotals = filteredData.reduce((acc, item) => {
      const ota = item.ota || "Sin OTA";
      acc[ota] = (acc[ota] || 0) + parseMonto(item.ingreso?.montoTotal);
      return acc;
    }, {});

    // Ingresos y ocupación por tipo de habitación
    const roomTotals = {};
    const roomCounts = {};
    filteredData.forEach((item) => {
      const room = item.habitacion?.tipo || "Desconocido";
      roomTotals[room] = (roomTotals[room] || 0) + parseMonto(item.ingreso?.montoTotal);
      roomCounts[room] = (roomCounts[room] || 0) + 1;
    });

    const mostUsedRoom =
      Object.keys(roomCounts).length > 0
        ? Object.keys(roomCounts).reduce((a, b) => (roomCounts[a] > roomCounts[b] ? a : b))
        : "Sin datos";

    // Flujo diario, ordenado cronológicamente (la API devuelve los
    // movimientos más recientes primero, no sirve para graficar tal cual)
    const dailyTotals = filteredData.reduce((acc, item) => {
      const date = new Date(item.fechaPago).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + parseMonto(item.ingreso?.montoTotal);
      return acc;
    }, {});
    const sortedDays = Object.keys(dailyTotals).sort();

    const makeBarData = (totals, color) => {
      const labels = Object.keys(totals);
      return {
        labels,
        datasets: [
          {
            data: labels.map((label) => totals[label]),
            backgroundColor: color,
            borderRadius: 4,
            borderSkipped: "bottom",
            maxBarThickness: 40,
          },
        ],
      };
    };

    return {
      totalIngresos,
      totalNoches,
      promedioPorNoche,
      mostUsedRoom,
      barChartData: makeBarData(paymentTotals, COLOR.aqua),
      otaChartData: makeBarData(otaTotals, COLOR.orange),
      roomChartData: makeBarData(roomTotals, COLOR.violet),
      lineChartData: {
        labels: sortedDays.map((d) =>
          new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" })
        ),
        datasets: [
          {
            data: sortedDays.map((d) => dailyTotals[d]),
            borderColor: COLOR.blue,
            backgroundColor: hexToRgba(COLOR.blue, 0.1),
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: COLOR.blue,
            pointBorderColor: COLOR.surface,
            pointBorderWidth: 2,
          },
        ],
      },
    };
  }, [filteredData]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...currencyTooltip, intersect: false, mode: "nearest" },
    },
    scales: {
      x: { grid: { display: false }, ticks: tickOptions },
      y: {
        beginAtZero: true,
        grid: gridOptions,
        border: { display: false },
        ticks: { ...tickOptions, callback: (v) => formatCurrency(v, 0) },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: currencyTooltip,
    },
    scales: {
      x: { grid: { display: false }, ticks: tickOptions },
      y: {
        beginAtZero: true,
        grid: gridOptions,
        border: { display: false },
        ticks: { ...tickOptions, callback: (v) => formatCurrency(v, 0) },
      },
    },
  };

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-1">Dashboard de Análisis</h2>
      <p className="text-muted mb-4">
        Visión general de los ingresos del hotel para el período seleccionado.
      </p>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Form>
            <Row className="g-3 align-items-end">
              <Col xs={12} sm={4} md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">Desde</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={4} md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold">Hasta</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs="auto">
                <Button variant="primary" onClick={handleFilter}>
                  Filtrar
                </Button>
              </Col>
              <Col xs="auto">
                <Button variant="outline-secondary" onClick={handleReset}>
                  Ver todo
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-3">
        <StatTile label="Ingresos totales" value={formatCurrency(totalIngresos)} accent={COLOR.blue} />
        <StatTile label="Noches vendidas" value={totalNoches.toLocaleString("es-MX")} accent={COLOR.aqua} />
        <StatTile label="Tarifa promedio / noche" value={formatCurrency(promedioPorNoche)} accent={COLOR.orange} />
        <StatTile label="Habitación más solicitada" value={mostUsedRoom} accent={COLOR.violet} />
      </Row>

      <Row className="g-3 mb-3">
        <ChartCard title="Flujo de ingresos por día" lg={12}>
          <Line data={lineChartData} options={lineOptions} />
        </ChartCard>
      </Row>

      <Row className="g-3">
        <ChartCard title="Ingresos por tipo de pago">
          <Bar data={barChartData} options={barOptions} />
        </ChartCard>
        <ChartCard title="Ingresos por OTA">
          <Bar data={otaChartData} options={barOptions} />
        </ChartCard>
        <ChartCard title="Ingresos por tipo de habitación">
          <Bar data={roomChartData} options={barOptions} />
        </ChartCard>
      </Row>
    </Container>
  );
};

export default AnalysisDashboard;
