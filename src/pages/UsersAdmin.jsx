import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge } from "react-bootstrap";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyForm = { username: "", nombre: "", password: "", role: "recepcion" };

const UsersAdmin = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get("/api/auth/users");
      setUsers(data);
    } catch (err) {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await apiClient.post("/api/auth/register", form);
      setSuccess(`Usuario "${form.username}" creado correctamente.`);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo crear el usuario.");
    }
  };

  const toggleActive = async (targetUser) => {
    try {
      await apiClient.patch(`/api/auth/users/${targetUser._id}/active`, {
        activo: !targetUser.activo,
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo actualizar el usuario.");
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <h1 className="text-center mb-4">Usuarios</h1>

      <Row className="justify-content-center mb-5">
        <Col xs={12} md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Crear nuevo usuario</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Control
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    minLength={8}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select name="role" value={form.role} onChange={handleChange}>
                    <option value="recepcion">Recepción</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>
                <Button type="submit" variant="dark" className="w-100">
                  Crear usuario
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead className="bg-dark text-white">
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.nombre}</td>
                    <td>{u.username}</td>
                    <td className="text-capitalize">{u.role}</td>
                    <td>
                      <Badge bg={u.activo ? "success" : "secondary"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={u.activo ? "outline-danger" : "outline-success"}
                        disabled={u._id === currentUser?.id}
                        onClick={() => toggleActive(u)}
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default UsersAdmin;
