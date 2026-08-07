import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Offcanvas } from "react-bootstrap";
import { FiMenu } from "react-icons/fi";
import SidebarNav from "./SidebarNav";
import logo from "../assets/logocasateka.png";

const SIDEBAR_WIDTH = 264;

const AppLayout = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <div className="app-shell">
      {/* Sidebar fijo, visible desde lg hacia arriba */}
      <aside
        className="app-sidebar d-none d-lg-flex flex-column"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <SidebarNav />
      </aside>

      {/* Topbar solo en mobile/tablet, con botón para abrir el menú */}
      <header className="app-topbar d-flex d-lg-none align-items-center justify-content-between px-3">
        <button
          type="button"
          className="btn btn-outline-light btn-sm"
          onClick={() => setShowMobileNav(true)}
          aria-label="Abrir menú"
        >
          <FiMenu size={20} />
        </button>
        <img src={logo} alt="Casa Teka" style={{ width: 32, height: 32 }} />
        <span style={{ width: 32 }} />
      </header>

      <Offcanvas
        show={showMobileNav}
        onHide={() => setShowMobileNav(false)}
        className="bg-dark border-0"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <SidebarNav onNavigate={() => setShowMobileNav(false)} />
      </Offcanvas>

      <main className="app-content">
        <div className="container-fluid px-3 px-md-4 py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
