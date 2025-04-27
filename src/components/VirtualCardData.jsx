import React from "react";
import { Container, Table, Row, Col, Card } from "react-bootstrap";

const VirtualCardData = ({ data }) => {
  // Filtrar movimientos por Tarjetas Virtuales y concepto
  const tarjetaVirtualEstancia = data.filter(
    (item) =>
      item.ingreso?.tipo === "Tarjeta" &&
      item.ingreso?.subtipo === "Virtual" &&
      item.concepto === "Cobro de estancia"
  );

  const tarjetaVirtualAmenidades = data.filter(
    (item) =>
      item.ingreso?.tipo === "Tarjeta" &&
      item.ingreso?.subtipo === "Virtual" &&
      item.concepto === "Amenidades"
  );

  // Agrupar los movimientos por OTA (Booking, Expedia, Directa, etc.)
  const groupByOTA = (items) => {
    return items.reduce((grouped, item) => {
      const key = item.ota || "Sin OTA"; // Fallback a "Sin OTA" si la OTA está vacía
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
      return grouped;
    }, {});
  };

  const groupedEstancia = groupByOTA(tarjetaVirtualEstancia);

  // Función para calcular el subtotal
  const calculateSubtotal = (items) => {
    console.log("Datos filtrados antes del cálculo:", items);
    console.log(
      "Montos extraídos:",
      items.map((i) => i.ingreso?.montoTotal)
    );
    console.log("Cantidad de elementos:", items.length);

    const total = items.reduce((sum, item) => {
      let rawMonto = item.ingreso?.montoTotal || "0.00";
      console.log("Procesando montoTotal antes de conversión:", rawMonto);

      // ✅ **Eliminar puntos de separación de miles, convertir a número directamente**
      const montoConvertido = Number(rawMonto.replace(/,/g, "")) || 0;
      console.log("Monto final procesado:", montoConvertido);

      return sum + montoConvertido;
    }, 0);

    // ✅ **Aplicar formato con separador de miles antes de devolver**
    const formattedTotal = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total);

    console.log("Subtotal final con formato:", formattedTotal);

    return formattedTotal;
  };

  return (
    <Container className="mt-5 mb-5">
      {/* Encabezado */}
      <Card className="bg-dark">
        <Card.Body>
          <Card.Title className="text-center text-white">
            Ingreso por Tarjeta Virtual Card
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
                    <th>Autorización</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEstancia[ota].map((item, index) => (
                    <>
                      {/* Primera fila: Datos generales + primera autorización */}
                      <tr key={`${item._id}-main`}>
                        <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                          {index + 1}
                        </td>
                        <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                          {new Date(item.fechaPago).toLocaleDateString()}
                        </td>
                        <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                          {item.nombre}
                        </td>
                        <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                          {item.habitacion?.numero || "N/A"}
                        </td>
                        <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                          {item.habitacion?.tipo || "N/A"}
                        </td>
                        <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                          {new Date(item.checkIn).toLocaleDateString()}
                        </td>
                        <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                          {new Date(item.checkOut).toLocaleDateString()}
                        </td>
                        <td>
                          {item.ingreso?.autorizaciones?.[0]?.codigo || "N/A"}
                        </td>{" "}
                        {/* ✅ Primera autorización */}
                        <td>
                          {item.ingreso?.autorizaciones?.[0]?.monto || "$0,00"}
                        </td>{" "}
                        {/* ✅ Primer monto */}
                      </tr>
                      {/* Filas adicionales para más autorizaciones */}
                      {item.ingreso?.autorizaciones
                        ?.slice(1)
                        .map((autorizacion, authIndex) => (
                          <tr key={`${item._id}-auth-${authIndex}`}>
                            <td>{autorizacion.codigo}</td>
                            <td>{autorizacion.monto}</td>
                          </tr>
                        ))}
                    </>
                  ))}
                  {/* Subtotal */}
                  <tr className="bg-light">
                    <td colSpan="8" className="text-end fw-bold">
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
                  <th>Habitación</th>
                  <th>Tipo de Habitación</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Autorización</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                {tarjetaVirtualAmenidades.map((item, index) => (
                  <>
                    {/* Primera fila: Datos generales + primera autorización */}
                    <tr key={`${item._id}-main`}>
                      <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                        {index + 1}
                      </td>
                      <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                        {new Date(item.fechaPago).toLocaleDateString()}
                      </td>
                      <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                        {item.nombre}
                      </td>
                      <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                        {item.habitacion?.numero || "N/A"}
                      </td>
                      <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                        {item.habitacion?.tipo || "N/A"}
                      </td>
                      <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                        {new Date(item.checkIn).toLocaleDateString()}
                      </td>
                      <td rowSpan={item.ingreso?.autorizaciones?.length || 1}>
                        {new Date(item.checkOut).toLocaleDateString()}
                      </td>
                      <td>
                        {item.ingreso?.autorizaciones?.[0]?.codigo || "N/A"}
                      </td>
                      <td>
                        {item.ingreso?.autorizaciones?.[0]?.monto || "$0.00"}
                      </td>
                    </tr>
                    {/* Filas adicionales para más autorizaciones */}
                    {item.ingreso?.autorizaciones
                      ?.slice(1)
                      .map((autorizacion, authIndex) => (
                        <tr key={`${item._id}-auth-${authIndex}`}>
                          <td>{autorizacion.codigo}</td>
                          <td>{autorizacion.monto}</td>
                        </tr>
                      ))}
                  </>
                ))}
                {/* Subtotal */}
                <tr className="bg-light">
                  <td colSpan="8" className="text-end fw-bold">
                    Subtotal:
                  </td>
                  <td className="fw-bold">
                    {calculateSubtotal(tarjetaVirtualAmenidades)}
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

export default VirtualCardData;
