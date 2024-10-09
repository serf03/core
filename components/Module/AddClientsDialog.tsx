import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Client } from "@/lib/types";
import { CreditCard, Mail, MapPin, Phone, User } from "lucide-react";
import toast from "react-hot-toast"; // Asegúrate de importar toast
import { useAuth } from "../context/AuthContext";
interface AddClientsDialogProps {
    isAddClientDialogOpen: boolean;
    setIsAddClientDialogOpen: (open: boolean) => void;
    newClient: Omit<Client, 'id'>; // Cambiado para que sea un objeto Client completo
    setNewClient: (client: Client) => void; // Cambiado para aceptar un Client completo
    handleAddClient: (client: Client) => Promise<void>; // Cambiado para aceptar un Client
}

export default function AddClientsDialog({
    isAddClientDialogOpen,
    setIsAddClientDialogOpen,
    newClient,
    setNewClient,
    handleAddClient,
}: AddClientsDialogProps) {
    const { user } = useAuth();
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await handleAddClient(newClient);
            toast.success("Cliente agregado exitosamente");
            // Limpiar el formulario después de agregar
            setNewClient({ name: '', email: '', phone: '', cedula: '', direccion: '', idAdministrador: `${user?.uid}` });
            setIsAddClientDialogOpen(false); // Cerrar el diálogo
        } catch (error) {
            console.error("Error adding client: ", error);
            toast.error("Error al agregar el cliente");
        }
    };

    return (
        <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Agregar Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Nombre
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    id="name"
                                    required
                                    placeholder="Ingrese el nombre completo"
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Correo
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">
                                Teléfono
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    id="phone"
                                    required
                                    placeholder="Ingrese el número de teléfono"
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cedula" className="text-sm font-medium">
                                Cédula
                            </Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    id="cedula"
                                    placeholder="Ingrese el número de cédula"
                                    value={newClient.cedula}
                                    onChange={(e) => setNewClient({ ...newClient, cedula: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="direccion" className="text-sm font-medium">
                                Dirección
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    id="direccion"
                                    placeholder="Ingrese la dirección completa"
                                    value={newClient.direccion}
                                    onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddClientDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Agregar Cliente</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
