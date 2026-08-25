import React, { useCallback, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
  Badge,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { FiEye, FiEyeOff } from "react-icons/fi";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  username: "",
  nombre: "",
  password: "",
  confirmPassword: "",
  role: "recepcion",
};
const emptyEditForm = { nombre: "", role: "recepcion", password: "", confirmPassword: "" };

// Campo de contraseña con botón para mostrar/ocultar (el "ojito"), como en
// cualquier formulario de login o alta de usuario profesional.
const PasswordField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  helpText,
  isInvalid,
  autoComplete = "new-password",
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <InputGroup hasValidation>
        <Form.Control
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          minLength={minLength}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          isInvalid={isInvalid}
        />
        <Button
          variant="outline-secondary"
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          tabIndex={-1}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </Button>
        {isInvalid && (
          <Form.Control.Feedback type="invalid">
            Las contraseñas no coinciden.
          </Form.Control.Feedback>
        )}
      </InputGroup>
      {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>
  );
};

const UsersAdmin = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editError, setEditError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/api/auth/users");
      setUsers(data);
    } catch (err) {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createPasswordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const { confirmPassword, ...payload } = form;
      await apiClient.post("/api/auth/register", payload);
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

  const openEdit = (targetUser) => {
    setEditingUser(targetUser);
    setEditForm({
      nombre: targetUser.nombre,
      role: targetUser.role,
      password: "",
      confirmPassword: "",
    });
    setEditError("");
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm(emptyEditForm);
    setEditError("");
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const editPasswordMismatch =
    editForm.confirmPassword.length > 0 &&
    editForm.password !== editForm.confirmPassword;

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (editForm.password !== editForm.confirmPassword) {
      setEditError("Las contraseñas no coinciden.");
      return;
    }

    const payload = { nombre: editForm.nombre, role: editForm.role };
    if (editForm.password) payload.password = editForm.password;

    try {
      await apiClient.patch(`/api/auth/users/${editingUser._id}`, payload);
      setSuccess(`Usuario "${editingUser.username}" actualizado correctamente.`);
      closeEdit();
      fetchUsers();
    } catch (err) {
      setEditError(
        err.response?.data?.message || "No se pudo actualizar el usuario."
      );
    }
  };

  const handleDelete = async (targetUser) => {
    const confirmDelete = window.confirm(
      `¿Eliminar definitivamente la cuenta "${targetUser.username}"? Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/api/auth/users/${targetUser._id}`);
      setSuccess(`Usuario "${targetUser.username}" eliminado.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo eliminar el usuario.");
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-1">Usuarios</h2>
      <p className="text-muted mb-4">
        Creá cuentas de acceso para el equipo y gestioná quién puede entrar.
      </p>

      <Row className="justify-content-center mb-5">
        <Col xs={12} md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Crear nuevo usuario</Card.Title>
              {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
              {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}
              <Form onSubmit={handleSubmit} noValidate>
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
                <PasswordField
                  label="Contraseña"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
                <PasswordField
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  minLength={8}
                  required
                  isInvalid={createPasswordMismatch}
                />
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
                    <td className="d-flex flex-wrap gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(u)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={u.activo ? "outline-danger" : "outline-success"}
                        disabled={u._id === currentUser?.id}
                        onClick={() => toggleActive(u)}
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={u._id === currentUser?.id}
                        onClick={() => handleDelete(u)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Modal show={!!editingUser} onHide={closeEdit} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar usuario</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit} noValidate>
          <Modal.Body>
            {editError && <Alert variant="danger">{editError}</Alert>}
            <p className="text-muted small">
              Usuario: <strong>{editingUser?.username}</strong> (no se puede cambiar)
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                name="nombre"
                value={editForm.nombre}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                disabled={editingUser?._id === currentUser?.id}
              >
                <option value="recepcion">Recepción</option>
                <option value="admin">Administrador</option>
              </Form.Select>
              {editingUser?._id === currentUser?.id && (
                <Form.Text className="text-muted">
                  No podés cambiar tu propio rol.
                </Form.Text>
              )}
            </Form.Group>
            <PasswordField
              label="Nueva contraseña"
              name="password"
              value={editForm.password}
              onChange={handleEditChange}
              minLength={8}
              placeholder="Dejar en blanco para no cambiarla"
              helpText="Usá esto si el usuario se olvidó su contraseña."
            />
            <PasswordField
              label="Confirmar nueva contraseña"
              name="confirmPassword"
              value={editForm.confirmPassword}
              onChange={handleEditChange}
              minLength={8}
              placeholder="Repetir la nueva contraseña"
              isInvalid={editPasswordMismatch}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeEdit}>
              Cancelar
            </Button>
            <Button type="submit" variant="dark">
              Guardar cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UsersAdmin;
