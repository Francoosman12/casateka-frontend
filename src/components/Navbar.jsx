import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logocasateka.png"; // Ruta al archivo del logo
import { useAuth } from "../context/AuthContext";

const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" collapseOnSelect>
      <Container>
        {/* Branding con logo */}
        <Navbar.Brand href="/">
          <img
            src={logo} // Imagen del logo
            alt="Casa Teka Logo"
            style={{ width: "40px", height: "40px", marginRight: "10px" }} // Tamaño y espaciado del logo
          />
        </Navbar.Brand>

        {/* Botón del menú hamburguesa */}
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />

        {/* Elementos del navbar */}
        <Navbar.Collapse id="responsive-navbar-nav">
          {user && (
            <Nav className="me-auto">
              <Nav.Link href="/">Crear Movimiento</Nav.Link>
              <Nav.Link href="/general-dashboard">Tabla General</Nav.Link>
              <Nav.Link href="/movements">Movimientos</Nav.Link>
              <Nav.Link href="/reports">Reportes</Nav.Link>
              <Nav.Link href="/dashboard-analisis">
                Dashboard de Análisis
              </Nav.Link>
              {user.role === "admin" && (
                <Nav.Link href="/users">Usuarios</Nav.Link>
              )}
            </Nav>
          )}

          {user && (
            <Nav className="align-items-lg-center">
              <Navbar.Text className="text-white-50 me-3">
                {user.nombre}{" "}
                <span className="text-capitalize">({user.role})</span>
              </Navbar.Text>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
