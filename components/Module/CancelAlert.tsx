// CancelAlert.tsx

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../ui/alert-dialog';

interface CancelAlertProps {
    isCancelDialogOpen: boolean;
    setIsCancelDialogOpen: (open: boolean) => void;
    confirmCancelInvoice: () => void;
}

function CancelAlert({ isCancelDialogOpen, setIsCancelDialogOpen, confirmCancelInvoice }: CancelAlertProps) {
    return (
        <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro de que desea cancelar esta factura?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. La factura se marcará como cancelada y no se podrá procesar el pago.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmCancelInvoice}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default CancelAlert;
