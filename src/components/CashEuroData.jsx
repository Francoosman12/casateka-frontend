import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import PaginatedTable from "./common/PaginatedTable";

const CashEuroData = ({ data }) => {
  // Filtrar movimientos en efectivo en euros por concepto de estancia y amenidades
  const efectivoEurosEstancia = data.filter(
    (item) =>
      item.ingreso?.tipo === "Efectivo" &&
      item.ingreso?.subtipo === "Euros" &&
      item.concepto === "Cobro de estancia"
  );

  const efectivoEurosAmenidades = data.filter(
    (item) =>
      item.ingreso?.tipo === "Efectivo" &&
      item.ingreso?.subtipo === "Euros" &&
      item.concepto === "Amenidades"
  );

  // Agrupar los movimientos por OTA (Booking, Expedia, Directa, etc.)
  const groupByOTA = (items) => {
    return items.reduce((grouped, item) => {
      const key = item.ota || "Sin OTA"; // Usar "Sin OTA" si el valor de OTA está vacío
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
      return grouped;
    }, {});
  };

  const groupedEstancia = groupByOTA(efectivoEurosEstancia);

  // Función para calcular el subtotal
  const calculateSubtotal = (items) => {
    console.log("Datos filtrados antes del cálculo:", items);
    console.log(
      "Montos extraídos:",
      items.map((i) => i.ingreso?.montoTotal)
    );
    console.log("Cantidad de elementos:", items.length);

    return items
      .reduce((total, item) => {
        let rawMonto = item.ingreso?.montoTotal || "0,00";
        console.log("Procesando montoTotal antes de conversión:", rawMonto);

        // ✅ Eliminamos primero los puntos de separación de miles, luego convertimos la coma decimal
        let formattedMonto = rawMonto.replace(/,/g, "").replace(/\./g, ".");

        console.log("Monto formateado antes de convertir:", formattedMonto); // 🔹 Aquí debe ser `1000.00`, no `1.00000`

        const montoConvertido = parseFloat(formattedMonto) || 0;
        console.log("Monto final procesado:", montoConvertido); // ✅ Ahora debe reflejar `1000.00` correctamente

        return total + montoConvertido;
      }, 0)
      .toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  };

  return (
    <Container className="mt-5 mb-5">
      {/* Encabezado */}
      <Card className="bg-dark">
        <Card.Body>
          <Card.Title className="text-center text-white">
            Ingreso en Efectivo en Euros
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
              <PaginatedTable
                className="cash-euro-data-table"
                items={groupedEstancia[ota]}
                headerRow={
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
                }
                renderRow={(item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{new Date(item.fechaPago).toLocaleDateString()}</td>
                    <td>{item.nombre}</td>
                    <td>{item.habitacion?.numero || "N/A"}</td>
                    <td>{item.habitacion?.tipo || "N/A"}</td>
                    <td>{new Date(item.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(item.checkOut).toLocaleDateString()}</td>
                    <td>{item.ingreso?.montoTotal || "€0.00"}</td>
                  </tr>
                )}
                subtotalRow={
                  <tr className="bg-light">
                    <td colSpan="7" className="text-end fw-bold">
                      Subtotal:
                    </td>
                    <td className="fw-bold">
                      {calculateSubtotal(groupedEstancia[ota])}
                    </td>
                  </tr>
                }
              />
            </Card>
          ))}
        </Col>
      </Row>

      {/* Tabla de Amenidades */}
      <Row>
        <Col>
          <h3 className="text-dark">Amenidades</h3>
          <Card>
            <PaginatedTable
              items={efectivoEurosAmenidades}
              headerRow={
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
              }
              renderRow={(item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{new Date(item.fechaPago).toLocaleDateString()}</td>
                  <td>{item.nombre}</td>
                  <td>{item.habitacion?.numero || "N/A"}</td>
                  <td>{item.habitacion?.tipo || "N/A"}</td>
                  <td>{new Date(item.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(item.checkOut).toLocaleDateString()}</td>
                  <td>{item.ingreso?.montoTotal || "€0.00"}</td>
                </tr>
              )}
              subtotalRow={
                <tr className="bg-light">
                  <td colSpan="7" className="text-end fw-bold">
                    Subtotal:
                  </td>
                  <td className="fw-bold">
                    {calculateSubtotal(efectivoEurosAmenidades)}
                  </td>
                </tr>
              }
            />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CashEuroData;
