import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MovementForm from "../src/components/MovementForm";
import CashData from "../src/components/CashData";
import CashDollarData from "../src/components/CashDollarData";
import CashEuroData from "../src/components/CashEuroData";
import CardData from "../src/components/CardData";
import VirtualCardData from "../src/components/VirtualCardData";
import TransferData from "../src/components/TransferData";
import Totals from "../src/components/Totals";
import GeneralDashboard from "../src/components/GeneralDashboard";
import Dashboard from "../src/pages/Dashboard";
import Reports from "../src/pages/ReportsPage";
import Movements from "../src/pages/Movements"; // Importar la nueva página Movements
import NavbarComponent from "../src/components/Navbar"; // Importar el navbar

function App() {
  return (
    <Router>
      {/* Navbar se mantiene visible en todas las páginas */}
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cash-data" element={<CashData />} />
        <Route path="/cash-dollar-data" element={<CashDollarData />} />
        <Route path="/cash-euro-data" element={<CashEuroData />} />
        <Route path="/card-data" element={<CardData />} />
        <Route path="/virtual-card-data" element={<VirtualCardData />} />
        <Route path="/transfer-data" element={<TransferData />} />
        <Route path="/totals" element={<Totals />} />
        <Route path="/general-dashboard" element={<GeneralDashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/movement-form" element={<MovementForm />} />
        <Route path="/movements" element={<Movements />} />{" "}
        {/* Nueva ruta para Movements */}
      </Routes>
    </Router>
  );
}

export default App;
