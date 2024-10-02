import { Printer } from 'lucide-react'; // Asumiendo que estás usando lucide-react para los íconos
import { toast } from 'react-toastify'; // Asumiendo que utilizas react-toastify para mostrar notificaciones
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import InvoicePreview from './InvoicePreview'; // Asegúrate de importar correctamente tu componente InvoicePreview

function InvoicePreviewDialog({
    isInvoicePreviewOpen,
    setIsInvoicePreviewOpen,
    selectedInvoice,
    printers,
    selectedPrinter,
    setSelectedPrinter,
}) {
    const handlePrintInvoice = () => {
        // Aquí iría la lógica para imprimir la factura
        toast.success(`Factura enviada a imprimir en ${selectedPrinter}`);
        setIsInvoicePreviewOpen(false);
    };

    return (
        <Dialog open={isInvoicePreviewOpen} onOpenChange={setIsInvoicePreviewOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Vista Previa de Factura</DialogTitle>
                </DialogHeader>
                {selectedInvoice && <InvoicePreview invoice={selectedInvoice} />}
                <DialogFooter>
                    <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccione impresora" />
                        </SelectTrigger>
                        <SelectContent>
                            {printers.map((printer) => (
                                <SelectItem key={printer.name} value={printer.name}>
                                    {printer.name} {printer.isDefault && "(Predeterminada)"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handlePrintInvoice}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir Factura
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default InvoicePreviewDialog;
