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
  const [formData, setFormData] = useState({
    nombre: "",
    habitacion: { numero: "", tipo: "" },
    checkIn: "",
    checkOut: "",
    concepto: "",
    ingreso: {
      tipo: "", // Tipo de ingreso seleccionado
      subtipo: "", // Subtipo de ingreso
      monto: "", // Monto editable según el tipo y subtipo
    },
    ota: "",
  });

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

    if (name === "ingreso.tipo" || name === "ingreso.subtipo") {
      setFormData((prevData) => ({
        ...prevData,
        ingreso: {
          ...prevData.ingreso,
          [name.split(".")[1]]: value, // Actualizar tipo o subtipo
          monto: "", // Reinicia el monto editable
        },
      }));
    } else if (name === "ingreso.monto") {
      // Actualizar monto
      setFormData((prevData) => ({
        ...prevData,
        ingreso: {
          ...prevData.ingreso,
          monto: value,
        },
      }));
    } else {
      // Otros campos simples
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Guardar los cambios realizados en el movimiento
  const handleSaveChanges = async () => {
    const confirmUpdate = window.confirm(
      "¿Estás seguro de que deseas actualizar este movimiento?"
    );
    if (!confirmUpdate) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/movements/${
          selectedMovement._id
        }`,
        formData
      ); // Enviar datos actualizados

      // Actualizar el estado local para reflejar cambios
      setMovements(
        movements.map((movement) =>
          movement._id === selectedMovement._id
            ? { ...movement, ...formData }
            : movement
        )
      );

      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar el movimiento:", error.message);
      alert("Hubo un problema al actualizar el movimiento.");
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
                      {movement.ingreso?.monto?.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }) || "$0.00"}
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
              {/* Nombre del huésped */}
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre || ""}
                  onChange={handleChange}
                  placeholder="Ingresa el nombre del huésped"
                />
              </Form.Group>

              {/* Número de Habitación */}
              <Form.Group className="mb-3">
                <Form.Label>Habitación</Form.Label>
                <Form.Select
                  name="habitacion.numero"
                  value={formData.habitacion?.numero || ""}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una habitación</option>
                  {[...Array(11).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      Habitación {num + 1}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Tipo de Habitación */}
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Habitación</Form.Label>
                <Form.Control
                  type="text"
                  name="habitacion.tipo"
                  value={formData.habitacion?.tipo || ""}
                  onChange={handleChange}
                  placeholder="Ingresa el tipo de habitación"
                />
              </Form.Group>

              {/* Check-In */}
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

              {/* Check-Out */}
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

              {/* Concepto */}
              <Form.Group className="mb-3">
                <Form.Label>Concepto</Form.Label>
                <Form.Select
                  name="concepto"
                  value={formData.concepto || ""}
                  onChange={handleChange}
                >
                  <option value="">Selecciona un concepto</option>
                  <option value="Cobro de estancia">Cobro de estancia</option>
                  <option value="Amenidades">Amenidades</option>
                </Form.Select>
              </Form.Group>

              {/* OTA */}
              <Form.Group className="mb-3">
                <Form.Label>OTA</Form.Label>
                <Form.Select
                  name="ota"
                  value={formData.ota || ""}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una OTA</option>
                  <option value="Booking">Booking.com</option>
                  <option value="Expedia">Expedia</option>
                  <option value="Directa">Directa</option>
                </Form.Select>
              </Form.Group>

              {/* Tipo de ingreso */}
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Ingreso</Form.Label>
                <Form.Select
                  name="ingreso.tipo"
                  value={formData.ingreso?.tipo || ""}
                  onChange={handleChange}
                >
                  <option value="">Selecciona el tipo de ingreso</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                </Form.Select>
              </Form.Group>

              {/* Subtipo de ingreso */}
              <Form.Group className="mb-3">
                <Form.Label>Subtipo de Ingreso</Form.Label>
                <Form.Select
                  name="ingreso.subtipo"
                  value={formData.ingreso?.subtipo || ""}
                  onChange={handleChange}
                >
                  <option value="">Selecciona el subtipo de ingreso</option>
                  <option value="Pesos">Pesos</option>
                  <option value="Dólares">Dólares</option>
                  <option value="Euros">Euros</option>
                  <option value="Débito/Crédito">Débito/Crédito</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Transferencias">Transferencias</option>
                </Form.Select>
              </Form.Group>

              {/* Monto */}
              <Form.Group className="mb-3">
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="text"
                  name="monto"
                  value={formData.ingreso?.monto || "0,00"} // Valor inicial por defecto
                  onChange={(e) => {
                    let inputValue = e.target.value;

                    // Remover cualquier carácter no numérico
                    inputValue = inputValue.replace(/[^0-9]/g, "");

                    // Asegurar al menos tres dígitos para manejar decimales correctamente
                    while (inputValue.length < 3) {
                      inputValue = "0" + inputValue; // Rellenar con ceros al inicio
                    }

                    // Separar la parte entera y los decimales
                    const integerPart = inputValue.slice(0, -2); // Parte entera
                    const decimalPart = inputValue.slice(-2); // Últimos 2 dígitos como decimales

                    // Formatear la parte entera y eliminar ceros iniciales innecesarios
                    const formattedIntegerPart = integerPart
                      .replace(/^0+(?!$)/, "") // Remover ceros a la izquierda
                      .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Agregar puntos como separadores de miles

                    // Construir el valor formateado
                    const formattedValue = `${
                      formattedIntegerPart || "0"
                    },${decimalPart}`;

                    // Actualizar el estado con el valor formateado
                    setFormData((prevData) => ({
                      ...prevData,
                      ingreso: { ...prevData.ingreso, monto: formattedValue },
                    }));
                  }}
                  placeholder="Ingrese el monto (Ej: $1.500,00)"
                />
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
