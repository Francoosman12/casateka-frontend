import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo-casateka.png";

export const generatePDFReport = async (data, startDate, endDate) => {
    if (!startDate || !endDate) {
        alert("Error: Las fechas de inicio y fin no están definidas.");
        return;
    }

    const pdf = new jsPDF();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);
    const formattedTime = currentDate.toTimeString().slice(0, 5).replace(":", "-");
    const fileName = `Reporte_Movimientos_${formattedDate}_${formattedTime}.pdf`;

  
    let pageNumber = 1;
  

    const formattedStartDate = new Date(startDate);
formattedStartDate.setDate(formattedStartDate.getDate() + 1); // ✅ Ajuste para corregir el día perdido

const formattedEndDate = new Date(endDate);
formattedEndDate.setDate(formattedEndDate.getDate() + 1); // ✅ Ajuste para corregir el día perdido


 

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

    const totalGeneral = totalEfectivoMXN + totalEfectivoUSD + totalEfectivoEUR + totalTarjetaCreditoDebito + totalTarjetaVirtual + totalTransferencias;

    // 🔹 Establecer el encabezado del reporte
    // 🔹 Agregar encabezado con título, descripción y periodo
pdf.setFontSize(10);
pdf.setTextColor(40, 40, 40);
pdf.text("Operadora Kapen S.A de C.V.", 10, 10);
pdf.setFontSize(14);
pdf.text("Reporte General de Ingresos de Hotel Casa Teka", 10, 20);
pdf.setFontSize(12);
pdf.text(`Periodo del ${formattedStartDate.toLocaleDateString("es-MX")} al ${formattedEndDate.toLocaleDateString("es-MX")}.`, 10, 30);

// 🔹 Línea de separación debajo del encabezado
pdf.setDrawColor(0, 0, 0);
pdf.setLineWidth(0.5);
pdf.line(10, 35, 200, 35);

pdf.addImage(logo, "PNG", 150, 10, 30, 20); // ✅ Importación directa // Posición y tamaño del logo

    if (!data || data.length === 0) {
        pdf.text("No hay datos disponibles para el reporte.", 10, 25);
        pdf.save(fileName);
        return;
    }


    // 🔹 Agregar la tabla de totales antes del desglose detallado
    let startY = 50; // ✅ Definir la posición inicial para las tablas

    // 🔹 Mini tabla de Efectivo
    autoTable(pdf, {
        head: [["Descripción", "Total"]],
        body: [
            ["Efectivo MXN", formatNumber(totalEfectivoMXN)],
            ["Efectivo USD", formatNumber(totalEfectivoUSD)],
            ["Efectivo EUR", formatNumber(totalEfectivoEUR)]
        ],
        startY: startY,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] } // 🔹 Fondo negro y texto blanco
    });
    
    startY = pdf.lastAutoTable.finalY + 10; // ✅ Espaciado entre tablas
    
    // 🔹 Mini tabla de Tarjetas
    autoTable(pdf, {
        head: [["Descripción", "Total"]],
        body: [
            ["Tarjeta Débito/Crédito", formatNumber(totalTarjetaCreditoDebito)],
            ["Tarjetas Virtuales", formatNumber(totalTarjetaVirtual)],
            ["Transferencias", formatNumber(totalTransferencias)]
        ],
        startY: startY,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] } 
    });
    
    startY = pdf.lastAutoTable.finalY + 10;
    
    // 🔹 Mini tabla de Conceptos
    autoTable(pdf, {
        head: [["Descripción", "Total"]],
        body: [
            ["Cobro de Estancia", formatNumber(totalEstancia)],
            ["Amenidades", formatNumber(totalAmenidades)]
        ],
        startY: startY,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] } 
    });
    
    startY = pdf.lastAutoTable.finalY + 10;
    
    // 🔹 Mini tabla de OTAs
    autoTable(pdf, {
        head: [["Descripción", "Total"]],
        body: [
            ["Booking", formatNumber(totalBooking)],
            ["Expedia", formatNumber(totalExpedia)],
            ["Directa", formatNumber(totalDirecta)]
        ],
        startY: startY,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] } 
    });
    
    startY = pdf.lastAutoTable.finalY + 10;
    
    // 🔹 Mini tabla de Totales Generales
    autoTable(pdf, {
        head: [["Descripción", "Total"]],
        body: [
            ["Total General", formatNumber(totalGeneral)],
            ["Tarifa Promedio por Noche", formatNumber(tarifaPromedioPorNoche)],
            ["Total Noches Vendidas", totalNochesVendidas]
        ],
        startY: startY,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] } 
    });

    // ✅ Agregar número de página
    pdf.setFontSize(10);
    pdf.text(`${pageNumber}`, 185, 290);
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

    startY=15;
    
    Object.keys(groupedBySubtipo).forEach((subtipo) => {
        // ✅ Imprimir número de página ANTES de verificar si se necesita una nueva página
        pageNumber = pdf.getNumberOfPages();
        pdf.setFontSize(10);
        pdf.text(`${pageNumber}`, 185, 290);
    
        // ✅ Si `startY` supera el límite, agregar nueva página y actualizar número
        if (startY > 250) {
            pdf.addPage();
            pageNumber++; // ✅ Incrementar página correctamente
            startY = 10; // ✅ Reiniciar margen en nueva página
    
            // ✅ Asegurar que la numeración aparece en TODAS las páginas después de la nueva página
            pdf.setFontSize(10);
            pdf.text(`${pageNumber}`, 185, 290);
        }
    
        pdf.setFontSize(12);
        pdf.text(subtipo.toUpperCase(), 10, startY);
        pdf.setLineWidth(0.2);
        pdf.line(10, startY + 2, 200, startY + 2);
        startY += 6;
    
        Object.keys(groupedBySubtipo[subtipo]).forEach((concepto) => {
            startY += 5;
            pdf.setFontSize(11);
            pdf.text(`${concepto}`, 12, startY);
            startY += 5;
    
            Object.keys(groupedBySubtipo[subtipo][concepto]).forEach((ota) => {
                startY += 4;
                pdf.setFontSize(10);
                pdf.text(`${ota}`, 12, startY);
                startY += 3;
    
                const otaData = groupedBySubtipo[subtipo][concepto][ota];
                const subtotal = otaData.reduce((sum, item) => sum + (parseFloat(item.ingreso?.montoTotal) || 0), 0);
    
                const { formattedRows, rowStyles } = formatTableData(otaData);

                formattedRows.push(["","","","","","","","","Subtotal:", formatNumber(subtotal)]);

                autoTable(pdf, {
                    head: [["No.", "Fecha Pago", "Nombre", "Habitación", "Tipo Hab.", "Check-In", "Check-Out", "Autorización", "Monto Aut.", "Importe Total"]],
                    body: formattedRows,
                    startY: startY,
                    theme: "grid",
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
                    bodyStyles: rowStyles,
                    alternateRowStyles: { fillColor: [240, 240, 240] } // ✅ Alternar filas como en Bootstrap
                });
    
                startY = pdf.lastAutoTable.finalY + 6;
    
                // ✅ Si `startY` supera el límite, asegurar nueva página con numeración correcta
                if (startY > 240) {
                    pdf.addPage();
                    pageNumber++; // ✅ Incrementar página en cada nueva hoja
                    startY = 10; // ✅ Reiniciar margen en nueva página
    
                    // ✅ Agregar número de página inmediatamente después de la nueva página
                    pdf.setFontSize(10);
                    pdf.text(` ${pageNumber}`, 185, 290);
                }
            });
        });
    });

    pdf.save(fileName);
};

const formatTableData = (items) => {
    let formattedRows = [];
    let rowStyles = [];

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
                    authIndex === 0 ? formatNumber(item.ingreso?.montoTotal) : "" // ✅ Importe total solo en la primera fila
                ]);

                // ✅ Definir color de fondo intercalado (gris claro o blanco)
                rowStyles.push({ fillColor: index % 2 === 0 ? [240, 240, 240] : [255, 255, 255] });
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
                formatNumber(item.ingreso?.montoTotal) // ✅ Formato correcto del importe total
            ]);

            // ✅ Definir color de fondo intercalado (gris claro o blanco)
            rowStyles.push({ fillColor: index % 2 === 0 ? [240, 240, 240] : [255, 255, 255] });
        }
    });

    return { formattedRows, rowStyles };
};

const formatNumber = (number) => {
    return `$` + new Intl.NumberFormat("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(number.toString().replace(/,/g, "").replace(/\./g, ".")) || 0);
  };