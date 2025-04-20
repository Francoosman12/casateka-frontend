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
      const response = await axios.post(`${backendUrl}/api/movements`, {
        ...formData,
        ingreso: {
          tipo: formData.ingreso.tipo,
          subtipo: formData.ingreso.subtipo,
          monto: formData.ingreso.monto, // Valor formateado se envía directamente
        },
      });
      alert("Movimiento registrado con éxito");
      resetForm(); // Reinicia el formulario
    } catch (error) {
      console.error("Error al registrar el movimiento:", error.message);
      alert("Hubo un problema al registrar el movimiento.");
    }
  };

  const resetForm = () => {
    setFormData({
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
    setIngresoSeleccionado(""); // Reinicia ingresoSeleccionado si aplica
  };

  return (
    <Container className="mt-5 mb-5">
      <h2 className="text-center mb-4">Registrar Flujo de Movimientos</h2>
      <Form onSubmit={handleSubmit}>
        {/* Tipo de Ingreso */}
        <Form.Group className="mb-3">
          <Form.Label>Tipo de Movimiento</Form.Label>
          <Form.Select
            name="tipo"
            value={formData.ingreso?.tipo || ""}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                ingreso: {
                  ...prevData.ingreso,
                  tipo: e.target.value,
                  subtipo: "",
                  monto: "",
                },
              }))
            }
          >
            <option value="">Selecciona una opción</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
          </Form.Select>
        </Form.Group>
        {formData.ingreso?.tipo && (
          <Form.Group className="mb-3">
            <Form.Label>Subtipo</Form.Label>
            <Form.Select
              name="subtipo"
              value={formData.ingreso?.subtipo || ""}
              onChange={(e) =>
                setFormData((prevData) => ({
                  ...prevData,
                  ingreso: { ...prevData.ingreso, subtipo: e.target.value },
                }))
              }
            >
              <option value="">Selecciona una opción</option>
              {formData.ingreso.tipo === "Efectivo" && (
                <>
                  <option value="Pesos">Pesos</option>
                  <option value="Dólares">Dólares</option>
                  <option value="Euros">Euros</option>
                </>
              )}
              {formData.ingreso.tipo === "Tarjeta" && (
                <>
                  <option value="Débito/Crédito">Débito/Crédito</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Transferencias">Transferencias</option>
                </>
              )}
            </Form.Select>
          </Form.Group>
        )}
        {formData.ingreso?.subtipo && (
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
                  .replace(/^0+(?!$)/, "")
                  .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Sin ceros iniciales

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
        )}

        {formData.ingreso?.tipo === "Tarjeta" && (
          <Form.Group className="mb-3">
            <Form.Label>Autorización</Form.Label>
            <Form.Control
              type="text"
              name="autorizacion"
              value={formData.autorizacion || ""}
              onChange={(e) => {
                const { value } = e.target;
                setFormData((prevData) => ({
                  ...prevData,
                  autorizacion: value, // Actualiza el estado con la autorización ingresada
                }));
              }}
              placeholder="Ingresa el código de autorización"
            />
          </Form.Group>
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
