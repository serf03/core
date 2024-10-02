import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// Define la interfaz para los props
interface AddClientsDialogProps {
    isAddClientDialogOpen: boolean;
    setIsAddClientDialogOpen: (open: boolean) => void;
    newClient: {
        name: string;
        email: string;
        phone: string;
        cedula: string;
    };
    setNewClient: (client: {
        name: string;
        email: string;
        phone: string;
        cedula: string;
    }) => void;
    handleAddClient: () => void;
}

const AddClientsDialog: React.FC<AddClientsDialogProps> = (props) => {
    return (
        <Dialog open={props.isAddClientDialogOpen} onOpenChange={props.setIsAddClientDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        props.handleAddClient();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                value={props.newClient.name}
                                onChange={(e) =>
                                    props.setNewClient({
                                        ...props.newClient,
                                        name: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Correo
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={props.newClient.email}
                                onChange={(e) =>
                                    props.setNewClient({
                                        ...props.newClient,
                                        email: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Teléfono
                            </Label>
                            <Input
                                id="phone"
                                value={props.newClient.phone}
                                onChange={(e) =>
                                    props.setNewClient({
                                        ...props.newClient,
                                        phone: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cedula" className="text-right">
                                Cédula
                            </Label>
                            <Input
                                id="cedula"
                                value={props.newClient.cedula}
                                onChange={(e) =>
                                    props.setNewClient({
                                        ...props.newClient,
                                        cedula: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Agregar Cliente</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddClientsDialog;
