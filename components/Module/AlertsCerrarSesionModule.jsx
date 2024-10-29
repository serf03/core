import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
function AlertsCerrarSesion(props) {

    const [isOpen, setIsOpen] = useState(null);

    useEffect(() => {

        setIsOpen(props.isLogoutDialogOpen);
    }, [props.isLogoutDialogOpen]); 

    return (
        <AlertDialog open={isOpen} onOpenChange={props.setIsLogoutDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro de que desea cerrar sesión?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción cerrará su sesión actual. Tendrá que volver a iniciar sesión para acceder a su cuenta.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsOpen(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={props.handleLogout}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>);
}
export default AlertsCerrarSesion;