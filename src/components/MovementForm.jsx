import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MovementForm = () => {
  const [formData, setFormData] = useState({
    ingresos: {
      efectivo: { pesos: "", dolares: "", euros: "" },
      tarjeta: { debitoCredito: "", virtual: "", transferencias: "" },
    },
    fechaPago: null,
    nombre: "",
    habitacion: { numero: "", tipo: "" },
    checkIn: null,
    checkOut: null,
    ota: "",
    autorizacion: "",
    concepto: "",
  });

  const [ingresoSeleccionado, setIngresoSeleccionado] = useState("");

  // Variable de entorno para URL del backend
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "numero") {
      const tipoHabitacion = determinarTipoHabitacion(value);
      setFormData((prevData) => ({
        ...prevData,
        habitacion: { numero: value, tipo: tipoHabitacion },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: date,
    }));
  };

  const handleIngresosChange = (e, tipo, subCampo) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      ingresos: {
        ...prevData.ingresos,
        [tipo]: { ...prevData.ingresos[tipo], [subCampo]: value },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/movements`,
        formData
      ); // Usando variable de entorno
      alert(
        "Movimiento registrado con éxito: " + JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Error al registrar el movimiento:", error.message);
      alert("Hubo un problema al registrar el movimiento.");
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <h2 className="text-center mb-4">Registrar Flujo de Movimientos</h2>
      <Form onSubmit={handleSubmit}>
        {/* Tipo de Ingreso */}
        <Form.Group className="mb-3">
          <Form.Label>Tipo de Ingreso</Form.Label>
          <Form.Select onChange={(e) => setIngresoSeleccionado(e.target.value)}>
            <option value="">Selecciona una opción</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
          </Form.Select>
        </Form.Group>

        {/* Ingresos: Efectivo */}
        {ingresoSeleccionado === "efectivo" && (
          <fieldset className="mb-4">
            <legend>Ingresos - Efectivo</legend>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Pesos</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    placeholder="Pesos"
                    onChange={(e) =>
                      handleIngresosChange(e, "efectivo", "pesos")
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Dólares</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    placeholder="Dólares"
                    onChange={(e) =>
                      handleIngresosChange(e, "efectivo", "dolares")
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Euros</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    placeholder="Euros"
                    onChange={(e) =>
                      handleIngresosChange(e, "efectivo", "euros")
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </fieldset>
        )}

        {/* Ingresos: Tarjeta */}
        {ingresoSeleccionado === "tarjeta" && (
          <fieldset className="mb-4">
            <legend>Ingresos - Tarjeta</legend>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Débito/Crédito</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    placeholder="Tarjeta Débito/Crédito"
                    onChange={(e) =>
                      handleIngresosChange(e, "tarjeta", "debitoCredito")
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Tarjeta Virtual</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    placeholder="Virtual"
                    onChange={(e) =>
                      handleIngresosChange(e, "tarjeta", "virtual")
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Transferencias</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    placeholder="Transferencias"
                    onChange={(e) =>
                      handleIngresosChange(e, "tarjeta", "transferencias")
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label>Número de Autorización</Form.Label>
              <Form.Control
                type="text"
                placeholder="Autorización"
                name="autorizacion"
                onChange={(e) => {
                  const valor = e.target.value.toUpperCase();
                  handleChange({
                    target: { name: e.target.name, value: valor },
                  });
                }}
              />
            </Form.Group>
          </fieldset>
        )}

        {/* Fecha de Pago */}
        <Form.Group className="mb-3">
          <Form.Label>Fecha de Pago</Form.Label>
          <DatePicker
            selected={formData.fechaPago}
            onChange={(date) => handleDateChange(date, "fechaPago")}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecciona una fecha"
            className="form-control"
          />
        </Form.Group>

        {/* Número y Tipo de Habitación */}
        <Form.Group className="mb-3">
          <Form.Label>Número de Habitación</Form.Label>
          <Form.Control
            type="number"
            name="numero"
            placeholder="Número"
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tipo de Habitación</Form.Label>
          <Form.Control
            type="text"
            name="tipo"
            value={formData.habitacion.tipo}
            placeholder="Tipo de habitación"
            readOnly
          />
        </Form.Group>

        {/* Nombre */}
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            placeholder="Nombre del cliente"
            onChange={handleChange}
          />
        </Form.Group>

        {/* Fechas de Check-In y Check-Out */}
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Check-In</Form.Label>
              <DatePicker
                selected={formData.checkIn}
                onChange={(date) => handleDateChange(date, "checkIn")}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona una fecha"
                className="form-control"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Check-Out</Form.Label>
              <DatePicker
                selected={formData.checkOut}
                onChange={(date) => handleDateChange(date, "checkOut")}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona una fecha"
                className="form-control"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* OTA */}
        <Form.Group className="mb-3">
          <Form.Label>OTA</Form.Label>
          <Form.Select name="ota" onChange={handleChange}>
            <option value="">Selecciona una opción</option>
            <option value="Booking">Booking</option>
            <option value="Expedia">Expedia</option>
            <option value="Directa">Directa</option>
          </Form.Select>
        </Form.Group>

        {/* Concepto */}
        <Form.Group className="mb-3">
          <Form.Label>Concepto</Form.Label>
          <Form.Select name="concepto" onChange={handleChange}>
            <option value="">Selecciona una opción</option>
            <option value="Cobro de estancia">Cobro de estancia</option>
            <option value="Amenidades">Amenidades</option>
          </Form.Select>
        </Form.Group>

        {/* Botón de Envío */}
        <Button type="submit" variant="primary" className="w-100">
          Registrar Movimiento
        </Button>
      </Form>
    </Container>
  );
};

export default MovementForm;
