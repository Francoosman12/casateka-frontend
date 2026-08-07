import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Collapse,
  Badge,
} from "react-bootstrap";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import EditMovementModal from "../components/EditMovementModal";
import PaginatedTable from "../components/common/PaginatedTable";
import apiClient from "../api/client";

const parseMonto = (raw) => Number(String(raw ?? "0").replace(/,/g, "")) || 0;

const emptyFilters = {
  search: "",
  startDate: "",
  endDate: "",
  habitacionTipo: "",
  habitacionNumero: "",
  concepto: "",
  ota: "",
  ingresoTipo: "",
  ingresoSubtipo: "",
  montoMin: "",
  montoMax: "",
};

const Movements = () => {
  const [movements, setMovements] = useState([]); // Estado para los movimientos
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
  const [selectedMovement, setSelectedMovement] = useState(null); // Estado para el movimiento seleccionado
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
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
        const response = await apiClient.get("/api/movements");
        setMovements(Array.isArray(response.data) ? response.data : []); // Validar la respuesta como array
      } catch (error) {
        console.error("Error al obtener movimientos:", error.message);
      }
    };

    fetchMovements();
  }, []);

  // Habitaciones realmente presentes en los datos, para no inventar opciones
  const availableRoomNumbers = useMemo(() => {
    const numeros = new Set(
      movements.map((m) => m.habitacion?.numero).filter((n) => n != null)
    );
    return Array.from(numeros).sort((a, b) => a - b);
  }, [movements]);

  const setFilter = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const clearFilters = () => setFilters(emptyFilters);

  const advancedActiveCount = [
    filters.habitacionTipo,
    filters.habitacionNumero,
    filters.concepto,
    filters.ota,
    filters.ingresoTipo,
    filters.ingresoSubtipo,
    filters.montoMin,
    filters.montoMax,
  ].filter((v) => v !== "").length;

  const totalActiveCount =
    advancedActiveCount +
    (filters.search ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0);

  const filteredMovements = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const min = filters.montoMin !== "" ? Number(filters.montoMin) : null;
    const max = filters.montoMax !== "" ? Number(filters.montoMax) : null;

    return movements.filter((m) => {
      if (search && !m.nombre?.toLowerCase().includes(search)) return false;

      if (filters.startDate || filters.endDate) {
        const fecha = m.fechaPago
          ? new Date(m.fechaPago).toISOString().split("T")[0]
          : null;
        if (!fecha) return false;
        if (filters.startDate && fecha < filters.startDate) return false;
        if (filters.endDate && fecha > filters.endDate) return false;
      }

      if (filters.habitacionTipo && m.habitacion?.tipo !== filters.habitacionTipo)
        return false;

      if (
        filters.habitacionNumero &&
        String(m.habitacion?.numero) !== filters.habitacionNumero
      )
        return false;

      if (filters.concepto && m.concepto !== filters.concepto) return false;

      if (filters.ota && m.ota !== filters.ota) return false;

      if (filters.ingresoTipo && m.ingreso?.tipo !== filters.ingresoTipo)
        return false;

      if (
        filters.ingresoSubtipo &&
        m.ingreso?.subtipo !== filters.ingresoSubtipo
      )
        return false;

      const monto = parseMonto(m.ingreso?.montoTotal);
      if (min !== null && monto < min) return false;
      if (max !== null && monto > max) return false;

      return true;
    });
  }, [movements, filters]);

  // Función para eliminar un movimiento
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este movimiento?"
    );
    if (!confirmDelete) return; // Si el usuario cancela, no hacer nada

    try {
      await apiClient.delete(`/api/movements/${id}`);
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
      const response = await apiClient.put(
        `/api/movements/${selectedMovement._id}`,
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
    <Container className="mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">Movimientos</h2>
          <p className="text-muted mb-0">
            Listado de todos los movimientos registrados.
          </p>
        </Col>
      </Row>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Buscar por nombre</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <FiSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del huésped..."
                    value={filters.search}
                    onChange={setFilter("search")}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={setFilter("startDate")}
                />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={setFilter("endDate")}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="d-flex align-items-center gap-2"
            >
              <FiFilter />
              Más filtros
              {advancedActiveCount > 0 && (
                <Badge bg="primary" pill>
                  {advancedActiveCount}
                </Badge>
              )}
            </Button>
            {totalActiveCount > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={clearFilters}
                className="text-decoration-none d-flex align-items-center gap-1"
              >
                <FiX />
                Limpiar filtros
              </Button>
            )}
            <span className="text-muted small ms-auto">
              {filteredMovements.length} de {movements.length} movimientos
            </span>
          </div>

          <Collapse in={showAdvanced}>
            <div>
              <hr />
              <Row className="g-3">
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      Tipo de Habitación
                    </Form.Label>
                    <Form.Select
                      value={filters.habitacionTipo}
                      onChange={setFilter("habitacionTipo")}
                    >
                      <option value="">Todas</option>
                      <option value="Junior Suite Tapanko">
                        Junior Suite Tapanko
                      </option>
                      <option value="Master Suite">Master Suite</option>
                      <option value="Suite Deluxe Standard">
                        Suite Deluxe Standard
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Habitación</Form.Label>
                    <Form.Select
                      value={filters.habitacionNumero}
                      onChange={setFilter("habitacionNumero")}
                    >
                      <option value="">Todas</option>
                      {availableRoomNumbers.map((numero) => (
                        <option key={numero} value={numero}>
                          {numero}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Concepto</Form.Label>
                    <Form.Select
                      value={filters.concepto}
                      onChange={setFilter("concepto")}
                    >
                      <option value="">Todos</option>
                      <option value="Cobro de estancia">
                        Cobro de estancia
                      </option>
                      <option value="Amenidades">Amenidades</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">OTA</Form.Label>
                    <Form.Select value={filters.ota} onChange={setFilter("ota")}>
                      <option value="">Todas</option>
                      <option value="Booking">Booking</option>
                      <option value="Expedia">Expedia</option>
                      <option value="Directa">Directa</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Tipo de Ingreso</Form.Label>
                    <Form.Select
                      value={filters.ingresoTipo}
                      onChange={setFilter("ingresoTipo")}
                    >
                      <option value="">Todos</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Método de Pago</Form.Label>
                    <Form.Select
                      value={filters.ingresoSubtipo}
                      onChange={setFilter("ingresoSubtipo")}
                    >
                      <option value="">Todos</option>
                      <option value="Pesos">Pesos</option>
                      <option value="Dólares">Dólares</option>
                      <option value="Euros">Euros</option>
                      <option value="Débito/Crédito">Débito/Crédito</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Transferencias">Transferencias</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Importe mínimo</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={filters.montoMin}
                      onChange={setFilter("montoMin")}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Importe máximo</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Sin límite"
                      value={filters.montoMax}
                      onChange={setFilter("montoMax")}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Collapse>
        </Card.Body>
      </Card>

      <Row>
        <Col>
          <PaginatedTable
            key={JSON.stringify(filters)}
            responsive
            items={filteredMovements}
            headerRow={
              <tr className="bg-dark text-white">
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
            }
            renderRow={(movement) => (
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
                  {parseMonto(movement.ingreso?.montoTotal).toLocaleString(
                    "es-MX",
                    { style: "currency", currency: "MXN" }
                  )}
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
            )}
          />
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
