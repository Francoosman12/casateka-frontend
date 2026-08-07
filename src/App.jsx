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
import AnalysisDashboard from "../src/pages/AnalysisDashboard";
import Login from "../src/pages/Login";
import UsersAdmin from "../src/pages/UsersAdmin";
import ProtectedRoute from "../src/components/ProtectedRoute";
import AppLayout from "../src/components/AppLayout";
import { AuthProvider } from "../src/context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
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
            <Route path="/movements" element={<Movements />} />
            <Route path="/dashboard-analisis" element={<AnalysisDashboard />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <UsersAdmin />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
