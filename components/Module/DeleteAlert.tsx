// Importación de componentes de UI
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

function DeleteAlertDialog(props) {
    const handleDelete = () => {
        if (props.itemToDelete) {
            if (props.itemToDelete.type === 'client') {
                props.setClients(prevClients => prevClients.filter(client => client.id !== props.itemToDelete.id));
            } else {
                props.setProducts(prevProducts => prevProducts.filter(product => product.id !== props.itemToDelete.id));
            }

            props.setIsDeleteDialogOpen(false);
            props.setItemToDelete(null);
            toast.success(`${props.itemToDelete.type === 'client' ? 'Cliente' : 'Producto'} eliminado exitosamente`);
        }
    };

    return (
        <AlertDialog open={props.isDeleteDialogOpen} onOpenChange={props.setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro de que desea eliminar este {props.itemToDelete?.type === 'client' ? 'cliente' : 'producto'}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. El {props.itemToDelete?.type === 'client' ? 'cliente' : 'producto'} será eliminado permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DeleteAlertDialog;
