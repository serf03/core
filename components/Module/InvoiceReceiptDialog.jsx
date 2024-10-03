import { Printer } from 'lucide-react';
import { useState } from 'react';
import PrintInvoiceKiosk from '../Screens/PrintInvoiceVirtual'; // Importa el nuevo componente
import { Button } from "../ui/button";

export default function InvoiceReceiptDialog({ invoice }) {
    const [showPrint, setShowPrint] = useState(false);

    const handlePrint = () => {
        setShowPrint(true); // Muestra el componente de impresión
    };

    return (
        <>
            <div className="bg-white p-6 font-mono text-sm">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">Factura</h2>
                    <p className="text-xs">Factura {invoice.id}</p>
                </div>
                <div className="border-t border-b border-gray-300 py-2 mb-2">
                    <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{invoice.date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Estado:</span>
                        <span>
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: invoice.color }}></div>
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fecha de retiro:</span>
                        <span>{invoice.pickupDate}</span>
                    </div>
                </div>

                {/* Productos */}
                {invoice.items.map((item, index) => (
                    <div key={index} className="border-b border-gray-300 py-2 mb-2">
                        <div className="flex justify-between font-bold">
                            <span>{item.garmentTypeId}</span>
                            <span>${item.price}</span>
                        </div>
                        <div className="text-xs ml-4">
                            <p>Tipo de Prenda: {item.garmentTypeId}</p>
                            <p>Cantidad: {item.quantity}</p>
                            <p>Precio: ${item.price}</p>
                        </div>
                    </div>
                ))}

                <div className="mb-4">
                    <div className="flex justify-between font-bold mt-2">
                        <span>Total</span>
                        <span>${invoice.total}</span>
                    </div>
                </div>

                <div className="text-center text-xs">
                    <p>ClientId: {invoice.clientId}</p>
                    <div className="my-2 border-b border-gray-300"></div>
                    <p>Gracias por su preferencia</p>
                </div>
            </div>

            <div className="p-4 bg-gray-100 flex justify-end">
                <Button onClick={handlePrint} variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </div>

            {showPrint && <PrintInvoiceKiosk invoice={invoice} onClose={() => setShowPrint(false)} />} {/* Renderiza el componente de impresión */}
        </>
    );
}
