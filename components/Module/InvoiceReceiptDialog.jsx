import { Printer } from 'lucide-react';
import { QRCodeCanvas } from "qrcode.react"; // Importa el generador de QR
import { useEffect, useState } from 'react';
import { getInvoiceWithDetails } from "../../lib/firebaseServices";
import PrintInvoiceKiosk from '../Screens/PrintInvoiceVirtual'; // Importa el nuevo componente
import { Button } from "../ui/button";

export default function InvoiceReceiptDialog({ invoice }) {
    const [showPrint, setShowPrint] = useState(false);
    const [Invoice, setInvoice] = useState(null); // Cambiado a null por defecto

    const handlePrint = () => {
        setShowPrint(true); // Muestra el componente de impresión
    };

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const invoiceData = await getInvoiceWithDetails(invoice.id);
                setInvoice(invoiceData);
            } catch (error) {
                console.error('Error fetching invoice:', error);
            }
        };
        fetchInvoice();
    }, [invoice.id]);

    if (!Invoice) {
        return <div>Cargando factura...</div>; // Mostrar mensaje de carga mientras se obtienen los datos
    }

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
                {invoice.items.map((item, index) => {
                    const product = Invoice.products?.find(product => product.id === item.productId);
                    const garmentType = Invoice.garmentTypes?.find(garment => garment.name === item.garmentTypeId); // Ahora busca por nombre

                    return (
                        <div key={index} className="border-b border-gray-300 py-2 mb-2">
                            <div className="flex justify-between font-bold">
                                <span>{product?.name || "Producto no disponible"}</span>
                                <span>${item.price}</span>
                            </div>
                            <div className="text-xs ml-4">
                                <p>Tipo de Prenda: {garmentType?.name || "Tipo no disponible"}</p>
                                <p>Cantidad: {item.quantity}</p>
                                <p>Precio: ${item.price}</p>
                            </div>
                        </div>
                    );
                })}

                <div className="mb-4">
                    <div className="flex justify-between font-bold mt-2">
                        <span>Total</span>
                        <span>${invoice.total}</span>
                    </div>
                </div>

                <div className="text-center text-xs">
                    <p>Cliente: {Invoice?.client?.name || "Cliente no disponible"}</p>

                    {/* Código QR centrado */}
                    <div className="flex justify-center my-4">
                        <QRCodeCanvas
                            value={invoice.id} // Genera el QR con el ID de la factura
                            size={150} // Aumenta el tamaño del QR a 150px
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>

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
