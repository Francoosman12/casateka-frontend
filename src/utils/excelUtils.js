import * as XLSX from "xlsx";

export const exportToExcel = (filteredData) => {
  const today = new Date().toISOString().split("T")[0];
  const workbook = XLSX.utils.book_new();
  const sheetData = [];

  // 🔹 Agregar espaciadores entre tablas
  const addSpacer = () => sheetData.push([]);

  // 🔹 Función para calcular totales generales
  const sumByType = (condition) =>
    filteredData
      .filter(condition)
      .reduce((total, item) => {
        const monto = item.ingreso?.montoTotal
          ? parseFloat(item.ingreso?.montoTotal.replace(/\./g, "").replace(",", "."))
          : 0;
        return total + monto;
      }, 0);

  const totalEfectivo = sumByType((item) => item.ingreso.tipo === "Efectivo");
  const totalTarjeta = sumByType((item) => item.ingreso.tipo === "Tarjeta");
  const totalEstancia = sumByType((item) => item.concepto === "Cobro de estancia");
  const totalAmenidades = sumByType((item) => item.concepto === "Amenidades");
  const totalBooking = sumByType((item) => item.ota === "Booking");
  const totalExpedia = sumByType((item) => item.ota === "Expedia");
  const totalDirecta = sumByType((item) => item.ota === "Directa");
  const totalGeneral = totalEstancia + totalAmenidades;

  // 🔹 Formatear valores numéricos correctamente
  const formatTotal = (value) =>
    value.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // 🔹 Agregar tabla de totales generales
  const addTotals = () => {
    sheetData.push(["Concepto", "Total"]);
    sheetData.push(["Efectivo", formatTotal(totalEfectivo)]);
    sheetData.push(["Tarjeta", formatTotal(totalTarjeta)]);
    sheetData.push(["Cobro de Estancia", formatTotal(totalEstancia)]);
    sheetData.push(["Amenidades", formatTotal(totalAmenidades)]);
    sheetData.push(["Booking", formatTotal(totalBooking)]);
    sheetData.push(["Expedia", formatTotal(totalExpedia)]);
    sheetData.push(["Directa", formatTotal(totalDirecta)]);
    sheetData.push(["Total General", formatTotal(totalGeneral)]);
    addSpacer();
  };

  // 🔹 Función para agregar tablas con detalles y subtotales
  const addTable = (title, data, columns) => {
    sheetData.push([title]);
    sheetData.push(columns);
    let subtotal = 0;

    data.forEach((item) => {
      const firstRow = columns.map((col) => {
        switch (col) {
          case "Fecha de Pago": return item.fechaPago ? new Date(item.fechaPago).toLocaleDateString() : "";
          case "Nombre": return item.nombre || "N/A";
          case "Habitación": return item.habitacion?.numero || "N/A";
          case "Tipo de Habitación": return item.habitacion?.tipo || "N/A";
          case "Check-In": return item.checkIn ? new Date(item.checkIn).toLocaleDateString() : "";
          case "Check-Out": return item.checkOut ? new Date(item.checkOut).toLocaleDateString() : "";
          case "Autorización": return item.ingreso?.autorizaciones?.[0]?.codigo || "N/A";
          case "OTA": return item.ota || "Sin OTA";
          case "Importe":
            const monto = item.ingreso?.autorizaciones?.[0]?.monto
              ? parseFloat(item.ingreso?.autorizaciones?.[0]?.monto.replace(/\./g, "").replace(",", "."))
              : 0;
            subtotal += monto;
            return item.ingreso?.autorizaciones?.[0]?.monto || "0,00";
          case "Concepto": return item.concepto || "N/A";
          default: return "";
        }
      });
      sheetData.push(firstRow);

      item.ingreso?.autorizaciones?.slice(1).forEach((autorizacion) => {
        const extraRow = columns.map((col) => {
          switch (col) {
            case "Autorización": return autorizacion.codigo;
            case "Importe":
              const monto = autorizacion.monto
                ? parseFloat(autorizacion.monto.replace(/\./g, "").replace(",", "."))
                : 0;
              subtotal += monto;
              return autorizacion.monto || "0,00";
            default: return "";
          }
        });
        sheetData.push(extraRow);
      });
    });

    const subtotalRow = columns.map((col) =>
      col === "Importe" ? subtotal.toFixed(2).replace(/\./g, ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
    );
    subtotalRow[0] = "Subtotal:";
    sheetData.push(subtotalRow);
    addSpacer();
  };

  // 🔹 Agregar datos al archivo Excel
  addTotals();
  addTable("Cash Data", filteredData.filter((item) => item.ingreso.tipo === "Efectivo" && item.ingreso.subtipo === "Pesos"), ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]);
  addTable("Cash Dollar Data", filteredData.filter((item) => item.ingreso.tipo === "Efectivo" && item.ingreso.subtipo === "Dólares"), ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]);
  addTable("Cash Euro Data", filteredData.filter((item) => item.ingreso.tipo === "Efectivo" && item.ingreso.subtipo === "Euros"), ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "OTA", "Importe", "Concepto"]);
  addTable("Card Data", filteredData.filter((item) => item.ingreso.tipo === "Tarjeta" && item.ingreso.subtipo === "Débito/Crédito"), ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]);
  addTable("Virtual Card Data", filteredData.filter((item) => item.ingreso.tipo === "Tarjeta" && item.ingreso.subtipo === "Virtual"), ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]);
  addTable("Transfer Data", filteredData.filter((item) => item.ingreso.tipo === "Tarjeta" && item.ingreso.subtipo === "Transferencias"), ["Fecha de Pago", "Nombre", "Habitación", "Tipo de Habitación", "Autorización", "OTA", "Importe", "Concepto"]);

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard General");
  XLSX.writeFile(workbook, `Dashboard_General_${today}.xlsx`);
};