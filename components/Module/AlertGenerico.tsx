// CancelAlert.tsx

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription
} from '../ui/alert-dialog';

interface CancelAlertProps {
    isCancelDialogOpen: boolean;
    setIsCancelDialogOpen: (open: boolean) => void;
    confirmInvoice: () => void;
    Title: string;
    Description: string;
}

function AlertGenerico({ isCancelDialogOpen, setIsCancelDialogOpen, confirmInvoice, Title = "¿Está seguro de que desea proceder?", Description="Esta acción no se puede deshacer." }: CancelAlertProps) {
    return (
        <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{Title}</AlertDialogTitle>
                    <AlertDialogDescription>
                       {Description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmInvoice}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default AlertGenerico;
