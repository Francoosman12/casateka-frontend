import React from "react";
import { Container, Table, Row, Col, Card } from "react-bootstrap";

const Totals = ({ data }) => {
  // Cálculo de totales por categoría
  const totalEfectivoMXN = data.reduce(
    (total, item) => total + (item.ingresos?.efectivo?.pesos || 0),
    0
  );
  const totalEfectivoUSD = data.reduce(
    (total, item) => total + (item.ingresos?.efectivo?.dolares || 0),
    0
  );
  const totalEfectivoEUR = data.reduce(
    (total, item) => total + (item.ingresos?.efectivo?.euros || 0),
    0
  );
  const totalDebitoCredito = data.reduce(
    (total, item) => total + (item.ingresos?.tarjeta?.debitoCredito || 0),
    0
  );
  const totalTarjetasVirtuales = data.reduce(
    (total, item) => total + (item.ingresos?.tarjeta?.virtual || 0),
    0
  );
  const totalTransferencias = data.reduce(
    (total, item) => total + (item.ingresos?.tarjeta?.transferencias || 0),
    0
  );

  // Cálculo del Total General
  const totalGeneral =
    totalEfectivoMXN +
    totalEfectivoUSD +
    totalEfectivoEUR +
    totalDebitoCredito +
    totalTarjetasVirtuales +
    totalTransferencias;

  // Cálculo de totales por OTAs
  const totalBooking = data
    .filter(
      (item) => item.ota === "Booking" && item.concepto === "Cobro de estancia"
    )
    .reduce((total, item) => {
      return (
        total +
        (item.ingresos?.efectivo?.pesos || 0) +
        (item.ingresos?.efectivo?.dolares || 0) +
        (item.ingresos?.efectivo?.euros || 0) +
        (item.ingresos?.tarjeta?.debitoCredito || 0) +
        (item.ingresos?.tarjeta?.virtual || 0) +
        (item.ingresos?.tarjeta?.transferencias || 0)
      );
    }, 0);

  const totalExpedia = data
    .filter(
      (item) => item.ota === "Expedia" && item.concepto === "Cobro de estancia"
    )
    .reduce((total, item) => {
      return (
        total +
        (item.ingresos?.efectivo?.pesos || 0) +
        (item.ingresos?.efectivo?.dolares || 0) +
        (item.ingresos?.efectivo?.euros || 0) +
        (item.ingresos?.tarjeta?.debitoCredito || 0) +
        (item.ingresos?.tarjeta?.virtual || 0) +
        (item.ingresos?.tarjeta?.transferencias || 0)
      );
    }, 0);

  const totalDirecta = data
    .filter(
      (item) => item.ota === "Directa" && item.concepto === "Cobro de estancia"
    )
    .reduce((total, item) => {
      return (
        total +
        (item.ingresos?.efectivo?.pesos || 0) +
        (item.ingresos?.efectivo?.dolares || 0) +
        (item.ingresos?.efectivo?.euros || 0) +
        (item.ingresos?.tarjeta?.debitoCredito || 0) +
        (item.ingresos?.tarjeta?.virtual || 0) +
        (item.ingresos?.tarjeta?.transferencias || 0)
      );
    }, 0);

  // Calcular el total de estancias
  const totalEstancia = data
    .filter((item) => item.concepto === "Cobro de estancia")
    .reduce((total, item) => {
      return (
        total +
        (item.ingresos?.efectivo?.pesos || 0) +
        (item.ingresos?.efectivo?.dolares || 0) +
        (item.ingresos?.efectivo?.euros || 0) +
        (item.ingresos?.tarjeta?.debitoCredito || 0) +
        (item.ingresos?.tarjeta?.virtual || 0) +
        (item.ingresos?.tarjeta?.transferencias || 0)
      );
    }, 0);

  // Calcular el total de noches
  const totalNoches = data
    .filter((item) => item.concepto === "Cobro de estancia")
    .reduce((total, item) => total + (item.noches || 0), 0);

  // Calcular el promedio por noche
  const tarifaPromedioPorNoche =
    totalNoches > 0 ? totalEstancia / totalNoches : 0;

  const totalAmenidades = data
    .filter((item) => item.concepto === "Amenidades")
    .reduce((total, item) => {
      return (
        total +
        (item.ingresos?.efectivo?.pesos || 0) +
        (item.ingresos?.efectivo?.dolares || 0) +
        (item.ingresos?.efectivo?.euros || 0) +
        (item.ingresos?.tarjeta?.debitoCredito || 0) +
        (item.ingresos?.tarjeta?.virtual || 0) +
        (item.ingresos?.tarjeta?.transferencias || 0)
      );
    }, 0);

  return (
    <Container className="mt-5">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="text-center display-5">
            Totales de Ingresos
          </Card.Title>
          <Card.Text className="text-center text-muted">
            Consolidado de ingresos por todas las categorías y OTAs.
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Tablas de Totales */}
      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-4">
          <Table size="sm" striped bordered hover>
            <thead>
              <tr className="bg-dark text-white">
                <th>Efectivo</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MXN</td>
                <td>${totalEfectivoMXN}</td>
              </tr>
              <tr>
                <td>USD</td>
                <td>${totalEfectivoUSD}</td>
              </tr>
              <tr>
                <td>EUR</td>
                <td>${totalEfectivoEUR}</td>
              </tr>
            </tbody>
          </Table>
        </Col>

        <Col xs={12} md={6} className="mb-4">
          <Table size="sm" striped bordered hover>
            <thead>
              <tr className="bg-dark text-white">
                <th>Tarjetas</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Débito/Crédito</td>
                <td>${totalDebitoCredito}</td>
              </tr>
              <tr>
                <td>Virtuales</td>
                <td>${totalTarjetasVirtuales}</td>
              </tr>
              <tr>
                <td>Transferencias</td>
                <td>${totalTransferencias}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12} md={6} className="mx-auto">
          <Table size="sm" striped bordered hover>
            <thead>
              <tr className="bg-success text-white">
                <th>Concepto</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cobro de Estancia</td>
                <td>${totalEstancia}</td>
              </tr>
              <tr>
                <td>Amenidades</td>
                <td>${totalAmenidades}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12} md={6}>
          <Table size="sm" striped bordered hover>
            <thead>
              <tr className="bg-dark text-white">
                <th>OTAs</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Booking</td>
                <td>${totalBooking}</td>
              </tr>
              <tr>
                <td>Expedia</td>
                <td>${totalExpedia}</td>
              </tr>
              <tr>
                <td>Directa</td>
                <td>${totalDirecta}</td>
              </tr>
            </tbody>
          </Table>
        </Col>

        <Col xs={12} md={6}>
          <Table size="sm" striped bordered hover>
            <thead>
              <tr className="bg-primary text-white">
                <th>Totales Generales</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total General</td>
                <td>${totalGeneral}</td>
              </tr>
              <tr>
                <td>Promedio por Noche</td>
                <td>${tarifaPromedioPorNoche.toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Totals;
