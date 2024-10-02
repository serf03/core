// Importación de componentes de UI
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

function CancelAlert(props) {
    return (
        <AlertDialog open={props.isCancelDialogOpen} onOpenChange={props.setIsCancelDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro de que desea cancelar esta factura?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. La factura se marcará como cancelada y no se podrá procesar el pago.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={props.confirmCancelInvoice}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default CancelAlert;
