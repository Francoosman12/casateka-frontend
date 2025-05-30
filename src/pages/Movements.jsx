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
import EditMovementModal from "../components/EditMovementModal";
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

  // Función para determinar el tipo de habitación según el número
  const determinarTipoHabitacion = (numeroHabitacion) => {
    if ([8, 10].includes(Number(numeroHabitacion))) {
      return "Junior Suite Tapanko";
    } else if (Number(numeroHabitacion) === 11) {
      return "Master Suite";
    } else if ([1, 2, 3, 4, 5, 6, 7, 9].includes(Number(numeroHabitacion))) {
      return "Suite Deluxe Standard";
    } else {
      return ""; // Por si no es un número válido
    }
  };

  // Manejo del formulario para editar el movimiento
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Cambio detectado en:", name, "Nuevo valor:", value); // ✅ Depuración

    const keys = name.split(".");
    if (name === "habitacion.numero") {
      // ✅ Determinar el tipo de habitación automáticamente
      const tipoHabitacion = determinarTipoHabitacion(value);
      setFormData((prevData) => ({
        ...prevData,
        habitacion: {
          ...prevData.habitacion,
          numero: value,
          tipo: tipoHabitacion, // ✅ Se actualiza dinámicamente
        },
      }));
    } else if (keys.length > 1) {
      setFormData((prevData) => ({
        ...prevData,
        [keys[0]]: {
          ...prevData[keys[0]],
          [keys[1]]: value, // ✅ Actualiza cualquier propiedad dentro de objetos anidados
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value, // ✅ Actualiza cualquier otro campo directo
      }));
    }
  };

  const handleSaveChanges = async () => {
    console.log("Datos que se enviarán al backend:", formData);

    const confirmUpdate = window.confirm(
      "¿Estás seguro de que deseas actualizar este movimiento?"
    );
    if (!confirmUpdate) return;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/movements/${
          selectedMovement._id
        }`,
        formData
      );

      console.log("Respuesta del servidor:", response.data);

      // ✅ FORZAR la actualización del estado con los datos nuevos
      setMovements((prevMovements) =>
        prevMovements.map((movement) =>
          movement._id === selectedMovement._id
            ? { ...movement, ...response.data } // ✅ Fusionamos los datos actualizados del backend
            : movement
        )
      );

      setSelectedMovement(response.data); // ✅ Reflejar los cambios en el modal inmediatamente

      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar el movimiento:", error.message);
      alert("Hubo un problema al actualizar el movimiento.");
    }
  };

  const handleDateChange = (date) => {
    setFormData((prevState) => ({
      ...prevState,
      fechaPago: date, // ✅ Se asegura de actualizar correctamente `fechaPago`
    }));
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
                      {movement.ingreso?.montoTotal?.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }) || "$0.00"}
                    </td>
                    {/* ✅ Ahora accede a `montoTotal` */}
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

      <EditMovementModal
        show={showModal}
        handleClose={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleDateChange={handleDateChange} // ✅ Ahora el modal recibirá correctamente la función
        handleSaveChanges={handleSaveChanges}
        setFormData={setFormData}
      />
    </Container>
  );
};

export default Movements;
