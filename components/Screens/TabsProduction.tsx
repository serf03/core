// Importar componentes de UI
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// Definir la interfaz para las propiedades del componente
interface Client {
    id: string
    name: string
    email: string
    phone: string
    cedula: string
}

interface EditClientsDialogProps {
    isEditClientDialogOpen: boolean;
    setIsEditClientDialogOpen: (isOpen: boolean) => void;
    editingClient: Client | null;
    setEditingClient: (client: Client | null) => void;
    handleUpdateClient: () => void;
}

function EditClientsDialog(props: EditClientsDialogProps) {
    return (
        <Dialog open={props.isEditClientDialogOpen} onOpenChange={props.setIsEditClientDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        props.handleUpdateClient();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editName" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="editName"
                                value={props.editingClient?.name || ''}
                                onChange={e => {
                                    const newClient = props.editingClient
                                        ? { ...props.editingClient, name: e.target.value }
                                        : null;
                                    props.setEditingClient(newClient);
                                }}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editEmail" className="text-right">
                                Correo
                            </Label>
                            <Input
                                id="editEmail"
                                type="email"
                                value={props.editingClient?.email || ''}
                                onChange={e => {
                                    const newClient = props.editingClient
                                        ? { ...props.editingClient, email: e.target.value }
                                        : null;
                                    props.setEditingClient(newClient);
                                }}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editPhone" className="text-right">
                                Teléfono
                            </Label>
                            <Input
                                id="editPhone"
                                value={props.editingClient?.phone || ''}
                                onChange={e => {
                                    const newClient = props.editingClient
                                        ? { ...props.editingClient, phone: e.target.value }
                                        : null;
                                    props.setEditingClient(newClient);
                                }}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editCedula" className="text-right">
                                Cédula
                            </Label>
                            <Input
                                id="editCedula"
                                value={props.editingClient?.cedula || ''}
                                onChange={e => {
                                    const newClient = props.editingClient
                                        ? { ...props.editingClient, cedula: e.target.value }
                                        : null;
                                    props.setEditingClient(newClient);
                                }}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Actualizar Cliente</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditClientsDialog;
