import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Mail, MapPin, Phone, User } from "lucide-react"
import { Client } from "../../lib/types"
interface EditClientsDialogProps {
    isEditClientDialogOpen: boolean
    setIsEditClientDialogOpen: (isOpen: boolean) => void
    editingClient: Client | null
    setEditingClient: (client: Client | null) => void
    handleUpdateClient: () => void
}

function EditClientsDialog(props: EditClientsDialogProps) {
    return (
        <Dialog open={props.isEditClientDialogOpen} onOpenChange={props.setIsEditClientDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Editar Cliente</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        props.handleUpdateClient()
                    }}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="editName" className="text-sm font-medium">
                                Nombre
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="editName"
                                    value={props.editingClient?.name || ""}
                                    onChange={(e) => {
                                        const newClient = props.editingClient
                                            ? { ...props.editingClient, name: e.target.value }
                                            : null
                                        props.setEditingClient(newClient)
                                    }}
                                    className="pl-10"
                                    placeholder="Nombre completo"
                                    aria-label="Nombre del cliente"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editEmail" className="text-sm font-medium">
                                Correo
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="editEmail"
                                    type="email"
                                    value={props.editingClient?.email || ""}
                                    onChange={(e) => {
                                        const newClient = props.editingClient
                                            ? { ...props.editingClient, email: e.target.value }
                                            : null
                                        props.setEditingClient(newClient)
                                    }}
                                    className="pl-10"
                                    placeholder="correo@ejemplo.com"
                                    aria-label="Correo electrónico del cliente"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editPhone" className="text-sm font-medium">
                                Teléfono
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="editPhone"
                                    value={props.editingClient?.phone || ""}
                                    onChange={(e) => {
                                        const newClient = props.editingClient
                                            ? { ...props.editingClient, phone: e.target.value }
                                            : null
                                        props.setEditingClient(newClient)
                                    }}
                                    className="pl-10"
                                    placeholder="123-456-7890"
                                    aria-label="Número de teléfono del cliente"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editCedula" className="text-sm font-medium">
                                Cédula
                            </Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="editCedula"
                                    value={props.editingClient?.cedula || ""}
                                    onChange={(e) => {
                                        const newClient = props.editingClient
                                            ? { ...props.editingClient, cedula: e.target.value }
                                            : null
                                        props.setEditingClient(newClient)
                                    }}
                                    className="pl-10"
                                    placeholder="1234567890"
                                    aria-label="Número de cédula del cliente"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="editAddress" className="text-sm font-medium">
                            Dirección
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                id="editAddress"
                                value={props.editingClient?.direccion || ""}
                                onChange={(e) => {
                                    const newClient = props.editingClient
                                        ? { ...props.editingClient, address: e.target.value }
                                        : null
                                    props.setEditingClient(newClient)
                                }}
                                className="pl-10"
                                placeholder="Calle Principal #123, Ciudad"
                                aria-label="Dirección del cliente"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button type="button" variant="outline" onClick={() => props.setIsEditClientDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Actualizar Cliente</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditClientsDialog