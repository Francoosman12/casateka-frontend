import * as XLSX from "xlsx";

export const exportToExcel = (filteredData) => {
  const today = new Date().toISOString().split("T")[0];
  const workbook = XLSX.utils.book_new(); // Crear un nuevo libro de Excel
  const sheetData = []; // Datos que se agregarán a la hoja Excel

  // Agregar espaciadores entre tablas
  const addSpacer = () => sheetData.push([]);

  // Función para agregar cada tabla con más detalles y subtotales
  const addTable = (title, data, columns) => {
    sheetData.push([title]); // Título de la tabla
    sheetData.push(columns); // Encabezados
    let subtotal = 0; // Inicializar subtotal

    data.forEach((item) => {
      const row = columns.map((col) => {
        switch (col) {
          case "Fecha de Pago":
            return item.fechaPago ? new Date(item.fechaPago).toLocaleDateString() : "";
          case "Nombre":
            return item.nombre || "N/A";
          case "Habitación":
            return item.habitacion?.numero || "N/A";
          case "Tipo de Habitación":
            return item.habitacion?.tipo || "N/A";
          case "Check-In":
            return item.checkIn ? new Date(item.checkIn).toLocaleDateString() : "";
          case "Check-Out":
            return item.checkOut ? new Date(item.checkOut).toLocaleDateString() : "";
          case "Autorización":
            return item.autorizacion || "N/A";
          case "OTA":
            return item.ota || "Sin OTA";
          case "Importe":
            const importe =
              item.ingresos?.efectivo?.pesos ||
              item.ingresos?.efectivo?.dolares ||
              item.ingresos?.efectivo?.euros ||
              item.ingresos?.tarjeta?.debitoCredito ||
              item.ingresos?.tarjeta?.virtual ||
              item.ingresos?.tarjeta?.transferencias ||
              0;
            subtotal += importe; // Acumular subtotal
            return importe;
          case "Concepto":
            return item.concepto || "N/A";
          default:
            return "";
        }
      });
      sheetData.push(row); // Agregar fila a la tabla
    });

    // Agregar fila de subtotal
    const subtotalRow = columns.map((col) => (col === "Importe" ? subtotal : col === "" ? "" : ""));
    subtotalRow[0] = "Subtotal:"; // Agregar texto "Subtotal" en la primera celda
    sheetData.push(subtotalRow);
    addSpacer(); // Separar tablas
  };

  // Función para agregar únicamente los totales relevantes
  const addTotals = () => {
    sheetData.push(["Concepto", "Total"]); // Encabezados de la tabla

    // Calcular totales basados en Totals.jsx
    const totalEfectivoMXN = filteredData.reduce((total, item) => total + (item.ingresos?.efectivo?.pesos || 0), 0);
    const totalEfectivoUSD = filteredData.reduce((total, item) => total + (item.ingresos?.efectivo?.dolares || 0), 0);
    const totalEfectivoEUR = filteredData.reduce((total, item) => total + (item.ingresos?.efectivo?.euros || 0), 0);
    const totalDebitoCredito = filteredData.reduce((total, item) => total + (item.ingresos?.tarjeta?.debitoCredito || 0), 0);
    const totalTarjetasVirtuales = filteredData.reduce((total, item) => total + (item.ingresos?.tarjeta?.virtual || 0), 0);
    const totalTransferencias = filteredData.reduce((total, item) => total + (item.ingresos?.tarjeta?.transferencias || 0), 0);

    const totalEstancia = filteredData
      .filter((item) => item.concepto === "Cobro de estancia")
      .reduce((total, item) => {
        return (
          total +
          (item.ingresos?.efectivo?.pesos || 0) +
          (item.ingresos?.efectivo?.dolares || 0) +
          (item.ingresos?.efectivo?.euros || 0) +
          (item.ingresos?.tarjeta?.debitoCredito || 0) +
          (item.ingresos?.tarjeta?.virtual || 0) +
          (item.ingresos?.tarjeta?.transferencias || 0)
        );
      }, 0);

    const totalAmenidades = filteredData
      .filter((item) => item.concepto === "Amenidades")
      .reduce((total, item) => {
        return (
          total +
          (item.ingresos?.efectivo?.pesos || 0) +
          (item.ingresos?.efectivo?.dolares || 0) +
          (item.ingresos?.efectivo?.euros || 0) +
          (item.ingresos?.tarjeta?.debitoCredito || 0) +
          (item.ingresos?.tarjeta?.virtual || 0) +
          (item.ingresos?.tarjeta?.transferencias || 0)
        );
      }, 0);

    const totalGeneral = totalEstancia + totalAmenidades;

    const totalNoches = filteredData
      .filter((item) => item.concepto === "Cobro de estancia")
      .reduce((total, item) => total + (item.noches || 0), 0);

    const tarifaPromedioPorNoche = totalNoches > 0 ? totalEstancia / totalNoches : 0;

    // Agregar filas con cada concepto y su total
    sheetData.push(["Efectivo MXN", totalEfectivoMXN]);
    sheetData.push(["Efectivo USD", totalEfectivoUSD]);
    sheetData.push(["Efectivo EUR", totalEfectivoEUR]);
    sheetData.push(["Tarjeta Débito/Crédito", totalDebitoCredito]);
    sheetData.push(["Tarjetas Virtuales", totalTarjetasVirtuales]);
    sheetData.push(["Transferencias", totalTransferencias]);
    sheetData.push(["Cobro de Estancia", totalEstancia]);
    sheetData.push(["Amenidades", totalAmenidades]);
    sheetData.push(["Total General", totalGeneral]);
    sheetData.push(["Promedio por Noche", tarifaPromedioPorNoche.toFixed(2)]);

    addSpacer(); // Agregar espaciador después de los totales
  };

  // Agregar datos de cada tabla con subtotales
  addTotals();

  addTable(
    "Cash Data",
    filteredData.filter((item) => item.ingresos?.efectivo?.pesos > 0),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Cash Dollar Data",
    filteredData.filter((item) => item.ingresos?.efectivo?.dolares > 0),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Cash Euro Data",
    filteredData.filter((item) => item.ingresos?.efectivo?.euros > 0),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Card Data",
    filteredData.filter((item) => item.ingresos?.tarjeta?.debitoCredito > 0),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Virtual Card Data",
    filteredData.filter((item) => item.ingresos?.tarjeta?.virtual > 0),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Transfer Data",
    filteredData.filter((item) => item.ingresos?.tarjeta?.transferencias > 0),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]
  );

  // Crear hoja Excel
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard General");

  // Descargar archivo Excel
  XLSX.writeFile(workbook, `Dashboard_General_${today}.xlsx`);
};