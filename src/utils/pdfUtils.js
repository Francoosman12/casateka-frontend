import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFReport = async (data) => {
    const pdf = new jsPDF();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);
    const formattedTime = currentDate.toTimeString().slice(0, 5).replace(":", "-");
    const fileName = `Reporte_Movimientos_${formattedDate}_${formattedTime}.pdf`;

    let pageNumber = 1;
    let startY = 30;

    // 🔹 Calcular totales antes de construir el PDF
    const totalEfectivoMXN = data.reduce((total, item) =>
        total + (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Pesos" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

    const totalEfectivoUSD = data.reduce((total, item) =>
        total + (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Dólares" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

    const totalEfectivoEUR = data.reduce((total, item) =>
        total + (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Euros" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

// 🔹 Calcular totales de tarjetas antes de construir el PDF
const totalTarjetaCreditoDebito = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Tarjeta" && item.ingreso?.subtipo === "Débito/Crédito" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

const totalTarjetaVirtual = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Tarjeta" && item.ingreso?.subtipo === "Virtual" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

const totalTransferencias = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Tarjeta" && item.ingreso?.subtipo === "Transferencias" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

// 🔹 Calcular totales de conceptos antes de construir el PDF
const totalEstancia = data.reduce((total, item) =>
    total + (item.concepto === "Cobro de estancia" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

const totalAmenidades = data.reduce((total, item) =>
    total + (item.concepto === "Amenidades" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

// 🔹 Calcular totales por OTA antes de construir el PDF
const totalBooking = data.reduce((total, item) =>
    total + (item.ota === "Booking" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

const totalExpedia = data.reduce((total, item) =>
    total + (item.ota === "Expedia" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

const totalDirecta = data.reduce((total, item) =>
    total + (item.ota === "Directa" ? parseFloat(item.ingreso?.montoTotal) || 0 : 0), 0);

// 🔹 Calcular total de noches vendidas
const totalNochesVendidas = data.reduce((total, item) =>
    total + (item.concepto === "Cobro de estancia" ? item.noches || 0 : 0), 0);

// 🔹 Calcular tarifa promedio por noche
const tarifaPromedioPorNoche = totalNochesVendidas > 0 ? totalEstancia / totalNochesVendidas : 0;

    const totalGeneral = totalEfectivoMXN + totalEfectivoUSD + totalEfectivoEUR;

    // 🔹 Establecer el encabezado del reporte
    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Reporte de Movimientos", 10, 10);
    pdf.setFontSize(10);
    pdf.text(`Fecha de generación: ${formattedDate} ${formattedTime.replace("-", ":")}`, 10, 15);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(10, 18, 200, 18);

    if (!data || data.length === 0) {
        pdf.text("No hay datos disponibles para el reporte.", 10, 25);
        pdf.save(fileName);
        return;
    }

    // 🔹 Agregar la tabla de totales antes del desglose detallado
    autoTable(pdf, {
        head: [["Descripción", "Total"]],
        body: [
            // 🔹 Totales de Efectivo
            ["Efectivo MXN", formatNumber(totalEfectivoMXN)],
            ["Efectivo USD", formatNumber(totalEfectivoUSD)],
            ["Efectivo EUR", formatNumber(totalEfectivoEUR)],
    
            // 🔹 Totales de Tarjetas y Transferencias
            ["Tarjeta Débito/Crédito", formatNumber(totalTarjetaCreditoDebito)],
            ["Tarjetas Virtuales", formatNumber(totalTarjetaVirtual)],
            ["Transferencias", formatNumber(totalTransferencias)],
    
            // 🔹 Totales por Concepto
            ["Cobro de Estancia", formatNumber(totalEstancia)],
            ["Amenidades", formatNumber(totalAmenidades)],
    
            // 🔹 Totales por OTAs
            ["Booking", formatNumber(totalBooking)],
            ["Expedia", formatNumber(totalExpedia)],
            ["Directa", formatNumber(totalDirecta)],
    
            // 🔹 Totales Generales
            ["Total General", formatNumber(totalGeneral)],
            ["Tarifa Promedio por Noche", formatNumber(tarifaPromedioPorNoche)],
            ["Total Noches Vendidas", totalNochesVendidas],
        ],
        startY: 30,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            1: { halign: "right", fontStyle: "bold" }
        }
    });

    // ✅ Agregar número de página
    pdf.setFontSize(10);
    pdf.text(`Página ${pageNumber}`, 185, 290);
    pdf.addPage();
    pageNumber++;
    startY = 30;  

    // 🔹 Agrupar por Subtipo → Concepto → OTA
    const groupedBySubtipo = data.reduce((acc, item) => {
        const subtipoKey = item.ingreso?.subtipo || "Sin Subtipo";
        if (!acc[subtipoKey]) acc[subtipoKey] = {};

        const conceptoKey = item.concepto || "Sin Concepto";
        if (!acc[subtipoKey][conceptoKey]) acc[subtipoKey][conceptoKey] = {};

        const otaKey = item.ota || "Sin OTA";
        if (!acc[subtipoKey][conceptoKey][otaKey]) acc[subtipoKey][conceptoKey][otaKey] = [];

        acc[subtipoKey][conceptoKey][otaKey].push(item);
        return acc;
    }, {});

    Object.keys(groupedBySubtipo).forEach((subtipo) => {
        startY += 6;
        pdf.setFontSize(12);
        pdf.text(subtipo.toUpperCase(), 10, startY);
        pdf.setLineWidth(0.2);
        pdf.line(10, startY + 2, 200, startY + 2);
        startY += 6;

        Object.keys(groupedBySubtipo[subtipo]).forEach((concepto) => {
            startY += 5;
            pdf.setFontSize(11);
            pdf.setTextColor(50, 50, 50);
            pdf.text(`${concepto}`, 12, startY);
            pdf.setTextColor(0, 0, 0);
            startY += 5;

            Object.keys(groupedBySubtipo[subtipo][concepto]).forEach((ota) => {
                startY += 4;
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`${ota}`, 12, startY);
                pdf.setTextColor(0, 0, 0);
                startY += 3;

                const otaData = groupedBySubtipo[subtipo][concepto][ota];
                const subtotal = otaData.reduce((sum, item) => sum + (parseFloat(item.ingreso?.montoTotal) || 0), 0);

                autoTable(pdf, {
                    head: [["No.", "Fecha Pago", "Nombre", "Habitación", "Tipo Hab.", "Check-In", "Check-Out", "Autorización", "Monto Aut.", "Importe Total"]],
                    body: [...formatTableData(otaData), ["", "", "", "", "", "", "", "Subtotal:", "", formatNumber(subtotal)]],
                    startY: startY,
                    theme: "grid",
                    styles: { fontSize: 8, cellPadding: 2 },
                });

                startY = pdf.lastAutoTable.finalY + 6;
            });
        });
    });

    pdf.save(fileName);
};

const formatTableData = (items) => {
  let formattedRows = [];

  items.forEach((item, index) => {
    if (item.ingreso?.autorizaciones && item.ingreso.autorizaciones.length > 0) {
      item.ingreso.autorizaciones.forEach((auth, authIndex) => {
        formattedRows.push([
          authIndex === 0 ? index + 1 : "", // ✅ Solo en la primera fila
          authIndex === 0 ? new Date(item.fechaPago).toLocaleDateString() : "",
          authIndex === 0 ? item.nombre : "",
          authIndex === 0 ? item.habitacion?.numero || "N/A" : "",
          authIndex === 0 ? item.habitacion?.tipo || "N/A" : "",
          authIndex === 0 ? new Date(item.checkIn).toLocaleDateString() : "",
          authIndex === 0 ? new Date(item.checkOut).toLocaleDateString() : "",
          auth.codigo || "N/A", // ✅ Cada autorización en fila separada
          auth.monto, // ✅ Se mantiene el formato correcto del monto por autorización
          authIndex === 0 ? formatNumber(item.ingreso?.montoTotal) : "", // ✅ Importe total solo en la primera fila
        ]);
      });
    } else {
      formattedRows.push([
        index + 1,
        new Date(item.fechaPago).toLocaleDateString(),
        item.nombre,
        item.habitacion?.numero || "N/A",
        item.habitacion?.tipo || "N/A",
        new Date(item.checkIn).toLocaleDateString(),
        new Date(item.checkOut).toLocaleDateString(),
        "N/A",
        "$0.00", // ✅ Mantener sin cambios
        formatNumber(item.ingreso?.montoTotal), // ✅ Formato correcto del importe total
      ]);
    }
  });

  return formattedRows;
};

const formatNumber = (number) => {
    return `$` + new Intl.NumberFormat("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(number.toString().replace(/,/g, "").replace(/\./g, ".")) || 0);
  };