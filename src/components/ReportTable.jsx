import React from "react";
import { Container, Card } from "react-bootstrap";
import CashData from "./CashData"; // ✅ Llamamos al componente de efectivo
import CardData from "./CardData"; // ✅ Llamamos al componente de tarjetas
import CashDollarData from "./CashDollarData";
import CashEuroData from "./CashEuroData";
import VirtualCardData from "./VirtualCardData";
import TransferData from "./TransferData";

const ReportTable = ({ data }) => {
  return (
    <Container className="mt-5 mb-5">
      <Card className="bg-dark">
        <Card.Body>
          <Card.Title className="text-center text-white">
            Reporte de Movimientos
          </Card.Title>
        </Card.Body>
      </Card>

      {/* ✅ Llamando a cada tabla como un componente */}
      <CashData data={data} />
      <CashDollarData data={data} />
      <CashEuroData data={data} />
      <CardData data={data} />
      <VirtualCardData data={data} />
      <TransferData data={data} />

      {/* Aquí seguiremos agregando más tablas conforme las integramos */}
    </Container>
  );
};

export default ReportTable;
