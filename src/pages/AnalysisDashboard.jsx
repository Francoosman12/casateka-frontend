import React, { useEffect, useState } from "react";
import { Container, Card, ProgressBar, Form, Button } from "react-bootstrap";
import { Bar, Pie, Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";

// ✅ Registrar los elementos de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const AnalysisDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/movements`
        );
        setData(response.data);
        setFilteredData(response.data); // ✅ Inicialmente, los datos no están filtrados
      } catch (error) {
        console.error("🚨 Error al obtener los movimientos:", error.message);
      }
    };

    fetchMovements();
  }, []);

  // ✅ Función para filtrar el dashboard por período
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

  // ✅ Procesar datos para gráficos con datos filtrados
  const paymentTypes = filteredData.reduce((acc, item) => {
    const tipo = item.ingreso?.subtipo || "Desconocido";
    acc[tipo] = (acc[tipo] || 0) + parseFloat(item.ingreso?.montoTotal || 0);
    return acc;
  }, {});

  const paymentLabels = Object.keys(paymentTypes);
  const paymentValues = Object.values(paymentTypes);

  const barChartData = {
    labels: paymentLabels,
    datasets: [
      {
        label: "Ingresos por Tipo de Pago",
        data: paymentValues.length > 0 ? paymentValues : [0],
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
        ],
      },
    ],
  };

  const pieChartData = {
    labels: paymentLabels,
    datasets: [
      {
        data: paymentValues.length > 0 ? paymentValues : [0],
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
        ],
      },
    ],
  };

  // ✅ Flujo de pagos por día
  const dailyFlow = filteredData.reduce((acc, item) => {
    const date = new Date(item.fechaPago).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + parseFloat(item.ingreso?.montoTotal || 0);
    return acc;
  }, {});

  const dailyLabels = Object.keys(dailyFlow);
  const dailyValues = Object.values(dailyFlow);

  const lineChartData = {
    labels: dailyLabels.length > 0 ? dailyLabels : ["Sin datos"],
    datasets: [
      {
        label: "Flujo de Pagos por Día",
        data: dailyValues.length > 0 ? dailyValues : [0],
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        fill: true,
      },
    ],
  };

  // ✅ Habitación más ocupada
  const roomUsage = filteredData.reduce((acc, item) => {
    const room = item.habitacion?.tipo || "Desconocido";
    acc[room] = (acc[room] || 0) + 1;
    return acc;
  }, {});

  const mostUsedRoom =
    Object.keys(roomUsage).length > 0
      ? Object.keys(roomUsage).reduce((a, b) =>
          roomUsage[a] > roomUsage[b] ? a : b
        )
      : "Sin datos";

  const totalIngresos =
    paymentValues.length > 0
      ? paymentValues.reduce((a, b) => a + b, 0).toFixed(2)
      : "0.00";

  // ✅ Calcular el promedio de ingresos por noche
  const totalNoches = filteredData.reduce(
    (acc, item) => acc + (item.noches || 0),
    0
  );
  const totalIngresosNumerico =
    paymentValues.length > 0 ? paymentValues.reduce((a, b) => a + b, 0) : 0;
  const promedioPorNoche =
    totalNoches > 0 ? (totalIngresosNumerico / totalNoches).toFixed(2) : "0.00";

  return (
    <Container
      fluid
      className="vh-100 w-100 d-grid p-5"
      style={{
        display: "grid",
        gridTemplateAreas: `
      "search search search"
      "stats1 stats2 stats3"
      "chart1 chart2 chart3"
      "chart4 chart5 chart6"
    `,
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "auto auto auto auto",
        gap: "2px",
      }}
    >
      {/* ✅ Estilos responsive */}
      <style>
        {`
      @media (max-width: 768px) {
        .d-grid {
          display: block;
        }

        .search-bar,
        .shadow-sm {
          width: 100%;
          margin-bottom: 15px;
        }
      }
    `}
      </style>

      {/* ✅ Filtro de período */}
      <div className="search-bar" style={{ gridArea: "search" }}>
        <Form className="d-flex flex-wrap justify-content-center align-items-center gap-3">
          <Form.Group>
            <Form.Label>Desde:</Form.Label>
            <Form.Control
              type="date"
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Hasta:</Form.Label>
            <Form.Control
              type="date"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleFilter}>
            Filtrar
          </Button>
        </Form>
      </div>

      {/* ✅ Indicadores clave */}
      <Card className="shadow-sm text-center" style={{ gridArea: "stats1" }}>
        <Card.Body>
          <Card.Title>Ingresos Totales</Card.Title>
          <h3>${totalIngresos}</h3>
        </Card.Body>
      </Card>

      <Card className="shadow-sm text-center" style={{ gridArea: "stats2" }}>
        <Card.Body>
          <Card.Title>Habitación Más Ocupada</Card.Title>
          <h3>{mostUsedRoom}</h3>
        </Card.Body>
      </Card>
      <Card className="shadow-sm text-center" style={{ gridArea: "stats3" }}>
        <Card.Body>
          <Card.Title>Promedio de Ingresos por Noche</Card.Title>
          <h3>${promedioPorNoche}</h3>
        </Card.Body>
      </Card>

      {/* ✅ Gráficos */}
      <Card className="shadow-sm" style={{ gridArea: "chart1" }}>
        <Card.Body>
          <Card.Title className="text-center">
            Ingresos por Tipo de Pago
          </Card.Title>
          <Bar data={barChartData} />
        </Card.Body>
      </Card>

      <Card className="shadow-sm" style={{ gridArea: "chart2" }}>
        <Card.Body>
          <Card.Title className="text-center">
            Distribución de Ingresos
          </Card.Title>
          <Pie data={pieChartData} />
        </Card.Body>
      </Card>

      <Card className="shadow-sm" style={{ gridArea: "chart3" }}>
        <Card.Body>
          <Card.Title className="text-center">
            Flujo de Pagos por Día
          </Card.Title>
          <Line data={lineChartData} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AnalysisDashboard;
