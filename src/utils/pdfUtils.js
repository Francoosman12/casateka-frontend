import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logocasateka.png";

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


 

 // =================== INICIA BLOQUE DE CÓDIGO CORREGIDO ===================

// Helper para convertir y limpiar el monto de forma segura
const parseMonto = (monto) => {
    const montoSinComas = String(monto || '0').replace(/,/g, '');
    return parseFloat(montoSinComas) || 0;
};

// 🔹 Calcular totales antes de construir el PDF (VERSIÓN CORREGIDA)
const totalEfectivoMXN = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Pesos" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

const totalEfectivoUSD = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Dólares" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

const totalEfectivoEUR = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Efectivo" && item.ingreso?.subtipo === "Euros" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

// 🔹 Calcular totales de tarjetas antes de construir el PDF
const totalTarjetaCreditoDebito = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Tarjeta" && item.ingreso?.subtipo === "Débito/Crédito" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

const totalTarjetaVirtual = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Tarjeta" && item.ingreso?.subtipo === "Virtual" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

const totalTransferencias = data.reduce((total, item) =>
    total + (item.ingreso?.tipo === "Tarjeta" && item.ingreso?.subtipo === "Transferencias" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

// 🔹 Calcular totales de conceptos antes de construir el PDF
const totalEstancia = data.reduce((total, item) =>
    total + (item.concepto === "Cobro de estancia" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

const totalAmenidades = data.reduce((total, item) =>
    total + (item.concepto === "Amenidades" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

// 🔹 Calcular totales por OTA antes de construir el PDF
const totalBooking = data.reduce((total, item) =>
    total + (item.ota === "Booking" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

const totalExpedia = data.reduce((total, item) =>
    total + (item.ota === "Expedia" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

const totalDirecta = data.reduce((total, item) =>
    total + (item.ota === "Directa" ? parseMonto(item.ingreso?.montoTotal) : 0), 0);

// 🔹 Calcular total de noches vendidas (este cálculo no necesita cambios)
const totalNochesVendidas = data.reduce((total, item) =>
    total + (item.concepto === "Cobro de estancia" ? item.noches || 0 : 0), 0);

// 🔹 Calcular tarifa promedio por noche (se corregirá automáticamente al tener `totalEstancia` correcto)
const tarifaPromedioPorNoche = totalNochesVendidas > 0 ? totalEstancia / totalNochesVendidas : 0;

// 🔹 Calcular total general (se corregirá automáticamente al tener los otros totales correctos)
const totalGeneral = totalEfectivoMXN + totalEfectivoUSD + totalEfectivoEUR + totalTarjetaCreditoDebito + totalTarjetaVirtual + totalTransferencias;


// =================== FINALIZA BLOQUE DE CÓDIGO CORREGIDO ===================

//Separar las fechas por dias, mes y año
const options = { year: "numeric", month: "long" };
const startDay = formattedStartDate.getDate(); // ✅ Extraer solo el día de inicio
const endDay = formattedEndDate.getDate(); // ✅ Extraer solo el día de fin
const monthYear = formattedEndDate.toLocaleDateString("es-MX", options); // ✅ Obtener mes y año



    // 🔹 Portada del reporte
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    const logoWidth = 38;
    const logoHeight = logoWidth * (2200 / 1700); // mantiene la proporción real del logo
    const logoY = 55;
    pdf.addImage(logo, "PNG", centerX - logoWidth / 2, logoY, logoWidth, logoHeight);

    let coverY = logoY + logoHeight + 18;

    pdf.setFontSize(13);
    pdf.setTextColor(90, 90, 90);
    pdf.text("Operadora Kapen S.A de C.V.", centerX, coverY, { align: "center" });

    coverY += 12;
    pdf.setFontSize(18);
    pdf.setTextColor(20, 20, 20);
    pdf.text("Reporte General de Ingresos de Hotel Casa Teka", centerX, coverY, {
        align: "center",
        maxWidth: 160,
    });

    coverY += 18;
    pdf.setDrawColor(63, 92, 74); // verde de marca
    pdf.setLineWidth(0.6);
    pdf.line(centerX - 25, coverY, centerX + 25, coverY);

    coverY += 12;
    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Periodo de ${startDay} al ${endDay} de ${monthYear}`, centerX, coverY, {
        align: "center",
    });

    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
        `Generado el ${currentDate.toLocaleDateString("es-MX")}`,
        centerX,
        pageHeight - 15,
        { align: "center" }
    );

    if (!data || data.length === 0) {
        pdf.addPage();
        pdf.setFontSize(12);
        pdf.setTextColor(40, 40, 40);
        pdf.text("No hay datos disponibles para el reporte.", 10, 20);
        pdf.save(fileName);
        return;
    }

    pdf.addPage();
    pageNumber = 2; // la portada (página 1) no lleva numeración

    // 🔹 Agregar la tabla de totales antes del desglose detallado
    let startY = 20; // ✅ Definir la posición inicial para las tablas

    // 🔹 Mini tabla de Efectivo
    autoTable(pdf, {
        head: [["Efectivo", "Total"]],
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
        head: [["Banco", "Total"]],
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
        head: [["Concepto", "Total"]],
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
        head: [["OTA", "Total"]],
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
        head: [["Totales", "Total"]],
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
                const subtotal = otaData.reduce((sum, item) => {
    // Convierte el monto a string, elimina las comas, y luego lo convierte a número
    const montoSinComas = String(item.ingreso?.montoTotal || '0').replace(/,/g, '');
    return sum + (parseFloat(montoSinComas) || 0);
}, 0);
    
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
                    //pdf.setFontSize(10);
                    //pdf.text(` ${pageNumber}`, 185, 290);
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