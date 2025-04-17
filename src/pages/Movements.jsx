import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";
import axios from "axios";

const Movements = () => {
  const [movements, setMovements] = useState([]); // Estado para los movimientos
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
  const [selectedMovement, setSelectedMovement] = useState(null); // Estado para el movimiento seleccionado
  const [formData, setFormData] = useState({}); // Estado para el formulario

  // Obtener todos los movimientos al cargar la página
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/movements`
        ); // Utilizando la variable de entorno
        setMovements(Array.isArray(response.data) ? response.data : []); // Validar la respuesta como array
      } catch (error) {
        console.error("Error al obtener movimientos:", error.message);
      }
    };

    fetchMovements();
  }, []);

  // Función para eliminar un movimiento
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este movimiento?"
    );
    if (!confirmDelete) return; // Si el usuario cancela, no hacer nada

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/movements/${id}`
      ); // Utilizando la variable de entorno
      setMovements(movements.filter((movement) => movement._id !== id)); // Actualizar estado
    } catch (error) {
      console.error("Error al eliminar el movimiento:", error.message);
    }
  };

  // Abrir el modal con los datos del movimiento seleccionado
  const handleEdit = (movement) => {
    setSelectedMovement(movement);
    setFormData(movement); // Inicializar el formulario con los datos del movimiento
    setShowModal(true); // Mostrar el modal
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMovement(null);
  };

  // Manejo del formulario para editar el movimiento
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si el nombre incluye "habitacion", actualiza el objeto anidado
    if (name.startsWith("habitacion.")) {
      const [parent, child] = name.split("."); // Divide el nombre en "habitacion" y "numero" o "tipo"
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent], // Mantén el resto de los datos de habitacion
          [child]: value, // Actualiza solo el campo específico
        },
      });
    } else {
      // Actualiza los campos simples
      setFormData({ ...formData, [name]: value });
    }
  };

  // Guardar los cambios realizados en el movimiento
  const handleSaveChanges = async () => {
    const confirmUpdate = window.confirm(
      "¿Estás seguro de que deseas actualizar este movimiento?"
    );
    if (!confirmUpdate) return; // Si el usuario cancela, no hacer nada

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/movements/${
          selectedMovement._id
        }`, // Utilizando la variable de entorno
        formData
      ); // Actualizar movimiento por ID
      setMovements(
        movements.map((movement) =>
          movement._id === selectedMovement._id
            ? { ...movement, ...formData }
            : movement
        )
      ); // Actualizar estado con los cambios
      handleCloseModal(); // Cerrar el modal
    } catch (error) {
      console.error("Error al actualizar el movimiento:", error.message);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Movimientos</h1>
          <p className="text-center text-muted">
            Listado de todos los movimientos registrados.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead className="bg-dark text-white">
              <tr>
                <th>Nombre</th>
                <th>Habitación</th>
                <th>Tipo de Habitación</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Concepto</th>
                <th>OTA</th>
                <th>Importe</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(movements) &&
                movements.map((movement) => (
                  <tr key={movement._id}>
                    <td>{movement.nombre}</td>
                    <td>{movement.habitacion?.numero || "N/A"}</td>
                    <td>{movement.habitacion?.tipo || "N/A"}</td>
                    <td>
                      {movement.checkIn
                        ? new Date(movement.checkIn).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {movement.checkOut
                        ? new Date(movement.checkOut).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>{movement.concepto || "N/A"}</td>
                    <td>{movement.ota || "N/A"}</td>
                    <td>
                      {movement.ingresos?.efectivo?.pesos ||
                        movement.ingresos?.efectivo?.dolares ||
                        movement.ingresos?.efectivo?.euros ||
                        movement.ingresos?.tarjeta?.debitoCredito ||
                        movement.ingresos?.tarjeta?.virtual ||
                        movement.ingresos?.tarjeta?.transferencias ||
                        0}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(movement)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(movement._id)}
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

      {/* Modal para editar movimiento */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Movimiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMovement && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Habitación</Form.Label>
                <Form.Select
                  name="habitacion.numero"
                  value={formData.habitacion?.numero || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione una habitación</option>
                  {[...Array(11).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      Habitación {num + 1}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Concepto</Form.Label>
                <Form.Select
                  name="concepto"
                  value={formData.concepto || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un concepto</option>
                  <option value="Cobro de estancia">Cobro de estancia</option>
                  <option value="Amenidades">Amenidades</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Check-In</Form.Label>
                <Form.Control
                  type="date"
                  name="checkIn"
                  value={
                    formData.checkIn
                      ? new Date(formData.checkIn).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Check-Out</Form.Label>
                <Form.Control
                  type="date"
                  name="checkOut"
                  value={
                    formData.checkOut
                      ? new Date(formData.checkOut).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Ingreso</Form.Label>
                <Form.Select
                  name="tipoIngreso"
                  value={formData.tipoIngreso || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione el tipo de ingreso</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta Débito/Crédito">
                    Tarjeta Débito/Crédito
                  </option>
                  <option value="Tarjeta Virtual">Tarjeta Virtual</option>
                  <option value="Transferencia">Transferencia</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>OTA</Form.Label>
                <Form.Select
                  name="ota"
                  value={formData.ota || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione una OTA</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Expedia">Expedia</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Hoteles.com">Hoteles.com</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Movements;
