import { Printer } from 'lucide-react';
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from 'react';
import { getInvoiceWithDetails } from "../../lib/firebaseServices";
import PrintInvoiceKiosk from '../Screens/PrintInvoiceVirtual';
import { Button } from "../ui/button";

export default function InvoiceReceiptDialog({ invoice }) {
    const [showPrint, setShowPrint] = useState(false);
    const [Invoice, setInvoice] = useState(null);

    const handlePrint = () => {
        setShowPrint(true);
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
        return <div className="text-center text-sm">Cargando factura...</div>;
    }

    const formattedPickupDate = new Date(invoice.pickupDate).toLocaleString("es-ES", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: "numeric",
        minute: "numeric",
        hour12: true
    });

    const isPaid = Invoice.amountPaid >= Invoice.total;
    const pendingBalance = Math.max(0, Invoice.total - Invoice.amountPaid);

    return (
        <>
            <div className="bg-white p-1 font-mono text-xs" >
                <div className="text-center mb-1">
                    <h2 className="text-base font-bold">Factura</h2>
                    <p className="text-xs">Factura {invoice.invoiceNumber}</p>
                </div>
                <div className="border-t border-b border-gray-300 py-0.5 mb-1">
                    <div className="flex justify-between">
                        <span className="font-bold">Fecha:</span>
                        <span>{invoice.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Estado:</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: invoice.color }}></div>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold">Retiro:</span>
                        <span>{formattedPickupDate}</span>
                    </div>
                </div>

                {Invoice.items.map((item, index) => (
                    <div key={index} className="border-b border-gray-300 py-0.5 mb-0.5">
                        <div className="flex justify-between font-bold text-xs">
                            <span>{item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="text-2xs ml-1">
                            <p>Prenda: {item.garmentType}</p>
                            <p>Cant: {item.quantity} x ${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                ))}

                <div className="text-center p-3 text-2xs">
                <h style={{
                        fontSize: '1rem',
                        lineHeight: '0.5rem',
                        marginBottom: '0.5rem',
                        fontWeight: 'bold',
                    }}
                    className="text-2xs"
                >
                    Nota: {invoice.nota || "....."}
                </h>

                </div>
                <div className="mb-1">
                    <div className="flex justify-between font-bold text-sm mt-0.5">
                        <span>Total</span>
                        <span>${invoice.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-0.5">
                        <span>Monto Pagado</span>
                        <span>${Invoice.amountPaid.toFixed(2)}</span>
                    </div>
                    {!isPaid && (
                        <div className="flex justify-between text-xs mt-0.5 font-bold">
                            <span>Saldo Pendiente</span>
                            <span>${pendingBalance.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="text-center text-2xs">
                    <p className="font-bold">Cliente: {Invoice.client || "No disponible"}</p>

                    <div className="flex justify-center my-1 print:block">
                        <QRCodeSVG
                            value={invoice.invoiceNumber}
                            size={64}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>

                    <div className="my-0.5 border-b border-gray-300"></div>
                    <p className="text-xs font-bold">¡Gracias por su preferencia!</p>
                    {!isPaid && (
                        <p className="text-xs font-bold text-red-500 mt-1">
                            PAGO PARCIAL - Saldo pendiente: ${pendingBalance.toFixed(2)}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-1 bg-gray-100 flex justify-end print:hidden">
                <Button onClick={handlePrint} variant="outline" size="sm" className="text-xs">
                    <Printer className="mr-1 h-3 w-3" />
                    Imprimir
                </Button>
            </div>

            {showPrint && <PrintInvoiceKiosk invoice={Invoice} onClose={() => setShowPrint(false)} formattedPickupDate={formattedPickupDate} />}
        </>
    );
}

