import React from "react";
import { Container, Table, Row, Col, Card } from "react-bootstrap";

const Totals = ({ data = [] }) => {
  // Cálculo de totales por categoría usando montoTotal

  const totalEfectivoMXN = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Pesos"
        ? Number(item.ingreso?.montoTotal.replace(",", "")) || 0 // ✅ Solo quitar coma si existe
        : 0),
    0
  );

  const totalEfectivoUSD = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Dólares"
        ? Number(item.ingreso?.montoTotal.replace(",", "")) || 0
        : 0),
    0
  );

  const totalEfectivoEUR = data.reduce(
    (total, item) =>
      total +
      (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Euros"
        ? Number(item.ingreso?.montoTotal.replace(",", "")) || 0
        : 0),
    0
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalDebitoCredito = formatCurrency(
    data.reduce((total, item) => {
      if (
        item.ingreso?.tipo === "Tarjeta" &&
        item.ingreso?.subtipo === "Débito/Crédito"
      ) {
        const montoConvertido =
          Number(item.ingreso?.montoTotal.replace(/,/g, "")) || 0;
        return total + montoConvertido;
      }
      return total;
    }, 0)
  );

  const totalTarjetasVirtuales = formatCurrency(
    data.reduce((total, item) => {
      if (
        item.ingreso?.tipo === "Tarjeta" &&
        item.ingreso?.subtipo === "Virtual"
      ) {
        const montoConvertido =
          Number(item.ingreso?.montoTotal.replace(/,/g, "")) || 0;
        return total + montoConvertido;
      }
      return total;
    }, 0)
  );

  const totalTransferencias = formatCurrency(
    data.reduce((total, item) => {
      if (
        item.ingreso?.tipo === "Tarjeta" &&
        item.ingreso?.subtipo === "Transferencias"
      ) {
        const montoConvertido =
          Number(item.ingreso?.montoTotal.replace(/,/g, "")) || 0;
        return total + montoConvertido;
      }
      return total;
    }, 0)
  );

  // Cálculo de totales por OTAs

  const calculateOTA = (ota) => {
    const total = data
      .filter(
        (item) =>
          item.ota === ota &&
          item.concepto === "Cobro de estancia" &&
          ["Efectivo", "Tarjeta"].includes(item.ingreso?.tipo) // ✅ Incluir ambos tipos
      )
      .reduce((sum, item) => {
        let rawMonto = item.ingreso?.montoTotal || "0";
        console.log(
          "Procesando montoTotal antes de conversión para OTA:",
          rawMonto
        );

        // ✅ **Eliminar los separadores incorrectos antes de la conversión**
        const montoConvertido = Number(rawMonto.replace(/,/g, "")) || 0;
        console.log(
          "Monto final procesado correctamente para OTA:",
          montoConvertido
        );

        return sum + montoConvertido;
      }, 0);

    return formatCurrency(total);
  };

  const totalBooking = calculateOTA("Booking");
  const totalExpedia = calculateOTA("Expedia");
  const totalDirecta = calculateOTA("Directa");

  // Calcular el total de estancias

  const totalEstancia = formatCurrency(
    data
      .filter((item) => item.concepto === "Cobro de estancia")
      .reduce((total, item) => {
        let rawMonto = item.ingreso?.montoTotal || "0";
        console.log(
          "Procesando montoTotal antes de conversión en totalEstancia:",
          rawMonto
        );

        // ✅ **Eliminar los separadores incorrectos antes de la conversión**
        const montoConvertido = Number(rawMonto.replace(/,/g, "")) || 0;
        console.log(
          "Monto final procesado correctamente en totalEstancia:",
          montoConvertido
        );

        return total + montoConvertido;
      }, 0)
  );

  //Calcular Amenidades
  const totalAmenidades = formatCurrency(
    data
      .filter((item) => item.concepto === "Amenidades")
      .reduce((total, item) => {
        let rawMonto = item.ingreso?.montoTotal || "0";
        console.log(
          "Procesando montoTotal antes de conversión en totalAmenidades:",
          rawMonto
        );

        // ✅ **Eliminar los separadores incorrectos antes de la conversión**
        const montoConvertido = Number(rawMonto.replace(/,/g, "")) || 0;
        console.log(
          "Monto final procesado correctamente en totalAmenidades:",
          montoConvertido
        );

        return total + montoConvertido;
      }, 0)
  );

  // Calcular el total de noches
  const totalNoches = data
    .filter((item) => item.concepto === "Cobro de estancia")
    .reduce((total, item) => total + (item.noches || 0), 0);

  // Calcular el promedio por noche con formato correcto
  const totalEstanciaRaw = data
    .filter((item) => item.concepto === "Cobro de estancia")
    .reduce((total, item) => {
      let rawMonto = item.ingreso?.montoTotal || "0";
      const montoConvertido = Number(rawMonto.replace(/,/g, "")) || 0;
      return total + montoConvertido;
    }, 0);

  const tarifaPromedioPorNoche =
    totalNoches > 0
      ? formatCurrency(totalEstanciaRaw / totalNoches)
      : formatCurrency(0);

  // Contar el número total de habitaciones ocupadas como noches vendidas
  const totalNochesVendidas = data
    .filter((item) => item.concepto === "Cobro de estancia")
    .reduce((total, item) => {
      const checkInDate = new Date(item.checkIn);
      const checkOutDate = new Date(item.checkOut);
      const noches = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
      return total + noches;
    }, 0);

  // Cálculo del Total General

  const totalGeneralRaw =
    (totalEfectivoMXN ?? 0) +
    (totalEfectivoUSD ?? 0) +
    (totalEfectivoEUR ?? 0) +
    (Number(totalDebitoCredito.replace(/[^0-9.-]/g, "")) || 0) +
    (Number(totalTarjetasVirtuales.replace(/[^0-9.-]/g, "")) || 0) +
    (Number(totalTransferencias.replace(/[^0-9.-]/g, "")) || 0);

  const totalGeneral = formatCurrency(totalGeneralRaw);

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
          <Table size="sm" striped bordered hover className="totals-data-table">
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
          <Table size="sm" striped bordered hover className="totals-data-table">
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
          <Table size="sm" striped bordered hover className="totals-data-table">
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
          <Table size="sm" striped bordered hover className="totals-data-table">
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
          <Table size="sm" striped bordered hover className="totals-data-table">
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
