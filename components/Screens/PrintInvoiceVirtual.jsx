import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createRoot } from 'react-dom/client';
import ReactDOMServer from 'react-dom/server';
const PrintInvoiceKiosk = ({ invoice, onClose, formattedPickupDate }) => {
    useEffect(() => {


        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            // Create a temporary div to render the QR code
            const tempDiv = document.createElement('div');
            const root = createRoot(tempDiv);
            const qrCodeSvg = ReactDOMServer.renderToStaticMarkup(
                <QRCodeSVG
                    value={invoice.id}
                    size={64}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                />
            );

            const isPaid = invoice.amountPaid >= invoice.total;
            const pendingBalance = Math.max(0, invoice.total - invoice.amountPaid);

            const content = `
                <html>
                    <head>
                        <title>Imprimir Factura</title>
                        <style>
                            @page { size: 72mm 297mm; margin: 0; }
                            body { font-family: monospace; font-size: 10px; margin: 0; padding: 4px; width: 72mm; }
                            .receipt { width: 100%; }
                            .text-center { text-align: center; }
                            .text-xs { font-size: 8px; }
                            .font-bold { font-weight: bold; }
                            .mt-2 { margin-top: 4px; }
                            .mb-4 { margin-bottom: 8px; }
                            .border-t { border-top: 1px solid #ccc; }
                            .border-b { border-bottom: 1px solid #ccc; }
                            .py-2 { padding: 4px 0; }
                            .flex { display: flex; justify-content: space-between; }
                            .qr-code { display: flex; justify-content: center; margin: 8px 0; }
                            .text-red { color: red; }
                            @media print {
                                body { -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body onload="window.print(); setTimeout(() => { window.close(); }, 1000);">
                        <div class="receipt">
                            <div class="text-center mb-4">
                                <h2 class="font-bold">Factura</h2>
                                <p class="text-xs">Factura #${
                                  invoice.invoiceNumber
                                }</p>
                                          ${
                                            !isPaid
                                              ? `
                                    <p class="font-bold text-red mt-1">
                                        PAGO PARCIAL - Saldo pendiente: $${pendingBalance.toFixed(
                                          2
                                        )}
                                    </p>
                                `
                                              : ""
                                          }
                            </div>
                            <div class="border-t border-b py-2 mb-2">
                                <div class="flex">
                                    <span class="font-bold">Fecha:</span>
                                    <span>${formattedPickupDate}</span>
                                </div>
                                <div class="flex">
                                    <span class="font-bold">Estado:</span>
                                    <span>
                                        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${
                                          invoice.color
                                        };"></div>
                                    </span>
                                </div>
                                <div class="flex">
                                    <span class="font-bold">Fecha de Retiro:</span>
                                    <span>${new Date(
                                      invoice.pickupDate
                                    ).toLocaleString("es-ES", {
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    })}</span>
                                </div>
                            </div>
                            ${invoice.items
                              .map(
                                (item) => `
                                <div class="border-b py-2 mb-2">
                                    <div class="flex font-bold">
                                        <span>${item.product}</span>
                                        <span>$${(
                                          item.price * item.quantity
                                        ).toFixed(2)}</span>
                                    </div>
                                    <div class="text-xs">
                                        <p>Prenda: ${item.garmentType}</p>
                                        <p>Cant: ${
                                          item.quantity
                                        } x $${item.price.toFixed(2)}</p>
                                        <p>Descripción: ${
                                          item.description || "No disponible"
                                        }</p>
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                            <div class="text-center p-3 text-2xs">
                                <h style={{
                                    fontSize: '1rem',
                                    lineHeight: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontWeight: 'bold',
                                }}
                                class="text-2xs"
                                >
                                 Nota: ${invoice.nota || "....."}
                                </h>
                            </div>
                            <div class="mb-4">
                                <div class="flex font-bold mt-2">
                                    <span>Total</span>
                                    <span>$${invoice.total.toFixed(2)}</span>
                                </div>
                                <div class="flex mt-2">
                                    <span>Monto Pagado</span>
                                    <span>$${invoice.amountPaid.toFixed(
                                      2
                                    )}</span>
                                </div>
                                ${
                                  !isPaid
                                    ? `
                                    <div class="flex font-bold mt-2">
                                        <span>Saldo Pendiente</span>
                                        <span>$${pendingBalance.toFixed(
                                          2
                                        )}</span>
                                    </div>
                                `
                                    : ""
                                }
                            </div>
                            <div class="text-center text-xs">
                                <p class="font-bold">Cliente: ${
                                  invoice.client || "No disponible"
                                }</p>
                                <div class="qr-code">
                                    ${qrCodeSvg}
                                </div>
                                <div class="my-2 border-b"></div>
                                <p class="font-bold">¡Gracias por su preferencia!</p>
                      
                            </div>
                        </div>
                    </body>
                </html>
            `;

            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.focus();

            // Clean up
            return () => {
                root.unmount();
            };
        }

        onClose();
    }, [formattedPickupDate, invoice, onClose]);

    return null;
};

export default PrintInvoiceKiosk;

