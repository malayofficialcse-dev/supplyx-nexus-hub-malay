import PDFDocument from "pdfkit";
export class PDFService {
    static generatePurchaseOrderPDF(order) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 40, size: "A4" });
            const buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));
            // Header Branding
            doc.rect(40, 40, 515, 60).fill("#1e293b");
            doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold").text("SUPPLYX SCM", 55, 52);
            doc.fontSize(10).font("Helvetica").text("Enterprise Supply Chain & Procurement Suite", 55, 78);
            doc.fontSize(14).font("Helvetica-Bold").text("PURCHASE ORDER", 380, 52, { align: "right" });
            doc.fontSize(10).font("Helvetica").text(order.orderId || order.id || "PO-XXXX", 380, 75, { align: "right" });
            doc.moveDown(3);
            // Order & Supplier Info Box
            const startY = 120;
            doc.fillColor("#334155");
            // Left column: Supplier Info
            doc.fontSize(10).font("Helvetica-Bold").text("VENDOR / SUPPLIER:", 45, startY);
            doc.fontSize(11).font("Helvetica-Bold").fillColor("#0f172a").text(String(order.supplier || "N/A"), 45, startY + 16);
            doc.fontSize(9).font("Helvetica").fillColor("#64748b").text(`Status: ${order.status || "Open"}`, 45, startY + 32);
            doc.text(`Description: ${order.description || "Procurement Order"}`, 45, startY + 46);
            // Right column: PO Details
            doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155").text("PO DETAILS:", 350, startY);
            doc.fontSize(9).font("Helvetica").fillColor("#475569");
            doc.text(`PO Number: ${order.orderId || order.id}`, 350, startY + 16);
            doc.text(`Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 350, startY + 30);
            doc.text(`Delivery Date: ${order.deliveryDate || "TBD"}`, 350, startY + 44);
            doc.text(`Received Qty: ${order.receivedQuantity || 0}`, 350, startY + 58);
            // Items Table Header
            const tableTop = 210;
            doc.rect(40, tableTop, 515, 24).fill("#f1f5f9");
            doc.fillColor("#1e293b").fontSize(9).font("Helvetica-Bold");
            doc.text("#", 50, tableTop + 7);
            doc.text("Item / Description", 80, tableTop + 7);
            doc.text("Qty", 320, tableTop + 7, { width: 40, align: "right" });
            doc.text("Unit Price", 380, tableTop + 7, { width: 70, align: "right" });
            doc.text("Total", 470, tableTop + 7, { width: 75, align: "right" });
            // Items Table Rows
            let currentY = tableTop + 28;
            const items = Array.isArray(order.items) ? order.items : [];
            if (items.length === 0) {
                doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("Standard procurement line item", 80, currentY);
                doc.text("1", 320, currentY, { width: 40, align: "right" });
                doc.text(`$${Number(order.amount || 0).toFixed(2)}`, 380, currentY, { width: 70, align: "right" });
                doc.text(`$${Number(order.amount || 0).toFixed(2)}`, 470, currentY, { width: 75, align: "right" });
                currentY += 20;
            }
            else {
                items.forEach((item, idx) => {
                    const qty = Number(item.quantity || item.qty || 1);
                    const price = Number(item.price || item.unitPrice || (item.amount ? item.amount / qty : order.amount / items.length));
                    const total = Number(item.amount || qty * price);
                    doc.fillColor("#334155").fontSize(9).font("Helvetica");
                    doc.text(String(idx + 1), 50, currentY);
                    doc.text(String(item.item || item.name || item.description || `Item #${idx + 1}`), 80, currentY, { width: 230 });
                    doc.text(String(qty), 320, currentY, { width: 40, align: "right" });
                    doc.text(`$${price.toFixed(2)}`, 380, currentY, { width: 70, align: "right" });
                    doc.text(`$${total.toFixed(2)}`, 470, currentY, { width: 75, align: "right" });
                    // Row divider line
                    doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(40, currentY + 16).lineTo(555, currentY + 16).stroke();
                    currentY += 22;
                });
            }
            // Summary Section
            currentY += 15;
            doc.rect(340, currentY, 215, 60).fill("#f8fafc");
            doc.fillColor("#475569").fontSize(9).font("Helvetica");
            doc.text("Subtotal:", 355, currentY + 10);
            doc.text(`$${Number(order.amount || 0).toFixed(2)}`, 450, currentY + 10, { width: 95, align: "right" });
            doc.text("Tax / Duties (0%):", 355, currentY + 24);
            doc.text("$0.00", 450, currentY + 24, { width: 95, align: "right" });
            doc.fillColor("#0f172a").fontSize(11).font("Helvetica-Bold");
            doc.text("Total Amount:", 355, currentY + 40);
            doc.text(`$${Number(order.amount || 0).toFixed(2)}`, 450, currentY + 40, { width: 95, align: "right" });
            // Terms & Authorization
            const footerY = 680;
            doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, footerY).lineTo(555, footerY).stroke();
            doc.fillColor("#64748b").fontSize(8).font("Helvetica");
            doc.text("TERMS & CONDITIONS: Standard NET 30 terms apply. Goods must match specification in PO lines.", 40, footerY + 10);
            doc.text("Authorized by SupplyX SCM Procurement Operations. System Generated Document.", 40, footerY + 22);
            doc.end();
        });
    }
    static generateInvoicePDF(invoice) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 40, size: "A4" });
            const buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));
            // Header Branding
            doc.rect(40, 40, 515, 60).fill("#0f766e"); // Teal header for invoices
            doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold").text("SUPPLYX SCM", 55, 52);
            doc.fontSize(10).font("Helvetica").text("Accounts Payable & Billing Division", 55, 78);
            doc.fontSize(14).font("Helvetica-Bold").text("SUPPLIER INVOICE", 360, 52, { align: "right" });
            doc.fontSize(10).font("Helvetica").text(invoice.invoiceId || invoice.id || "INV-XXXX", 360, 75, { align: "right" });
            doc.moveDown(3);
            // Invoice Details Box
            const startY = 120;
            doc.fillColor("#334155");
            // Left column: Supplier Info
            doc.fontSize(10).font("Helvetica-Bold").text("ISSUED BY (SUPPLIER):", 45, startY);
            doc.fontSize(11).font("Helvetica-Bold").fillColor("#0f172a").text(String(invoice.supplier || "N/A"), 45, startY + 16);
            doc.fontSize(9).font("Helvetica").fillColor("#64748b").text(`Status: ${invoice.status || "Pending"}`, 45, startY + 32);
            doc.text(`Payment Terms: ${invoice.paymentTerms || "NET_30"}`, 45, startY + 46);
            // Right column: Invoice Dates
            doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155").text("INVOICE SUMMARY:", 350, startY);
            doc.fontSize(9).font("Helvetica").fillColor("#475569");
            doc.text(`Invoice #: ${invoice.invoiceId || invoice.id}`, 350, startY + 16);
            doc.text(`Invoice Date: ${invoice.date || new Date().toLocaleDateString()}`, 350, startY + 30);
            doc.text(`Due Date: ${invoice.dueDate || "NET 30"}`, 350, startY + 44);
            doc.text(`Registered: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "System"}`, 350, startY + 58);
            // Table Header
            const tableTop = 210;
            doc.rect(40, tableTop, 515, 24).fill("#f1f5f9");
            doc.fillColor("#1e293b").fontSize(9).font("Helvetica-Bold");
            doc.text("#", 50, tableTop + 7);
            doc.text("Line Description / Bill Item", 80, tableTop + 7);
            doc.text("Qty", 320, tableTop + 7, { width: 40, align: "right" });
            doc.text("Unit Rate", 380, tableTop + 7, { width: 70, align: "right" });
            doc.text("Amount", 470, tableTop + 7, { width: 75, align: "right" });
            // Table Rows
            let currentY = tableTop + 28;
            const items = Array.isArray(invoice.items) ? invoice.items : [];
            if (items.length === 0) {
                doc.fillColor("#334155").fontSize(9).font("Helvetica").text("Services / Goods delivered per contract", 80, currentY);
                doc.text("1", 320, currentY, { width: 40, align: "right" });
                doc.text(`$${Number(invoice.amount || 0).toFixed(2)}`, 380, currentY, { width: 70, align: "right" });
                doc.text(`$${Number(invoice.amount || 0).toFixed(2)}`, 470, currentY, { width: 75, align: "right" });
                currentY += 20;
            }
            else {
                items.forEach((item, idx) => {
                    const qty = Number(item.quantity || item.qty || 1);
                    const rate = Number(item.price || item.unitPrice || item.rate || (item.amount ? item.amount / qty : invoice.amount / items.length));
                    const total = Number(item.amount || qty * rate);
                    doc.fillColor("#334155").fontSize(9).font("Helvetica");
                    doc.text(String(idx + 1), 50, currentY);
                    doc.text(String(item.item || item.description || item.name || `Line #${idx + 1}`), 80, currentY, { width: 230 });
                    doc.text(String(qty), 320, currentY, { width: 40, align: "right" });
                    doc.text(`$${rate.toFixed(2)}`, 380, currentY, { width: 70, align: "right" });
                    doc.text(`$${total.toFixed(2)}`, 470, currentY, { width: 75, align: "right" });
                    doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(40, currentY + 16).lineTo(555, currentY + 16).stroke();
                    currentY += 22;
                });
            }
            // Summary
            currentY += 15;
            doc.rect(340, currentY, 215, 60).fill("#f8fafc");
            doc.fillColor("#475569").fontSize(9).font("Helvetica");
            doc.text("Billed Subtotal:", 355, currentY + 10);
            doc.text(`$${Number(invoice.amount || 0).toFixed(2)}`, 450, currentY + 10, { width: 95, align: "right" });
            doc.text("Tax (Included):", 355, currentY + 24);
            doc.text("$0.00", 450, currentY + 24, { width: 95, align: "right" });
            doc.fillColor("#0f172a").fontSize(11).font("Helvetica-Bold");
            doc.text("Total Payable:", 355, currentY + 40);
            doc.text(`$${Number(invoice.amount || 0).toFixed(2)}`, 450, currentY + 40, { width: 95, align: "right" });
            // Footer
            const footerY = 680;
            doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, footerY).lineTo(555, footerY).stroke();
            doc.fillColor("#64748b").fontSize(8).font("Helvetica");
            doc.text("PAYMENT INSTRUCTIONS: Settle via Bank Wire/ACH as per vendor profile in SupplyX SCM.", 40, footerY + 10);
            doc.text("Audit Approved & Digitally Recorded in SupplyX Accounts Payable Ledger.", 40, footerY + 22);
            doc.end();
        });
    }
}
