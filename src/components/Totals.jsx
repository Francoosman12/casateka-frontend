import React from "react";
import { Container, Table, Row, Col, Card } from "react-bootstrap";

const Totals = ({ data }) => {
  // Cálculo de totales por categoría
  const totalEfectivoMXN = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Pesos"
        ? parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
        : 0),
    0
  );

  const totalEfectivoUSD = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Dólares"
        ? parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
        : 0),
    0
  );

  const totalEfectivoEUR = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Euros"
        ? parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
        : 0),
    0
  );

  const totalDebitoCredito = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Tarjeta" &&
      item.ingreso?.subtipo === "Débito/Crédito"
        ? parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
        : 0),
    0
  );

  const totalTarjetasVirtuales = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Tarjeta" && item.ingreso?.subtipo === "Virtual"
        ? parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
        : 0),
    0
  );

  const totalTransferencias = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Tarjeta" &&
      item.ingreso?.subtipo === "Transferencias"
        ? parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
        : 0),
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
  const calculateOTA = (ota) => {
    return data
      .filter(
        (item) => item.ota === ota && item.concepto === "Cobro de estancia"
      )
      .reduce((total, item) => {
        return (
          total +
          parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
        );
      }, 0);
  };

  const totalBooking = calculateOTA("Booking");
  const totalExpedia = calculateOTA("Expedia");
  const totalDirecta = calculateOTA("Directa");

  // Calcular el total de estancias
  const totalEstancia = data
    .filter((item) => item.concepto === "Cobro de estancia")
    .reduce((total, item) => {
      return (
        total +
        parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
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
        parseFloat(item.ingreso.monto.replace(/\./g, "").replace(",", "."))
      );
    }, 0);

  // Contar el número total de habitaciones ocupadas como noches vendidas
  const totalNochesVendidas = data
    .filter((item) => item.concepto === "Cobro de estancia") // Filtrar solo estadías
    .reduce((total, item) => {
      const checkInDate = new Date(item.checkIn);
      const checkOutDate = new Date(item.checkOut);

      // Calcular la cantidad de noches restando las fechas
      const noches = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24); // Convertir ms a días
      return total + noches;
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
                <td>
                  {totalEfectivoMXN.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
              </tr>
              <tr>
                <td>USD</td>
                <td>
                  {totalEfectivoUSD.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
              </tr>
              <tr>
                <td>EUR</td>
                <td>
                  {totalEfectivoEUR.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </td>
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
                <td>
                  {totalDebitoCredito.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
              </tr>
              <tr>
                <td>Virtuales</td>
                <td>
                  {totalTarjetasVirtuales.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
              </tr>
              <tr>
                <td>Transferencias</td>
                <td>
                  {totalTransferencias.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
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
                <td>
                  {totalEstancia.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
              </tr>
              <tr>
                <td>Amenidades</td>
                <td>
                  {totalAmenidades.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
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
                <td>
                  {totalBooking.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
              </tr>
              <tr>
                <td>Expedia</td>
                <td>
                  {totalExpedia.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
              </tr>
              <tr>
                <td>Directa</td>
                <td>
                  {totalDirecta.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
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
                <td>
                  {totalGeneral.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
              </tr>
              <tr>
                <td>Promedio por Noche</td>
                <td>
                  {tarifaPromedioPorNoche.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </td>
              </tr>
              <tr>
                <td>Total de Noches Vendidas</td>
                <td>{totalNochesVendidas.toLocaleString("es-MX")}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Totals;
