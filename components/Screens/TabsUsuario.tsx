

import * as firebaseServices from '@/lib/firebaseServices'
import { User, UserRole } from '@/lib/types'
import { Edit, Trash, UserPlus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { TabsContent } from '../ui/tabs'
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}


interface TabsUsuarioProps {
  users: User[]
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export default function TabsUsuario({ users, searchTerm, setSearchTerm }: TabsUsuarioProps) {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState<User>({
    name: '', email: '', clave: '', role: 'Facturador', idAdministrador: ''
  });
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = useCallback(async () => {
    try {
      if (!newUser?.name || !newUser?.email || !newUser?.role) {
        throw new Error('Todos los campos son requeridos')
      }
      await firebaseServices.addUser(newUser)
      // setNewUser({ name: '', email: '',})
      setIsAddUserDialogOpen(false)
      toast.success('Usuario agregado exitosamente')
    } catch (error) {
      console.error("Error adding user: ", error)
      toast.error(error instanceof Error ? error.message : "Error al agregar el usuario")
    }
  }, [newUser])

  const handleUpdateUser = useCallback(async () => {
    if (editingUser) {
      try {
        if (!editingUser.name || !editingUser.email || !editingUser.role) {
          throw new Error('Todos los campos son requeridos')
        }
        await firebaseServices.updateUser(editingUser)
        setEditingUser(null)
        setIsEditUserDialogOpen(false)
        toast.success('Usuario actualizado exitosamente')
      } catch (error) {
        console.error("Error updating user: ", error)
        toast.error(error instanceof Error ? error.message : "Error al actualizar el usuario")
      }
    }
  }, [editingUser])

  const handleDeleteUser = useCallback(async (id: string) => {
    try {
      await firebaseServices.deleteUser(id)
      toast.success('Usuario eliminado exitosamente')
    } catch (error) {
      console.error("Error deleting user: ", error)
      toast.error("Error al eliminar el usuario")
    }
  }, [])

  return (
    <TabsContent value="users" className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Agregar Usuario
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>

                    <div className="flex items-center space-x-2">
                      <Avatar className={`h-10 w-10 ${getAvatarColor(user.name)}`}>
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span>    {user.name}</span>
                    </div>



                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => {
                        setEditingUser(user)
                        setIsEditUserDialogOpen(true)
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteUser(user.id || "")}>
                        <Trash className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleAddUser()
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newUser?.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                value={newUser?.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={newUser?.role}
                onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Facturador">Facturador</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>

            </div>
            <Button type="submit">Agregar Usuario</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateUser()
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Correo Electrónico</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Actualizar Usuario</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </TabsContent>
  )
}

