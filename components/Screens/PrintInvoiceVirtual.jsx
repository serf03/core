import { useEffect } from 'react';

const PrintInvoiceKiosk = ({ invoice, onClose }) => {
    useEffect(() => {
        // Crear una nueva ventana para la impresión
        const printWindow = window.open('', '', 'width=800,height=600');

        if (printWindow) {
            // Generar el contenido HTML para la factura
            const content = `
                <html>
                    <head>
                        <title>Imprimir Factura</title>
                        <style>
                            body { font-family: monospace; font-size: 12px; margin: 0; padding: 0; }
                            .receipt { width: 300px; margin: 0 auto; }
                            .text-center { text-align: center; }
                            .text-xs { font-size: 10px; }
                            .font-bold { font-weight: bold; }
                            .mt-2 { margin-top: 8px; }
                            .mb-4 { margin-bottom: 16px; }
                            .border-t { border-top: 1px solid #ccc; }
                            .border-b { border-bottom: 1px solid #ccc; }
                            .py-2 { padding: 8px 0; }
                            .flex { display: flex; justify-content: space-between; }
                            @media print {
                                body { -webkit-print-color-adjust: exact; }
                                .no-print { display: none; } /* Ocultar botones o elementos no deseados */
                            }
                        </style>
                    </head>
                    <body onload="window.print(); setTimeout(() => { window.close(); }, 1000);">
                        <div class="receipt">
                            <div class="text-center mb-4">
                                <h2 class="font-bold">Factura</h2>
                                <p class="text-xs">Factura #${invoice.id}</p>
                            </div>
                            <div class="border-t border-b py-2 mb-2">
                                <div class="flex">
                                    <span>Fecha:</span>
                                    <span>${invoice.date}</span>
                                </div>
                                <div class="flex">
                                    <span>Estado:</span>
                                    <span>
                                        <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${invoice.color};"></div>
                                    </span>
                                </div>
                                <div class="flex">
                                    <span>Fecha de Retiro:</span>
                                    <span>${invoice.pickupDate}</span>
                                </div>
                            </div>
                            ${invoice.items.map(item => `
                                <div class="border-b py-2 mb-2">
                                    <div class="flex font-bold">
                                        <span>${item.garmentTypeId}</span>
                                        <span>$${item.price}</span>
                                    </div>
                                    <div class="text-xs">
                                        <p>Tipo de Prenda: ${item.garmentTypeId}</p>
                                        <p>Cantidad: ${item.quantity}</p>
                                        <p>Precio: $${item.price}</p>
                                    </div>
                                </div>
                            `).join('')}
                            <div class="mb-4">
                                <div class="flex font-bold mt-2">
                                    <span>Total</span>
                                    <span>$${invoice.total}</span>
                                </div>
                            </div>
                            <div class="text-center text-xs">
                                <p>ClientId: ${invoice.clientId}</p>
                                <div class="my-2 border-b"></div>
                                <p>Gracias por su preferencia</p>
                            </div>
                        </div>
                    </body>
                </html>
            `;

            // Escribir el contenido en la nueva ventana
            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.focus();
        }

        // Cierra el componente de impresión después de imprimir
        onClose();

    }, [invoice, onClose]);

    return null; // Este componente no necesita renderizar nada visible
};

export default PrintInvoiceKiosk;
