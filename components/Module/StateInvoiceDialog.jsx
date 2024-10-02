import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function StateFacturaDialog(props) {
    const handleSubmit = (e) => {
        e.preventDefault();

        if (props.invoiceToChangeStatus) {
            const newStatus = e.currentTarget.elements.namedItem('status').value;
            props.handleChangeInvoiceStatus(props.invoiceToChangeStatus, newStatus);
        }
    };

    return (
        <Dialog open={props.isChangeInvoiceStatusDialogOpen} onOpenChange={props.setIsChangeInvoiceStatusDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cambiar Estado de Factura</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Nuevo Estado
                            </Label>
                            <Select name="status" defaultValue={props.invoiceToChangeStatus?.status}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccione el nuevo estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                                    <SelectItem value="Lavando">Lavando</SelectItem>
                                    <SelectItem value="Planchando">Planchando</SelectItem>
                                    <SelectItem value="Completada">Completada</SelectItem>
                                    <SelectItem value="Entregada">Entregada</SelectItem>
                                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Cambiar Estado</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default StateFacturaDialog;
