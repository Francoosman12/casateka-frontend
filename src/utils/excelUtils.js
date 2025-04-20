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
    let subtotal = 0; // Inicializar subtotal como valor numérico
  
    data.forEach((item) => {
      const row = columns.map((col) => {
        switch (col) {
          case "Fecha de Pago": {
            return item.fechaPago ? new Date(item.fechaPago).toLocaleDateString() : "";
          }
          case "Nombre": {
            return item.nombre || "N/A";
          }
          case "Habitación": {
            return item.habitacion?.numero || "N/A";
          }
          case "Tipo de Habitación": {
            return item.habitacion?.tipo || "N/A";
          }
          case "Check-In": {
            return item.checkIn ? new Date(item.checkIn).toLocaleDateString() : "";
          }
          case "Check-Out": {
            return item.checkOut ? new Date(item.checkOut).toLocaleDateString() : "";
          }
          case "Autorización": {
            return item.autorizacion || "N/A";
          }
          case "OTA": {
            return item.ota || "Sin OTA";
          }
          case "Importe": {
            const monto = item.ingreso?.monto || "0,00"; // Tomar el monto tal cual está
            subtotal += parseFloat(monto.replace(/\./g, "").replace(",", ".") || "0"); // Convertir el monto a numérico para sumar
            return monto; // Mostrar el monto original
          }
          case "Concepto": {
            return item.concepto || "N/A";
          }
          default: {
            return "";
          }
        }
      });
      sheetData.push(row); // Agregar fila a la tabla
    });
  
    // Mostrar el subtotal en el mismo formato que los importes
    const subtotalRow = columns.map((col) =>
      col === "Importe" ? subtotal.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
    );
    subtotalRow[0] = "Subtotal:"; // Etiqueta para subtotal
    sheetData.push(subtotalRow);
    addSpacer(); // Separar tablas
  };

  //ADD TOTALS
  
  const addTotals = () => {
    sheetData.push(["Concepto", "Total"]); // Encabezados de la tabla
  
    const totalEfectivo = filteredData
      .filter((item) => item.ingreso.tipo === "Efectivo")
      .reduce((total, item) => total + parseFloat(item.ingreso?.monto.replace(/\./g, "").replace(",", ".") || "0"), 0);
  
    const totalTarjeta = filteredData
      .filter((item) => item.ingreso.tipo === "Tarjeta")
      .reduce((total, item) => total + parseFloat(item.ingreso?.monto.replace(/\./g, "").replace(",", ".") || "0"), 0);
  
    const totalEstancia = filteredData
      .filter((item) => item.concepto === "Cobro de estancia")
      .reduce((total, item) => total + parseFloat(item.ingreso?.monto.replace(/\./g, "").replace(",", ".") || "0"), 0);
  
    const totalAmenidades = filteredData
      .filter((item) => item.concepto === "Amenidades")
      .reduce((total, item) => total + parseFloat(item.ingreso?.monto.replace(/\./g, "").replace(",", ".") || "0"), 0);
  
    const totalBooking = filteredData
      .filter((item) => item.ota === "Booking")
      .reduce((total, item) => total + parseFloat(item.ingreso?.monto.replace(/\./g, "").replace(",", ".") || "0"), 0);
  
    const totalExpedia = filteredData
      .filter((item) => item.ota === "Expedia")
      .reduce((total, item) => total + parseFloat(item.ingreso?.monto.replace(/\./g, "").replace(",", ".") || "0"), 0);
  
    const totalDirecta = filteredData
      .filter((item) => item.ota === "Directa")
      .reduce((total, item) => total + parseFloat(item.ingreso?.monto.replace(/\./g, "").replace(",", ".") || "0"), 0);
  
    const totalGeneral = totalEstancia + totalAmenidades;
  
    // Agregar filas con cada concepto y su total, en el formato deseado
    sheetData.push(["Efectivo", totalEfectivo.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")]);
    sheetData.push(["Tarjeta", totalTarjeta.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")]);
    sheetData.push(["Cobro de Estancia", totalEstancia.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")]);
    sheetData.push(["Amenidades", totalAmenidades.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")]);
    sheetData.push(["Booking", totalBooking.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")]);
    sheetData.push(["Expedia", totalExpedia.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")]);
    sheetData.push(["Directa", totalDirecta.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")]);
    sheetData.push(["Total General", totalGeneral.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")]);
  
    addSpacer(); // Agregar espaciador después de los totales
  };

  // Agregar datos de cada tabla con subtotales
  addTotals();

  addTable(
    "Cash Data",
    filteredData.filter((item) => item.ingreso.tipo === "Efectivo" && item.ingreso.subtipo === "Pesos"),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Cash Dollar Data",
    filteredData.filter((item) => item.ingreso.tipo === "Efectivo" && item.ingreso.subtipo === "Dólares"),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Cash Euro Data",
    filteredData.filter((item) => item.ingreso.tipo === "Efectivo" && item.ingreso.subtipo === "Euros"),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Card Data",
    filteredData.filter((item) => item.ingreso.tipo === "Tarjeta" && item.ingreso.subtipo === "Débito/Crédito"),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Virtual Card Data",
    filteredData.filter((item) => item.ingreso.tipo === "Tarjeta" && item.ingreso.subtipo === "Virtual"),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]
  );

  addTable(
    "Transfer Data",
    filteredData.filter((item) => item.ingreso.tipo === "Tarjeta" && item.ingreso.subtipo === "Transferencias"),
    ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]
  );

  // Crear hoja Excel
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard General");

  // Descargar archivo Excel
  XLSX.writeFile(workbook, `Dashboard_General_${today}.xlsx`);
};