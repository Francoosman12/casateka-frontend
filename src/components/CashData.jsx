import React from "react";
import { Container, Table, Row, Col, Card } from "react-bootstrap";

const CashData = ({ data }) => {
  // Filtrar los datos por concepto (Estancia y Amenidades) para efectivo en pesos
  const efectivoPesosEstancia = data.filter(
    (item) =>
      item.ingreso?.tipo === "Efectivo" &&
      item.ingreso?.subtipo === "Pesos" &&
      item.concepto === "Cobro de estancia"
  );

  const efectivoPesosAmenidades = data.filter(
    (item) =>
      item.ingreso?.tipo === "Efectivo" &&
      item.ingreso?.subtipo === "Pesos" &&
      item.concepto === "Amenidades"
  );

  // Agrupar los datos por OTA (Booking, Expedia, Directa)
  const groupByOTA = (items) => {
    return items.reduce((grouped, item) => {
      const key = item.ota || "Sin OTA";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
      return grouped;
    }, {});
  };

  const groupedEstancia = groupByOTA(efectivoPesosEstancia);

  // Función para calcular el subtotal de un array
  const calculateSubtotal = (items) => {
    return items
      .reduce((total, item) => {
        const monto = parseFloat(
          item.ingreso?.monto.replace(/\./g, "").replace(",", ".") || "0"
        );
        return total + monto;
      }, 0)
      .toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  };

  return (
    <Container className="mt-5 mb-5">
      {/* Encabezado */}
      <Card className="bg-dark">
        <Card.Body>
          <Card.Title className="text-center text-white">
            Ingreso en Efectivo en Pesos
          </Card.Title>
        </Card.Body>
      </Card>

      {/* Tabla de Estancia */}
      <Row className="mb-5 mt-3">
        <Col>
          <h3 className="text-dark">Estancia</h3>
          {Object.keys(groupedEstancia).map((ota) => (
            <Card className="mb-4" key={ota}>
              <Card.Header className="bg-light text-dark">
                <h4>{ota}</h4>
              </Card.Header>
              <Table striped bordered hover>
                <thead>
                  <tr className="bg-primary text-white">
                    <th>No.</th>
                    <th>Fecha de Pago</th>
                    <th>Nombre</th>
                    <th>Habitación</th>
                    <th>Tipo de Habitación</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEstancia[ota].map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{new Date(item.fechaPago).toLocaleDateString()}</td>
                      <td>{item.nombre}</td>
                      <td>{item.habitacion?.numero || "N/A"}</td>
                      <td>{item.habitacion?.tipo || "N/A"}</td>
                      <td>{new Date(item.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(item.checkOut).toLocaleDateString()}</td>
                      <td>{item.ingreso?.monto || "$0,00"}</td>
                    </tr>
                  ))}
                  {/* Subtotal */}
                  <tr className="bg-light">
                    <td colSpan="7" className="text-end fw-bold">
                      Subtotal:
                    </td>
                    <td className="fw-bold">
                      {calculateSubtotal(groupedEstancia[ota])}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          ))}
        </Col>
      </Row>

      {/* Tabla de Amenidades */}
      <Row>
        <Col>
          <h3 className="text-dark">Amenidades</h3>
          <Card>
            <Table striped bordered hover>
              <thead>
                <tr className="bg-success text-white">
                  <th>No.</th>
                  <th>Fecha de Pago</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                {efectivoPesosAmenidades.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{new Date(item.fechaPago).toLocaleDateString()}</td>
                    <td>{item.nombre}</td>
                    <td>{item.concepto}</td>
                    <td>{item.ingreso?.monto || "$0,00"}</td>
                  </tr>
                ))}
                {/* Subtotal */}
                <tr className="bg-light">
                  <td colSpan="4" className="text-end fw-bold">
                    Subtotal:
                  </td>
                  <td className="fw-bold">
                    {calculateSubtotal(efectivoPesosAmenidades)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CashData;
