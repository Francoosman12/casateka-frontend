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
import Movements from "../src/pages/Movements";
import NavbarComponent from "../src/components/Navbar";
import AnalysisDashboard from "../src/pages/AnalysisDashboard"; // ✅ Importar la nueva página de análisis
import Login from "../src/pages/Login";
import UsersAdmin from "../src/pages/UsersAdmin";
import ProtectedRoute from "../src/components/ProtectedRoute";
import { AuthProvider } from "../src/context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Navbar se mantiene visible en todas las páginas */}
        <NavbarComponent />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cash-data"
            element={
              <ProtectedRoute>
                <CashData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cash-dollar-data"
            element={
              <ProtectedRoute>
                <CashDollarData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cash-euro-data"
            element={
              <ProtectedRoute>
                <CashEuroData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/card-data"
            element={
              <ProtectedRoute>
                <CardData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/virtual-card-data"
            element={
              <ProtectedRoute>
                <VirtualCardData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer-data"
            element={
              <ProtectedRoute>
                <TransferData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/totals"
            element={
              <ProtectedRoute>
                <Totals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/general-dashboard"
            element={
              <ProtectedRoute>
                <GeneralDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movement-form"
            element={
              <ProtectedRoute>
                <MovementForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movements"
            element={
              <ProtectedRoute>
                <Movements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-analisis"
            element={
              <ProtectedRoute>
                <AnalysisDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <UsersAdmin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
