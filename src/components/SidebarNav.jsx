import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FiPlusCircle,
  FiGrid,
  FiList,
  FiFileText,
  FiBarChart2,
  FiUsers,
  FiLogOut,
} from "react-icons/fi";
import logo from "../assets/logocasateka.png";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Crear Movimiento", icon: FiPlusCircle, end: true },
  { to: "/general-dashboard", label: "Tabla General", icon: FiGrid },
  { to: "/movements", label: "Movimientos", icon: FiList },
  { to: "/reports", label: "Reportes", icon: FiFileText },
  { to: "/dashboard-analisis", label: "Dashboard de Análisis", icon: FiBarChart2 },
];

const SidebarNav = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const items = [
    ...NAV_ITEMS,
    ...(user?.role === "admin"
      ? [{ to: "/users", label: "Usuarios", icon: FiUsers }]
      : []),
  ];

  return (
    <div className="d-flex flex-column h-100 sidebar-nav">
      <Link to="/" onClick={onNavigate} className="d-flex align-items-center gap-2 px-3 py-4 text-decoration-none">
        <img src={logo} alt="Casa Teka" style={{ width: 36, height: 36 }} />
        <span className="text-white fw-semibold fs-5">Casa Teka</span>
      </Link>

      <nav className="flex-grow-1 px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              "sidebar-link d-flex align-items-center gap-3 px-3 py-2 mb-1 rounded text-decoration-none" +
              (isActive ? " active" : "")
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-top border-secondary-subtle border-opacity-25">
        <div className="text-white small fw-semibold text-truncate">{user?.nombre}</div>
        <div className="text-white-50 small text-capitalize mb-3">{user?.role}</div>
        <button
          type="button"
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 w-100 justify-content-center"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
        >
          <FiLogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;
