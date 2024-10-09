// Importación de componentes de UI
import { Client, Product } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';



// Define las propiedades del componente
interface DeleteAlertDialogProps {
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (isOpen: boolean) => void;
    itemToDelete: { id: string; type: 'client' | 'product' } | null;
    setItemToDelete: (item: null) => void;
    setClients: (clients: (prevClients: Client[]) => Client[]) => void; // Cambia aquí
    setProducts: (products: (prevProducts: Product[]) => Product[]) => void; // Cambia aquí
}

function DeleteAlertDialog({
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    itemToDelete,
    setItemToDelete,
    setClients,
    setProducts,
}: DeleteAlertDialogProps) {
    const handleDelete = () => {
        if (itemToDelete) {
            if (itemToDelete.type === 'client') {
                setClients(prevClients => prevClients.filter(client => client.id !== itemToDelete.id));
            } else {
                setProducts(prevProducts => prevProducts.filter(product => product.id !== itemToDelete.id));
            }

            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
            toast.success(`${itemToDelete.type === 'client' ? 'Cliente' : 'Producto'} eliminado exitosamente`);
        }
    };

    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Está seguro de que desea eliminar este {itemToDelete?.type === 'client' ? 'cliente' : 'producto'}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. El {itemToDelete?.type === 'client' ? 'cliente' : 'producto'} será eliminado permanentemente.
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
