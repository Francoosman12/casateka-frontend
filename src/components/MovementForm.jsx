import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MovementForm = () => {
  const [formData, setFormData] = useState({
    ingreso: {
      tipo: "",
      subtipo: "",
      montoTotal: "0,00", // ✅ Agregado aquí
      autorizaciones: [{ codigo: "", monto: "" }],
    },
    fechaPago: null,
    nombre: "",
    habitacion: { numero: "", tipo: "" },
    checkIn: null,
    checkOut: null,
    ota: "",
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

    let montoTotal = 0;

    if (formData.ingreso?.tipo === "Tarjeta") {
      montoTotal = formData.ingreso.autorizaciones.reduce(
        (total, autorizacion) => {
          let montoLimpio = autorizacion.monto
            .replace(/\./g, "")
            .replace(",", ".");
          return total + parseFloat(montoLimpio || "0");
        },
        0
      );
    } else {
      montoTotal = parseFloat(
        formData.ingreso?.montoTotal.replace(/\./g, "").replace(",", ".") || "0"
      );
    }

    // **Convertir a formato de presentación antes de enviar al backend**
    const formattedMontoTotal = new Intl.NumberFormat("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(montoTotal);

    console.log("Monto Total que se enviará:", formattedMontoTotal);

    try {
      const response = await axios.post(`${backendUrl}/api/movements`, {
        ...formData,
        ingreso: {
          tipo: formData.ingreso?.tipo || "Tarjeta",
          subtipo: formData.ingreso?.subtipo || "",
          montoTotal: formattedMontoTotal, // Ahora con separación de miles y dos decimales
          autorizaciones:
            formData.ingreso?.tipo === "Tarjeta"
              ? formData.ingreso.autorizaciones
              : [],
        },
      });

      alert("Movimiento registrado con éxito");
      resetForm();
    } catch (error) {
      console.error("Error al registrar el movimiento:", error.message);
      alert("Hubo un problema al registrar el movimiento.");
    }
  };

  const resetForm = () => {
    setFormData({
      ingreso: { tipo: "", subtipo: "", montoTotal: "", autorizaciones: [] }, // Reseteo completo de ingreso
      fechaPago: null,
      nombre: "",
      habitacion: { numero: "", tipo: "" },
      checkIn: null,
      checkOut: null,
      ota: "",
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
                  montoTotal: "", // Asegurar que se resetee al cambiar el tipo
                  autorizaciones:
                    e.target.value === "Tarjeta"
                      ? [{ codigo: "", monto: "0,00" }]
                      : [], // Ajuste dinámico
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

        {/* Monto Total cuando el ingreso es Efectivo */}
        {formData.ingreso?.tipo === "Efectivo" && (
          <Form.Group className="mb-3">
            <Form.Label>Monto Total</Form.Label>
            <Form.Control
              type="text"
              name="montoTotal"
              value={formData.ingreso?.montoTotal || "0,00"}
              onChange={(e) => {
                let inputValue = e.target.value.replace(/[^0-9]/g, "");

                while (inputValue.length < 3) {
                  inputValue = "0" + inputValue; // Rellenar con ceros al inicio
                }

                const integerPart = inputValue.slice(0, -2); // Parte entera
                const decimalPart = inputValue.slice(-2); // Últimos 2 dígitos como decimales

                const formattedIntegerPart = integerPart
                  .replace(/^0+(?!$)/, "")
                  .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Separación de miles con puntos

                const formattedValue = `${
                  formattedIntegerPart || "0"
                },${decimalPart}`;

                setFormData((prevData) => ({
                  ...prevData,
                  ingreso: { ...prevData.ingreso, montoTotal: formattedValue },
                }));
              }}
              placeholder="Ingrese el monto total (Ej: $1.500,00)"
            />
          </Form.Group>
        )}

        {/* Autorizaciones cuando el ingreso es Tarjeta */}
        {formData.ingreso?.tipo === "Tarjeta" && (
          <Form.Group className="mb-3">
            <Form.Label>Autorizaciones</Form.Label>
            {formData.ingreso.autorizaciones.map((autorizacion, index) => (
              <Row key={index} className="mb-2">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Código de autorización"
                    value={autorizacion.codigo}
                    onChange={(e) => {
                      const updatedAutorizaciones = [
                        ...formData.ingreso.autorizaciones,
                      ];
                      updatedAutorizaciones[index].codigo = e.target.value;
                      setFormData((prevData) => ({
                        ...prevData,
                        ingreso: {
                          ...prevData.ingreso,
                          autorizaciones: updatedAutorizaciones,
                        },
                      }));
                    }}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Monto"
                    value={autorizacion.monto || "0,00"}
                    onChange={(e) => {
                      let inputValue = e.target.value.replace(/[^0-9]/g, "");
                      while (inputValue.length < 3) {
                        inputValue = "0" + inputValue;
                      }
                      const integerPart = inputValue.slice(0, -2);
                      const decimalPart = inputValue.slice(-2);
                      const formattedIntegerPart = integerPart
                        .replace(/^0+(?!$)/, "")
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                      const formattedValue = `${
                        formattedIntegerPart || "0"
                      },${decimalPart}`;

                      const updatedAutorizaciones = [
                        ...formData.ingreso.autorizaciones,
                      ];
                      updatedAutorizaciones[index].monto = formattedValue;
                      setFormData((prevData) => ({
                        ...prevData,
                        ingreso: {
                          ...prevData.ingreso,
                          autorizaciones: updatedAutorizaciones,
                        },
                      }));
                    }}
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant="danger"
                    onClick={() => {
                      const updatedAutorizaciones =
                        formData.ingreso.autorizaciones.filter(
                          (_, i) => i !== index
                        );
                      setFormData((prevData) => ({
                        ...prevData,
                        ingreso: {
                          ...prevData.ingreso,
                          autorizaciones: updatedAutorizaciones,
                        },
                      }));
                    }}
                  >
                    Eliminar
                  </Button>
                </Col>
              </Row>
            ))}
            <Button
              variant="success"
              onClick={() => {
                setFormData((prevData) => ({
                  ...prevData,
                  ingreso: {
                    ...prevData.ingreso,
                    autorizaciones: [
                      ...prevData.ingreso.autorizaciones,
                      { codigo: "", monto: "0,00" },
                    ],
                  },
                }));
              }}
            >
              Agregar Código de Autorización
            </Button>
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
