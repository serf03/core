import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Shield, User as UserIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"

export default function AddUserDialog(prop) {
    const { user } = useAuth()

    const onSubmit = async () => {
        try {
            await handleAddUser(prop.newUser)
            toast.success("Usuario agregado exitosamente")
            // Clear the form after adding
            setNewUser({ name: '', email: '', idAdministrador: `${user?.uid}`, role: "Operador" })
            setIsAddUserDialogOpen(false) // Close the dialog
        } catch (error) {
            console.error("Error adding user: ", error)
            toast.error("Error al agregar el usuario")
        }
    }

    return (
        <Dialog open={prop.isAddUserDialogOpen} onOpenChange={prop.setIsAddUserDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Agregar Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Nombre
                            </Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    id="name"
                                    required
                                    placeholder="Ingrese el nombre completo"
                                    value={prop.newUser.name}
                                    onChange={(e) => setNewUser({ ...prop.newUser, name: e.target.value })}
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
                                    required
                                    placeholder="correo@ejemplo.com"
                                    value={prop.newUser.email}
                                    onChange={(e) => setNewUser({ ...prop.newUser, email: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium">
                                Rol
                            </Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) => setNewUser({ ...prop.newUser, role: value })}
                                >
                                    <SelectTrigger className="pl-10">
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Administrador">Administrador</SelectItem>
                                        <SelectItem value="Facturador">Facturador</SelectItem>
                                        <SelectItem value="Operador">Operador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddUserDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Agregar Usuario</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}