import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditMovementModal = ({
  show,
  handleClose,
  formData,
  handleChange,
  handleDateChange,
  handleSaveChanges,
  setFormData,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Movimiento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formData && (
          <Form>
            {/* Tipo de Ingreso */}
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Movimiento</Form.Label>
              <Form.Select
                name="ingreso.tipo"
                value={formData.ingreso?.tipo || ""}
                onChange={handleChange}
              >
                <option value="">Selecciona una opción</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
              </Form.Select>
            </Form.Group>

            {/* Subtipo de ingreso */}
            {formData.ingreso?.tipo && (
              <Form.Group className="mb-3">
                <Form.Label>Subtipo</Form.Label>
                <Form.Select
                  name="ingreso.subtipo"
                  value={formData.ingreso?.subtipo || ""}
                  onChange={handleChange}
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

            {/* Monto Total cuando es Efectivo */}
            {formData.ingreso?.tipo === "Efectivo" && (
              <Form.Group className="mb-3">
                <Form.Label>Monto Total</Form.Label>
                <Form.Control
                  type="text"
                  name="ingreso.montoTotal"
                  value={formData.ingreso?.montoTotal || "0,00"}
                  onChange={(e) => {
                    let inputValue = e.target.value.replace(/[^0-9]/g, "");

                    while (inputValue.length < 3) {
                      inputValue = "0" + inputValue; // Rellenar con ceros al inicio
                    }

                    const integerPart = inputValue.slice(0, -2); // Parte entera
                    const decimalPart = inputValue.slice(-2); // Últimos 2 dígitos como decimales

                    const formattedIntegerPart = integerPart
                      .replace(/^0+(?!$)/, "") // Remover ceros a la izquierda
                      .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Separación de miles con puntos

                    const formattedValue = `${
                      formattedIntegerPart || "0"
                    },${decimalPart}`;

                    setFormData((prevData) => ({
                      ...prevData,
                      ingreso: {
                        ...prevData.ingreso,
                        montoTotal: formattedValue,
                      },
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
                        value={autorizacion.codigo || ""}
                        onChange={(e) => {
                          const updatedAutorizaciones = [
                            ...formData.ingreso.autorizaciones,
                          ];
                          updatedAutorizaciones[index].codigo = e.target.value;
                          handleChange({
                            target: {
                              name: "ingreso.autorizaciones",
                              value: updatedAutorizaciones,
                            },
                          });
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="text"
                        placeholder="Monto"
                        value={autorizacion.monto || "0,00"}
                        onChange={(e) => {
                          let inputValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          while (inputValue.length < 3)
                            inputValue = "0" + inputValue;
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
                          handleChange({
                            target: {
                              name: "ingreso.autorizaciones",
                              value: updatedAutorizaciones,
                            },
                          });
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
                          handleChange({
                            target: {
                              name: "ingreso.autorizaciones",
                              value: updatedAutorizaciones,
                            },
                          });
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
                    const updatedAutorizaciones = [
                      ...formData.ingreso.autorizaciones,
                      { codigo: "", monto: "0,00" },
                    ];
                    handleChange({
                      target: {
                        name: "ingreso.autorizaciones",
                        value: updatedAutorizaciones,
                      },
                    });
                  }}
                >
                  Agregar Código de Autorización
                </Button>
              </Form.Group>
            )}

            {/* Fechas */}
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
                name="habitacion.numero"
                value={formData.habitacion?.numero || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo de Habitación</Form.Label>
              <Form.Control
                type="text"
                name="habitacion.tipo"
                value={formData.habitacion?.tipo || ""}
                placeholder="Tipo de habitación"
                readOnly
              />
            </Form.Group>

            {/* Nombre y OTA */}
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
              <Form.Label>OTA</Form.Label>
              <Form.Select
                name="ota"
                value={formData.ota || ""}
                onChange={handleChange}
              >
                <option value="">Selecciona una opción</option>
                <option value="Booking">Booking</option>
                <option value="Expedia">Expedia</option>
                <option value="Directa">Directa</option>
              </Form.Select>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditMovementModal;
