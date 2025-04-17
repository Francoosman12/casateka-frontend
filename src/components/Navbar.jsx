import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import logo from "../../public/logo-casateka.png"; // Ruta al archivo del logo

const NavbarComponent = () => {
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
          <Nav>
            <Nav.Link href="/">Crear Movimiento</Nav.Link>
            <Nav.Link href="/general-dashboard">Dashboard General</Nav.Link>
            <Nav.Link href="/movements">Movimientos</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
